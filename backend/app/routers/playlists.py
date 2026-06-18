from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.playlist import Playlist, PlaylistTrack
from app.models.track import Track
from app.models.user import User
from app.schemas.playlist import (
    PlaylistBrief,
    PlaylistCreate,
    PlaylistResponse,
    PlaylistTrackAdd,
    PlaylistUpdate,
)
from app.services.deps import get_current_user

router = APIRouter(prefix="/api/playlists", tags=["playlists"])


def _load_playlist(db: Session, playlist_id: int, user_id: int) -> Playlist:
    pl = db.query(Playlist).filter(
        Playlist.id == playlist_id, Playlist.user_id == user_id
    ).first()
    if not pl:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return pl


@router.get("", response_model=list[PlaylistBrief])
def list_playlists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    playlists = db.query(Playlist).options(
        joinedload(Playlist.playlist_tracks)
    ).filter(Playlist.user_id == current_user.id).all()

    result = []
    for pl in playlists:
        brief = PlaylistBrief(
            id=pl.id,
            name=pl.name,
            is_public=pl.is_public,
            created_at=pl.created_at,
            track_count=len(pl.playlist_tracks),
        )
        result.append(brief)
    return result


@router.post("", response_model=PlaylistResponse, status_code=201)
def create_playlist(
    body: PlaylistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pl = Playlist(user_id=current_user.id, name=body.name, is_public=body.is_public)
    db.add(pl)
    db.commit()
    db.refresh(pl)
    return _get_playlist_with_tracks(db, pl.id)


@router.get("/{playlist_id}", response_model=PlaylistResponse)
def get_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _load_playlist(db, playlist_id, current_user.id)
    return _get_playlist_with_tracks(db, playlist_id)


@router.patch("/{playlist_id}", response_model=PlaylistResponse)
def update_playlist(
    playlist_id: int,
    body: PlaylistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pl = _load_playlist(db, playlist_id, current_user.id)
    if body.name is not None:
        pl.name = body.name
    if body.is_public is not None:
        pl.is_public = body.is_public
    db.commit()
    return _get_playlist_with_tracks(db, pl.id)


@router.delete("/{playlist_id}", status_code=204)
def delete_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pl = _load_playlist(db, playlist_id, current_user.id)
    db.delete(pl)
    db.commit()


@router.post("/{playlist_id}/tracks", status_code=201)
def add_track(
    playlist_id: int,
    body: PlaylistTrackAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pl = _load_playlist(db, playlist_id, current_user.id)
    if not db.query(Track).filter(Track.id == body.track_id).first():
        raise HTTPException(status_code=404, detail="Track not found")

    # prevent duplicates
    exists = db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.track_id == body.track_id,
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="Track already in playlist")

    position = len(pl.playlist_tracks)
    pt = PlaylistTrack(playlist_id=playlist_id, track_id=body.track_id, position=position)
    db.add(pt)
    db.commit()
    return {"ok": True}


@router.delete("/{playlist_id}/tracks/{track_id}", status_code=204)
def remove_track(
    playlist_id: int,
    track_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _load_playlist(db, playlist_id, current_user.id)
    pt = db.query(PlaylistTrack).filter(
        PlaylistTrack.playlist_id == playlist_id,
        PlaylistTrack.track_id == track_id,
    ).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Track not in playlist")
    db.delete(pt)
    db.commit()


def _get_playlist_with_tracks(db: Session, playlist_id: int) -> PlaylistResponse:
    pl = db.query(Playlist).options(
        joinedload(Playlist.playlist_tracks).joinedload(PlaylistTrack.track).joinedload(Track.album),
        joinedload(Playlist.playlist_tracks).joinedload(PlaylistTrack.track).joinedload(Track.artist),
    ).filter(Playlist.id == playlist_id).first()

    tracks = [pt.track for pt in pl.playlist_tracks]
    return PlaylistResponse(
        id=pl.id,
        name=pl.name,
        is_public=pl.is_public,
        created_at=pl.created_at,
        tracks=tracks,
    )
