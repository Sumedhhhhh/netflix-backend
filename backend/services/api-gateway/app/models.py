from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from .database import Base

class User(Base) :

    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Genre(Base) :

    __tablename__ = "genres"
    id = Column(Integer, primary_key=True)
    name = Column(String,unique=True, index=True, nullable=False )


class Video(Base) :

    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String,unique=True, index=True, nullable=False )
    description = Column(Text, nullable=True)
    release_year = Column(Integer, nullable=True)
    duration_s = Column(Integer, nullable=True) # seconds
    thumbnail_url = Column(String, nullable=True)
    # where HLS files live in object storage (MinIO/S3)
    storage_prefix = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True),server_default=func.now())


class VideoGenre(Base) :

    __tablename__ = "video_genres"
    video_id = Column(Integer, ForeignKey("videos.id"), primary_key=True)
    genre_id = Column(Integer, ForeignKey("genres.id"), primary_key=True)


class WatchProgress(Base) :

    __tablename__ = "watch_progress"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    video_id = Column(Integer, ForeignKey("videos.id"), primary_key=True)

    position_s = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True),server_default=func.now(), onupdate=func.now())

    #Fot concurrency safety(no progress regression)
    version = Column(Integer,nullable=False, default=1)

    __table_args__ = (
        UniqueConstraint("user_id", "video_id", name = "uq_user_video_progress"),
    )



