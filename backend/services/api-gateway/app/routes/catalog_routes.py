from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..deps import get_db, get_current_user
from ..models import Video, WatchProgress
from ..schemas_catalog import VideoCreate, VideoOut, ProgressUpdate

router = APIRouter()

# Public-ish browse (still requires auth for now)
@router.get("/videos", response_model=list[VideoOut])
def list_videos(db : Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Video).order_by(Video.created_at.desc()).limit(50).all()

@router.get("/videos/{video_id}", response_model=VideoOut)
def get_video(video_id : int, db : Session = Depends(get_db), user = Depends(get_current_user)):
    v = db.query(Video).filter(Video.id == video_id).first()
    if not v :
        raise HTTPException(status_code=404,detail="Video not found")
    return v


#Admin like end-point
@router.post("/admin/videos", response_model=VideoOut)
def create_video(payload : VideoCreate, db : Session =Depends(get_db), user = Depends(get_current_user)):
    v = Video(**payload.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

@router.post("/progress")
def update_progress(
    body : ProgressUpdate,
    db : Session=Depends(get_db),
    user=Depends(get_current_user)):

    row = db.query(WatchProgress).filter(
        WatchProgress.user_id == user.id,
        WatchProgress.video_id == body.video_id
    ).first()

    if not row :
        row = WatchProgress(
            user_id = user.id,
            video_id = body.video_id,
            position_s = max(0, body.position_s),
            version = 1
        )

        db.add(row)
        db.commit()
        return { "status" : "created" }

    if body.position_s < row.position_s :
        return { "status" : "ignore_stale_update", "current_position_s" : row.position_s }
    
    row.position_s = body.position_s
    row.version += 1
    db.commit()

    return { "staus" : "updated", "position_s" : row.position_s}


@router.get("/me/continue-watching")
def continue_watching(db : Session=Depends(get_db), user=Depends(get_current_user)):
    rows = (
        db.query(WatchProgress, Video)
        .join(Video, Video.id == WatchProgress.video_id)
        .filter(WatchProgress.user_id == user.id)
        .order_by(WatchProgress.updated_at.desc())
        .limit(20)
        .all()
    )

    # returning a simple merged shape
    return [
        {
            "video_id" : v.id,
            "title" : v.title,
            "thumbnail_url" : v.thumbnail_url,
            "duration_s" : v.duration_s,
            "position_s" : p.position_s,
            "updated_at" : p.updated_at
        }

        for (p,v ) in rows
    ]