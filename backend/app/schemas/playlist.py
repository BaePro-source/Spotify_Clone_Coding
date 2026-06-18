from datetime import datetime
from pydantic import BaseModel
from app.schemas.track import TrackResponse


class PlaylistCreate(BaseModel):
    name: str
    is_public: bool = False


class PlaylistUpdate(BaseModel):
    name: str | None = None
    is_public: bool | None = None


class PlaylistTrackAdd(BaseModel):
    track_id: int


class PlaylistResponse(BaseModel):
    id: int
    name: str
    is_public: bool
    created_at: datetime
    tracks: list[TrackResponse] = []

    model_config = {"from_attributes": True}


class PlaylistBrief(BaseModel):
    id: int
    name: str
    is_public: bool
    created_at: datetime
    track_count: int = 0

    model_config = {"from_attributes": True}
