from datetime import date
from pydantic import BaseModel


class ArtistBrief(BaseModel):
    id: int
    name: str
    image_url: str | None

    model_config = {"from_attributes": True}


class AlbumBrief(BaseModel):
    id: int
    title: str
    cover_url: str | None
    release_date: date | None

    model_config = {"from_attributes": True}


class TrackResponse(BaseModel):
    id: int
    title: str
    duration_seconds: int
    genre: str | None
    audio_file_path: str | None
    album: AlbumBrief
    artist: ArtistBrief

    model_config = {"from_attributes": True}


class ArtistDetail(BaseModel):
    id: int
    name: str
    image_url: str | None
    albums: list[AlbumBrief]
    tracks: list["TrackResponse"]

    model_config = {"from_attributes": True}


class AlbumDetail(BaseModel):
    id: int
    title: str
    cover_url: str | None
    release_date: date | None
    artist: ArtistBrief
    tracks: list["TrackResponse"]

    model_config = {"from_attributes": True}
