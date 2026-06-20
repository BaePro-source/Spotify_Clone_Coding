# Spotify Clone

Spotify의 핵심 기능을 구현한 풀스택 음악 스트리밍 웹 애플리케이션입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | FastAPI, SQLAlchemy 2.0, PostgreSQL, python-jose (JWT), bcrypt |
| Frontend | React 19, Vite, Tailwind CSS, Zustand, React Router v6, Axios |
| 인프라 | Docker, Docker Compose |

## 주요 기능

- **회원가입 / 로그인** — JWT 기반 인증
- **음악 스트리밍** — HTTP Range Request 지원 (seekbar 동작)
- **검색** — 트랙명 / 아티스트명으로 검색
- **플레이리스트** — 생성, 수정, 삭제, 트랙 추가/제거
- **좋아요** — 트랙 좋아요 / 취소
- **재생 기록** — 재생한 트랙 자동 기록

## 실행 방법

```bash
docker compose up --build
```

브라우저에서 `http://localhost:3001` 접속

> 백엔드 API: `http://localhost:8000`  
> API 문서 (Swagger): `http://localhost:8000/docs`

### 데모 계정으로 바로 시작하기

별도 회원가입 없이 아래 계정으로 로그인하면 플레이리스트·좋아요·재생기록이 미리 채워진 상태로 확인할 수 있습니다.

| 항목 | 값 |
|------|----|
| Email | `demo@test.com` |
| Password | `demo1234` |

포함된 데모 데이터:
- 플레이리스트 3개 (My Pop Favorites / Electronic Vibes / Late Night Jazz, 각각 6~8곡)
- 좋아요 8곡
- 재생 기록 10건

직접 회원가입해서 새 계정으로도 테스트할 수 있습니다.

별도 API 키나 외부 서비스 가입 없이 위 단계만으로 전체 기능(검색, 재생, 플레이리스트, 좋아요, 재생기록)을 확인할 수 있습니다.

---

## 프로젝트 구조

```
spotify_clone/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── scripts/
│   │   └── fetch_jamendo_data.py   # 시드 데이터 갱신 전용 (수동 실행)
│   └── app/
│       ├── main.py          # FastAPI 앱, CORS 설정
│       ├── config.py        # 환경변수 (pydantic-settings)
│       ├── db.py            # SQLAlchemy 엔진/세션
│       ├── seed.py          # 초기 데이터 삽입 (JSON 기반, API 키 불필요)
│       ├── data/
│       │   └── seed_tracks.json    # 캐싱된 Jamendo 트랙 데이터 (git 포함)
│       ├── models/          # ORM 모델 (User, Artist, Album, Track, Playlist, Like, PlayHistory)
│       ├── routers/         # API 라우터 (auth, tracks, playlists, likes, history)
│       ├── schemas/         # Pydantic 요청/응답 스키마
│       └── services/        # 비즈니스 로직 (JWT 인증, 의존성 주입)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── App.jsx          # 라우팅, 인증 가드, 레이아웃
        ├── pages/           # 8개 페이지
        ├── components/      # Sidebar, Player, TrackList, TrackRow
        ├── api/             # Axios 클라이언트 + 리소스별 API 함수
        └── store/           # Zustand 상태 (authStore, playerStore)
```

## 로컬 개발 환경

**백엔드**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python app/seed.py
uvicorn app.main:app --reload --port 8000
```

**프론트엔드**

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 환경변수

`backend/.env.example`을 복사해 `backend/.env`로 생성 후 값을 설정합니다.

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| `DATABASE_URL` | PostgreSQL 연결 URL | 필수 |
| `JWT_SECRET` | JWT 서명 비밀키 (운영 환경에서 반드시 변경) | 필수 |
| `JWT_ALGORITHM` | JWT 알고리즘 | 기본값 `HS256` |
| `JWT_EXPIRE_MINUTES` | 토큰 만료 시간 (분) | 기본값 `10080` (7일) |
| `AUDIO_UPLOAD_DIR` | 오디오 파일 저장 경로 | 기본값 `uploads/audio` |
| `JAMENDO_CLIENT_ID` | **앱 실행·시딩에 불필요.** `scripts/fetch_jamendo_data.py`로 시드 데이터를 새로 갱신할 때만 사용 | 선택 |

## 시드 데이터 출처

`app/data/seed_tracks.json`에 포함된 음원 데이터는 [Jamendo API](https://developer.jamendo.com/)를 통해 수집한 **Creative Commons 라이선스** 트랙입니다 (225곡, 23개 장르).

데이터를 새로 갱신하려면:

```bash
cd backend
JAMENDO_CLIENT_ID=your_client_id python scripts/fetch_jamendo_data.py
```

## API 엔드포인트

### 인증
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/auth/register` | 회원가입 |
| `POST` | `/api/auth/login` | 로그인 |
| `GET` | `/api/auth/me` | 내 정보 조회 |

### 트랙 / 아티스트 / 앨범
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/tracks` | 트랙 목록 (쿼리: `?q=검색어`) |
| `GET` | `/api/tracks/{id}` | 트랙 상세 |
| `GET` | `/api/tracks/{id}/stream` | 오디오 스트리밍 |
| `GET` | `/api/artists/{id}` | 아티스트 상세 |
| `GET` | `/api/albums/{id}` | 앨범 상세 |

### 플레이리스트 (인증 필요)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/playlists` | 내 플레이리스트 목록 |
| `POST` | `/api/playlists` | 플레이리스트 생성 |
| `GET` | `/api/playlists/{id}` | 플레이리스트 상세 |
| `PATCH` | `/api/playlists/{id}` | 플레이리스트 수정 |
| `DELETE` | `/api/playlists/{id}` | 플레이리스트 삭제 |
| `POST` | `/api/playlists/{id}/tracks` | 트랙 추가 |
| `DELETE` | `/api/playlists/{id}/tracks/{track_id}` | 트랙 제거 |

### 좋아요 / 재생 기록 (인증 필요)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/likes` | 좋아요한 트랙 목록 |
| `POST` | `/api/likes/{track_id}` | 좋아요 |
| `DELETE` | `/api/likes/{track_id}` | 좋아요 취소 |
| `GET` | `/api/history` | 재생 기록 조회 |
| `POST` | `/api/history/{track_id}` | 재생 기록 추가 |
