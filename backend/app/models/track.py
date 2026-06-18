from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Track(Base):
    __tablename__ = "tracks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    album_id: Mapped[int] = mapped_column(ForeignKey("albums.id"), nullable=False)
    artist_id: Mapped[int] = mapped_column(ForeignKey("artists.id"), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    audio_file_path: Mapped[str | None] = mapped_column(String(500))
    genre: Mapped[str | None] = mapped_column(String(100), index=True)

    album = relationship("Album", back_populates="tracks")
    artist = relationship("Artist", back_populates="tracks")
    playlist_tracks = relationship("PlaylistTrack", back_populates="track", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="track", cascade="all, delete-orphan")
    play_history = relationship("PlayHistory", back_populates="track", cascade="all, delete-orphan")
