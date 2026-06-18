from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.history import PlayHistory
from app.models.track import Track
from app.models.user import User
from app.schemas.history import HistoryAdd, HistoryResponse
from app.services.deps import get_current_user

router = APIRouter(prefix="/api/history", tags=["history"])


@router.post("", status_code=201)
def add_history(
    body: HistoryAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Track).filter(Track.id == body.track_id).first():
        raise HTTPException(status_code=404, detail="Track not found")
    entry = PlayHistory(user_id=current_user.id, track_id=body.track_id)
    db.add(entry)
    db.commit()
    return {"ok": True}


@router.get("", response_model=list[HistoryResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entries = (
        db.query(PlayHistory)
        .options(
            joinedload(PlayHistory.track).joinedload(Track.album),
            joinedload(PlayHistory.track).joinedload(Track.artist),
        )
        .filter(PlayHistory.user_id == current_user.id)
        .order_by(PlayHistory.played_at.desc())
        .limit(50)
        .all()
    )
    return entries
