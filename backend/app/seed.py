"""
시드 스크립트 — app/data/seed_tracks.json을 읽어 DB를 초기화합니다.
Jamendo API 호출 없음. 인터넷 연결이나 API 키 불필요.

데모 계정(demo@test.com / demo1234)과 플레이리스트·좋아요·재생기록도 함께 생성합니다.
idempotent: 이미 데이터가 있으면 해당 단계를 skip합니다.
"""
import json
import os
import sys
from datetime import date, datetime, timezone

import bcrypt

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import Base, SessionLocal, engine
import app.models  # noqa — 모든 모델 등록

from app.models.album import Album
from app.models.artist import Artist
from app.models.history import PlayHistory
from app.models.like import Like
from app.models.playlist import Playlist, PlaylistTrack
from app.models.track import Track
from app.models.user import User

Base.metadata.create_all(bind=engine)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "seed_tracks.json")

DEMO_EMAIL = "demo@test.com"
DEMO_PASSWORD = "demo1234"
DEMO_USERNAME = "demo"


# ── 트랙 / 아티스트 / 앨범 시딩 ──────────────────────────────────────────────

def seed_tracks(db) -> list[Track]:
    if db.query(Artist).count() > 0:
        print("트랙 데이터 이미 존재 — skip")
        return db.query(Track).all()

    with open(DATA_PATH, encoding="utf-8") as f:
        records = json.load(f)

    artists_map: dict = {}
    albums_map: dict = {}

    for r in records:
        j_artist_id = r["artist_id"]
        j_album_id = r["album_id"]

        if j_artist_id not in artists_map:
            artist = Artist(name=r["artist_name"], image_url=r.get("cover_url") or None)
            db.add(artist)
            db.flush()
            artists_map[j_artist_id] = artist

        artist = artists_map[j_artist_id]

        if j_album_id not in albums_map:
            album = Album(
                title=r["album_name"],
                artist_id=artist.id,
                cover_url=r.get("cover_url") or None,
                release_date=date.today(),
            )
            db.add(album)
            db.flush()
            albums_map[j_album_id] = album

        album = albums_map[j_album_id]

        db.add(Track(
            title=r["title"],
            album_id=album.id,
            artist_id=artist.id,
            duration_seconds=int(r.get("duration", 0)),
            audio_file_path=r.get("audio_url", ""),
            genre=r.get("genre", "Unknown"),
        ))

    db.commit()
    print(f"트랙 시드 완료: {len(records)}곡, {len(artists_map)}명, {len(albums_map)}개 앨범")
    return db.query(Track).all()


# ── 데모 유저 시딩 ────────────────────────────────────────────────────────────

def seed_demo_user(db, tracks: list[Track]) -> None:
    existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if existing:
        print("데모 유저 이미 존재 — skip")
        return

    password_hash = bcrypt.hashpw(DEMO_PASSWORD.encode(), bcrypt.gensalt()).decode()
    demo = User(email=DEMO_EMAIL, username=DEMO_USERNAME, password_hash=password_hash)
    db.add(demo)
    db.flush()

    # 장르별로 트랙 분류
    def pick(genre_keyword: str, n: int) -> list[Track]:
        filtered = [t for t in tracks if genre_keyword.lower() in (t.genre or "").lower()]
        return (filtered + tracks)[:n]  # 부족하면 앞에서 채움

    pop_tracks = pick("Pop", 10)
    electronic_tracks = pick("Electronic", 8)
    jazz_tracks = pick("Jazz", 7)
    hiphop_tracks = pick("Hiphop", 7)
    all_picks = pick("", 10)

    # 플레이리스트 3개
    playlists_data = [
        ("My Pop Favorites", True, pop_tracks[:8]),
        ("Electronic Vibes", True, electronic_tracks[:7]),
        ("Late Night Jazz", False, jazz_tracks[:6]),
    ]

    for pl_name, is_public, pl_tracks in playlists_data:
        pl = Playlist(user_id=demo.id, name=pl_name, is_public=is_public)
        db.add(pl)
        db.flush()
        for pos, track in enumerate(pl_tracks):
            db.add(PlaylistTrack(playlist_id=pl.id, track_id=track.id, position=pos))

    # 좋아요 8곡
    liked = list({t.id: t for t in (pop_tracks[:3] + electronic_tracks[:3] + hiphop_tracks[:2])}.values())
    for track in liked[:8]:
        db.add(Like(user_id=demo.id, track_id=track.id))

    # 재생 기록 10건
    for i, track in enumerate(all_picks[:10]):
        db.add(PlayHistory(
            user_id=demo.id,
            track_id=track.id,
            played_at=datetime(2026, 6, 20 - i, 12, 0, 0, tzinfo=timezone.utc),
        ))

    db.commit()
    print(f"데모 유저 생성 완료: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    print(f"  플레이리스트 3개 / 좋아요 {len(liked[:8])}곡 / 재생기록 10건")


# ── 진입점 ────────────────────────────────────────────────────────────────────

def seed() -> None:
    db = SessionLocal()
    try:
        tracks = seed_tracks(db)
        seed_demo_user(db, tracks)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
