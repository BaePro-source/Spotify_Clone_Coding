from datetime import datetime
from pydantic import BaseModel
from app.schemas.track import TrackResponse


class HistoryAdd(BaseModel):
    track_id: int


class HistoryResponse(BaseModel):
    id: int
    played_at: datetime
    track: TrackResponse

    model_config = {"from_attributes": True}
