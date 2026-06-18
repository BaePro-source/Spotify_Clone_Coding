from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Artist(Base):
    __tablename__ = "artists"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    image_url: Mapped[str | None] = mapped_column(String(500))

    albums = relationship("Album", back_populates="artist")
    tracks = relationship("Track", back_populates="artist")
