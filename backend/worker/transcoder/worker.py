import json
import logging
import os
import shutil
import subprocess
import tempfile

import redis
from minio import Minio

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "admin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "password123")
OUTPUT_BUCKET = os.getenv("OUTPUT_BUCKET", "videos")

# Quality ladder: (label, scale_filter, video_bitrate, audio_bitrate)
QUALITIES = [
    ("360p",  "scale=640:360",   "800k",  "96k"),
    ("720p",  "scale=1280:720",  "2800k", "128k"),
    ("1080p", "scale=1920:1080", "5000k", "192k"),
]

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
minio_client = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY, secret_key=MINIO_SECRET_KEY, secure=False)


def ensure_bucket(bucket: str) -> None:
    if not minio_client.bucket_exists(bucket):
        minio_client.make_bucket(bucket)
        # Allow public read so the player can fetch HLS directly
        policy = json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket}/*"],
            }],
        })
        minio_client.set_bucket_policy(bucket, policy)


def download_input(bucket: str, object_name: str, dest_path: str) -> None:
    log.info(f"Downloading s3://{bucket}/{object_name}")
    minio_client.fget_object(bucket, object_name, dest_path)


def transcode(input_path: str, work_dir: str) -> None:
    """Run FFmpeg to produce HLS variants for each quality."""
    for label, scale, vbr, abr in QUALITIES:
        out_dir = os.path.join(work_dir, label)
        os.makedirs(out_dir, exist_ok=True)
        playlist = os.path.join(out_dir, "index.m3u8")

        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-vf", scale,
            "-c:v", "libx264", "-b:v", vbr, "-preset", "fast",
            "-c:a", "aac", "-b:a", abr,
            "-hls_time", "6",
            "-hls_playlist_type", "vod",
            "-hls_segment_filename", os.path.join(out_dir, "seg%03d.ts"),
            playlist,
        ]
        log.info(f"Transcoding → {label}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg failed for {label}:\n{result.stderr}")


def write_master_playlist(work_dir: str) -> str:
    """Build a master HLS playlist that references each variant."""
    lines = ["#EXTM3U", "#EXT-X-VERSION:3"]
    bandwidth_map = {"360p": 896000, "720p": 2928000, "1080p": 5192000}
    resolution_map = {"360p": "640x360", "720p": "1280x720", "1080p": "1920x1080"}

    for label, _, _, _ in QUALITIES:
        variant_path = os.path.join(work_dir, label, "index.m3u8")
        if not os.path.exists(variant_path):
            continue
        bw = bandwidth_map[label]
        res = resolution_map[label]
        lines.append(f'#EXT-X-STREAM-INF:BANDWIDTH={bw},RESOLUTION={res}')
        lines.append(f"{label}/index.m3u8")

    master_path = os.path.join(work_dir, "master.m3u8")
    with open(master_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    return master_path


def upload_hls(work_dir: str, output_prefix: str) -> None:
    """Walk the work directory and upload every HLS file to MinIO."""
    ensure_bucket(OUTPUT_BUCKET)
    for root, _, files in os.walk(work_dir):
        for fname in files:
            local_path = os.path.join(root, fname)
            rel_path = os.path.relpath(local_path, work_dir)
            object_name = f"{output_prefix}/{rel_path}"
            content_type = "application/x-mpegURL" if fname.endswith(".m3u8") else "video/MP2T"
            log.info(f"Uploading {object_name}")
            minio_client.fput_object(OUTPUT_BUCKET, object_name, local_path, content_type=content_type)


def process_job(job: dict) -> None:
    input_bucket = job["input_bucket"]
    input_object = job["input_object"]
    output_prefix = job["output_prefix"]
    video_id = job.get("video_id")

    log.info(f"Processing video_id={video_id} | {input_bucket}/{input_object} → {output_prefix}")

    with tempfile.TemporaryDirectory() as tmp:
        ext = input_object.rsplit(".", 1)[-1] if "." in input_object else "mp4"
        input_path = os.path.join(tmp, f"input.{ext}")
        work_dir = os.path.join(tmp, "hls")
        os.makedirs(work_dir)

        download_input(input_bucket, input_object, input_path)
        transcode(input_path, work_dir)
        write_master_playlist(work_dir)
        upload_hls(work_dir, output_prefix)

    log.info(f"Done — video_id={video_id} is ready at {output_prefix}/master.m3u8")


def main() -> None:
    log.info("Worker started — waiting for jobs on 'transcoding_queue'")
    while True:
        item = redis_client.brpop("transcoding_queue", timeout=0)
        if item is None:
            continue
        _, raw = item
        try:
            job = json.loads(raw)
            process_job(job)
        except Exception as exc:
            log.error(f"Job failed: {exc}", exc_info=True)


if __name__ == "__main__":
    main()
