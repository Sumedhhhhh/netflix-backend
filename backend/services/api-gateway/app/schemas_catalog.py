from pydantic import BaseModel
from typing import Optional

class VideoCreate(BaseModel):
    title : str
    description : Optional[str] = None
    release_year : Optional[int] = None
    duration_s : Optional[int] = None
    thumbnail_url : Optional[str] = None
    storage_prefix : Optional[str] = None

class VideoOut(BaseModel) :
    id : int
    title : str
    description : Optional[str] = None
    release_year : Optional[int] = None
    duration_S : Optional[int] = None
    thumbnail_url : Optional[str] = None
    storage_prefix : Optional[str] = None

    class Config :
        from_attributes = True

class ProgressUpdate(BaseModel):
    video_id: int
    position_s : int