from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import uuid
import json
import io
import redis

from ..deps import get_db, get_current_user
from ..models import Video
from ..schemas_catalog import VideoOut
from minio import Minio, S3Error
from ..config import REDIS_URL

router = APIRouter()

RAW_BUCKET = "raw-uploads"

# Minio Client
minio_client = Minio(
    "minio:9000",
    access_key="admin",
    secret_key="password123",
    secure=False,
)

# Redis Client
redis_client = redis.Redis.from_url(REDIS_URL)


@router.post("/upload", response_model=VideoOut)
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(None),
    release_year: int = Form(None),
    duration_s: int = Form(None),
    thumbnail_url: str = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    video_id = str(uuid.uuid4())

    # Ensure bucket exists
    try:
        if not minio_client.bucket_exists(RAW_BUCKET):
            minio_client.make_bucket(RAW_BUCKET)
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"Storage init error: {e}")

    # Derive extension from original filename
    filename = file.filename or "upload.mp4"
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "mp4"
    object_name = f"{video_id}/original.{ext}"

    # Read and upload to MinIO
    data = await file.read()
    try:
        minio_client.put_object(
            RAW_BUCKET,
            object_name,
            io.BytesIO(data),
            length=len(data),
            content_type=file.content_type or "video/mp4",
        )
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

    # Create DB record — storage_prefix is where the worker will write HLS output
    storage_prefix = f"videos/{video_id}"
    video = Video(
        title=title,
        description=description,
        release_year=release_year,
        duration_s=duration_s,
        thumbnail_url=thumbnail_url,
        storage_prefix=storage_prefix,
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    # Push transcoding job to Redis queue
    redis_client.lpush("transcoding_queue", json.dumps({
        "video_id": video.id,
        "input_bucket": RAW_BUCKET,
        "input_object": object_name,
        "output_prefix": storage_prefix,
    }))

    return video
