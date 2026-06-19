"""
Seed script — Jamendo API에서 트랙을 가져와 DB에 삽입합니다.
JAMENDO_CLIENT_ID 환경변수가 없으면 로컬 파일 기반 샘플 데이터로 대체합니다.
"""
import sys
import os
import json
import urllib.request
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import SessionLocal, engine, Base
import app.models  # noqa

from app.models.artist import Artist
from app.models.album import Album
from app.models.track import Track
from datetime import date

Base.metadata.create_all(bind=engine)

# Jamendo에서 가져올 장르와 곡 수 (총 ~300곡)
JAMENDO_GENRES = [
    ("electronic",   30),
    ("ambient",      30),
    ("pop",          30),
    ("rock",         30),
    ("jazz",         20),
    ("classical",    20),
    ("hiphop",       20),
    ("folk",         20),
    ("metal",        20),
    ("chillout",     20),
    ("acoustic",     20),
    ("indie",        20),
    ("dance",        20),
    ("blues",        15),
    ("reggae",       15),
]


def fetch_jamendo_tracks(client_id: str, tags: str, limit: int) -> list:
    params = urllib.parse.urlencode({
        "client_id":    client_id,
        "format":       "json",
        "limit":        limit,
        "tags":         tags,
        "audioformat":  "mp31",
        "include":      "musicinfo",
        "boost":        "popularity_total",  # 인기순 정렬
    })
    url = f"https://api.jamendo.com/v3.0/tracks/?{params}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read())
        return data.get("results", [])
    except Exception as e:
        print(f"  [Jamendo] {tags} 요청 실패: {e}")
        return []


def seed_from_jamendo(db, client_id: str) -> bool:
    print("Jamendo API에서 트랙을 가져오는 중...")

    raw_tracks: list = []
    for tags, limit in JAMENDO_GENRES:
        tracks = fetch_jamendo_tracks(client_id, tags, limit)
        print(f"  {tags}: {len(tracks)}곡")
        raw_tracks.extend(tracks)

    # track id 기준 중복 제거
    seen: dict = {}
    for t in raw_tracks:
        seen.setdefault(t["id"], t)
    raw_tracks = list(seen.values())

    if not raw_tracks:
        print("Jamendo에서 가져온 트랙이 없습니다.")
        return False

    artists_map: dict = {}   # jamendo artist_id → Artist ORM
    albums_map:  dict = {}   # jamendo album_id  → Album  ORM

    for t in raw_tracks:
        j_artist_id = t["artist_id"]
        j_album_id  = t["album_id"]

        if j_artist_id not in artists_map:
            artist = Artist(name=t["artist_name"], image_url=None)
            db.add(artist)
            db.flush()
            artists_map[j_artist_id] = artist

        artist = artists_map[j_artist_id]

        if j_album_id not in albums_map:
            album = Album(
                title=t["album_name"],
                artist_id=artist.id,
                cover_url=t.get("image"),
                release_date=date.today(),
            )
            db.add(album)
            db.flush()
            albums_map[j_album_id] = album

        album = albums_map[j_album_id]

        genres_list = t.get("musicinfo", {}).get("tags", {}).get("genres", [])
        genre_str = genres_list[0].capitalize() if genres_list else "Unknown"

        track = Track(
            title=t["name"],
            album_id=album.id,
            artist_id=artist.id,
            duration_seconds=int(t.get("duration", 0)),
            audio_file_path=t.get("audio", ""),   # Jamendo 스트림 URL
            genre=genre_str,
        )
        db.add(track)

    db.commit()
    print(f"Jamendo 시드 완료: {len(raw_tracks)}곡, {len(artists_map)}명, {len(albums_map)}개 앨범")
    return True


# ── 로컬 파일 기반 fallback ────────────────────────────────────────────────
FALLBACK_DATA = [
    {
        "name": "Broke For Free", "image_url": None,
        "albums": [{
            "title": "Petal", "cover_url": None, "release_date": date(2014, 1, 1),
            "tracks": [
                {"title": "Petal",     "duration_seconds": 215, "genre": "Electronic", "audio_file_path": "broke_for_free_petal.mp3"},
                {"title": "Night Owl", "duration_seconds": 197, "genre": "Electronic", "audio_file_path": "broke_for_free_night_owl.mp3"},
                {"title": "Leaf",      "duration_seconds": 183, "genre": "Electronic", "audio_file_path": "broke_for_free_leaf.mp3"},
            ],
        }],
    },
    {
        "name": "Kevin MacLeod", "image_url": None,
        "albums": [{
            "title": "Cinematic Classics", "cover_url": None, "release_date": date(2015, 6, 1),
            "tracks": [
                {"title": "Impact Moderato", "duration_seconds": 132, "genre": "Cinematic", "audio_file_path": "kevin_impact_moderato.mp3"},
                {"title": "Cipher",          "duration_seconds": 161, "genre": "Cinematic", "audio_file_path": "kevin_cipher.mp3"},
                {"title": "Anxiety",         "duration_seconds": 148, "genre": "Cinematic", "audio_file_path": "kevin_anxiety.mp3"},
            ],
        }],
    },
    {
        "name": "Kai Engel", "image_url": None,
        "albums": [{
            "title": "Satin", "cover_url": None, "release_date": date(2016, 3, 1),
            "tracks": [
                {"title": "Satin",    "duration_seconds": 241, "genre": "Ambient", "audio_file_path": "kai_satin.mp3"},
                {"title": "Snowfall", "duration_seconds": 198, "genre": "Ambient", "audio_file_path": "kai_snowfall.mp3"},
                {"title": "Hope",     "duration_seconds": 223, "genre": "Ambient", "audio_file_path": "kai_hope.mp3"},
            ],
        }],
    },
    {
        "name": "Chris Zabriskie", "image_url": None,
        "albums": [{
            "title": "Divider", "cover_url": None, "release_date": date(2014, 9, 1),
            "tracks": [
                {"title": "Is That You or Are You You", "duration_seconds": 265, "genre": "Ambient", "audio_file_path": "chris_is_that_you.mp3"},
                {"title": "Divider",                   "duration_seconds": 312, "genre": "Ambient", "audio_file_path": "chris_divider.mp3"},
            ],
        }],
    },
]


def seed_fallback(db) -> None:
    print("JAMENDO_CLIENT_ID 없음 — 로컬 파일 기반 샘플 데이터로 시드합니다.")
    for artist_data in FALLBACK_DATA:
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
                db.add(Track(
                    title=track_data["title"],
                    album_id=album.id,
                    artist_id=artist.id,
                    duration_seconds=track_data["duration_seconds"],
                    genre=track_data["genre"],
                    audio_file_path=track_data["audio_file_path"],
                ))
    db.commit()
    print(f"로컬 시드 완료: {len(FALLBACK_DATA)}명의 아티스트")


def seed() -> None:
    db = SessionLocal()
    try:
        if db.query(Artist).count() > 0:
            print("이미 시드된 DB입니다. 건너뜁니다.")
            return

        client_id = os.environ.get("JAMENDO_CLIENT_ID", "").strip()
        if client_id:
            success = seed_from_jamendo(db, client_id)
            if not success:
                seed_fallback(db)
        else:
            seed_fallback(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
