"""
Seed script — populates DB with sample artists, albums, and tracks.
Audio files are NOT downloaded here; place .mp3 files in uploads/audio/ manually
or use the download instructions in README.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import SessionLocal, engine, Base
import app.models  # noqa: registers all ORM models

from app.models.artist import Artist
from app.models.album import Album
from app.models.track import Track
from datetime import date

Base.metadata.create_all(bind=engine)

SEED_DATA = [
    {
        "name": "Broke For Free",
        "image_url": None,
        "albums": [
            {
                "title": "Petal",
                "cover_url": None,
                "release_date": date(2014, 1, 1),
                "tracks": [
                    {"title": "Petal", "duration_seconds": 215, "genre": "Electronic", "audio_file_path": "broke_for_free_petal.mp3"},
                    {"title": "Night Owl", "duration_seconds": 197, "genre": "Electronic", "audio_file_path": "broke_for_free_night_owl.mp3"},
                    {"title": "Leaf", "duration_seconds": 183, "genre": "Electronic", "audio_file_path": "broke_for_free_leaf.mp3"},
                ],
            }
        ],
    },
    {
        "name": "Kevin MacLeod",
        "image_url": None,
        "albums": [
            {
                "title": "Cinematic Classics",
                "cover_url": None,
                "release_date": date(2015, 6, 1),
                "tracks": [
                    {"title": "Impact Moderato", "duration_seconds": 132, "genre": "Cinematic", "audio_file_path": "kevin_impact_moderato.mp3"},
                    {"title": "Cipher", "duration_seconds": 161, "genre": "Cinematic", "audio_file_path": "kevin_cipher.mp3"},
                    {"title": "Anxiety", "duration_seconds": 148, "genre": "Cinematic", "audio_file_path": "kevin_anxiety.mp3"},
                ],
            }
        ],
    },
    {
        "name": "Kai Engel",
        "image_url": None,
        "albums": [
            {
                "title": "Satin",
                "cover_url": None,
                "release_date": date(2016, 3, 1),
                "tracks": [
                    {"title": "Satin", "duration_seconds": 241, "genre": "Ambient", "audio_file_path": "kai_satin.mp3"},
                    {"title": "Snowfall", "duration_seconds": 198, "genre": "Ambient", "audio_file_path": "kai_snowfall.mp3"},
                    {"title": "Hope", "duration_seconds": 223, "genre": "Ambient", "audio_file_path": "kai_hope.mp3"},
                ],
            }
        ],
    },
    {
        "name": "Chris Zabriskie",
        "image_url": None,
        "albums": [
            {
                "title": "Divider",
                "cover_url": None,
                "release_date": date(2014, 9, 1),
                "tracks": [
                    {"title": "Is That You or Are You You", "duration_seconds": 265, "genre": "Ambient", "audio_file_path": "chris_is_that_you.mp3"},
                    {"title": "Divider", "duration_seconds": 312, "genre": "Ambient", "audio_file_path": "chris_divider.mp3"},
                ],
            }
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        # skip if already seeded
        if db.query(Artist).count() > 0:
            print("Database already seeded, skipping.")
            return

        for artist_data in SEED_DATA:
            artist = Artist(name=artist_data["name"], image_url=artist_data["image_url"])
            db.add(artist)
            db.flush()

            for album_data in artist_data["albums"]:
                album = Album(
                    title=album_data["title"],
                    artist_id=artist.id,
                    cover_url=album_data["cover_url"],
                    release_date=album_data["release_date"],
                )
                db.add(album)
                db.flush()

                for track_data in album_data["tracks"]:
                    track = Track(
                        title=track_data["title"],
                        album_id=album.id,
                        artist_id=artist.id,
                        duration_seconds=track_data["duration_seconds"],
                        genre=track_data["genre"],
                        audio_file_path=track_data["audio_file_path"],
                    )
                    db.add(track)

        db.commit()
        print(f"Seeded {len(SEED_DATA)} artists successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
