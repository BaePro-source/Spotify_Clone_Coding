from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.like import Like
from app.models.track import Track
from app.models.user import User
from app.schemas.track import TrackResponse
from app.services.deps import get_current_user

router = APIRouter(prefix="/api/likes", tags=["likes"])


@router.post("/{track_id}")
def toggle_like(
    track_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Track).filter(Track.id == track_id).first():
        raise HTTPException(status_code=404, detail="Track not found")

    existing = db.query(Like).filter(
        Like.user_id == current_user.id, Like.track_id == track_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False}

    like = Like(user_id=current_user.id, track_id=track_id)
    db.add(like)
    db.commit()
    return {"liked": True}


@router.get("", response_model=list[TrackResponse])
def get_liked_tracks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    likes = db.query(Like).filter(Like.user_id == current_user.id).all()
    track_ids = [l.track_id for l in likes]
    tracks = db.query(Track).options(
        joinedload(Track.album), joinedload(Track.artist)
    ).filter(Track.id.in_(track_ids)).all()
    return tracks
