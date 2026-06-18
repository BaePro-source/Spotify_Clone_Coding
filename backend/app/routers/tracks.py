import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.db import get_db
from app.models.album import Album
from app.models.artist import Artist
from app.models.track import Track
from app.schemas.track import AlbumDetail, ArtistDetail, TrackResponse

router = APIRouter(prefix="/api", tags=["tracks"])


@router.get("/tracks", response_model=list[TrackResponse])
def list_tracks(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Track).options(
        joinedload(Track.album),
        joinedload(Track.artist),
    )
    if q:
        pattern = f"%{q}%"
        query = query.join(Artist).filter(
            Track.title.ilike(pattern) | Artist.name.ilike(pattern)
        )
    return query.all()


@router.get("/tracks/{track_id}", response_model=TrackResponse)
def get_track(track_id: int, db: Session = Depends(get_db)):
    track = db.query(Track).options(
        joinedload(Track.album), joinedload(Track.artist)
    ).filter(Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return track


@router.get("/tracks/{track_id}/stream")
def stream_track(track_id: int, request: Request, db: Session = Depends(get_db)):
    track = db.query(Track).filter(Track.id == track_id).first()
    if not track or not track.audio_file_path:
        raise HTTPException(status_code=404, detail="Audio not found")

    audio_path = Path(settings.audio_upload_dir) / track.audio_file_path
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")

    file_size = audio_path.stat().st_size
    range_header = request.headers.get("range")

    if range_header:
        # Range: bytes=start-end
        range_val = range_header.replace("bytes=", "")
        start_str, _, end_str = range_val.partition("-")
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1
        end = min(end, file_size - 1)
        chunk_size = end - start + 1

        def iter_file():
            with open(audio_path, "rb") as f:
                f.seek(start)
                remaining = chunk_size
                while remaining > 0:
                    data = f.read(min(65536, remaining))
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        return StreamingResponse(
            iter_file(),
            status_code=206,
            media_type="audio/mpeg",
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(chunk_size),
            },
        )

    def iter_full():
        with open(audio_path, "rb") as f:
            while chunk := f.read(65536):
                yield chunk

    return StreamingResponse(
        iter_full(),
        media_type="audio/mpeg",
        headers={
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
        },
    )


@router.get("/artists/{artist_id}", response_model=ArtistDetail)
def get_artist(artist_id: int, db: Session = Depends(get_db)):
    artist = db.query(Artist).options(
        joinedload(Artist.albums),
        joinedload(Artist.tracks).joinedload(Track.album),
        joinedload(Artist.tracks).joinedload(Track.artist),
    ).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist


@router.get("/albums/{album_id}", response_model=AlbumDetail)
def get_album(album_id: int, db: Session = Depends(get_db)):
    album = db.query(Album).options(
        joinedload(Album.artist),
        joinedload(Album.tracks).joinedload(Track.artist),
        joinedload(Album.tracks).joinedload(Track.album),
    ).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    return album
