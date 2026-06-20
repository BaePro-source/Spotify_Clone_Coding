"""
Jamendo API에서 트랙 데이터를 수집해 backend/app/data/seed_tracks.json에 저장하는 스크립트.

개발자가 시드 데이터를 새로 갱신하고 싶을 때만 수동 실행합니다.
앱 구동 시나 CI에서 자동 실행되지 않습니다.

사용법:
    cd backend
    JAMENDO_CLIENT_ID=your_id python scripts/fetch_jamendo_data.py

    또는 .env 파일이 있으면 자동으로 읽습니다.
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

# .env 파일에서 환경변수 로드 (python-dotenv 없이 직접 파싱)
def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


SCRIPT_DIR = Path(__file__).parent
BACKEND_DIR = SCRIPT_DIR.parent
load_dotenv(BACKEND_DIR / ".env")

CLIENT_ID = os.environ.get("JAMENDO_CLIENT_ID", "").strip()
if not CLIENT_ID:
    print("ERROR: JAMENDO_CLIENT_ID 환경변수가 없습니다.")
    print("  export JAMENDO_CLIENT_ID=your_id  또는  backend/.env 에 설정하세요.")
    sys.exit(1)

OUTPUT_PATH = BACKEND_DIR / "app" / "data" / "seed_tracks.json"

GENRES = [
    ("pop",        30),
    ("electronic", 30),
    ("hiphop",     25),
    ("jazz",       25),
    ("rock",       25),
    ("ambient",    20),
    ("folk",       20),
    ("classical",  20),
    ("dance",      20),
    ("acoustic",   15),
]


def fetch(tags: str, limit: int) -> list:
    params = urllib.parse.urlencode({
        "client_id":   CLIENT_ID,
        "format":      "json",
        "limit":       limit,
        "tags":        tags,
        "audioformat": "mp31",
        "include":     "musicinfo",
        "boost":       "popularity_total",
    })
    url = f"https://api.jamendo.com/v3.0/tracks/?{params}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read())
        results = data.get("results", [])
        print(f"  {tags:12s}: {len(results)}곡")
        return results
    except Exception as e:
        print(f"  {tags:12s}: 실패 — {e}")
        return []


def main() -> None:
    print(f"Jamendo API 호출 중... (client_id={CLIENT_ID[:4]}****)")
    raw: list = []
    for tags, limit in GENRES:
        raw.extend(fetch(tags, limit))

    # track id 기준 중복 제거
    seen: dict = {}
    for t in raw:
        seen.setdefault(t["id"], t)
    unique = list(seen.values())
    print(f"\n중복 제거 후: {len(unique)}곡 / {len(seen)} 아티스트 후보")

    records = []
    for t in unique:
        genres_list = t.get("musicinfo", {}).get("tags", {}).get("genres", [])
        genre = genres_list[0].capitalize() if genres_list else "Unknown"
        records.append({
            "jamendo_id":   t["id"],
            "title":        t["name"],
            "artist_name":  t["artist_name"],
            "artist_id":    t["artist_id"],
            "album_name":   t["album_name"],
            "album_id":     t["album_id"],
            "duration":     int(t.get("duration", 0)),
            "genre":        genre,
            "audio_url":    t.get("audio", ""),
            "cover_url":    t.get("image", ""),
        })

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2))
    print(f"\n저장 완료: {OUTPUT_PATH}  ({len(records)}곡)")


if __name__ == "__main__":
    main()
