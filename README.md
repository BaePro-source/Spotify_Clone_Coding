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

## 프로젝트 구조

```
spotify_clone/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py          # FastAPI 앱, CORS 설정
│       ├── config.py        # 환경변수 (pydantic-settings)
│       ├── db.py            # SQLAlchemy 엔진/세션
│       ├── seed.py          # 초기 데이터 삽입
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

## 실행 방법

### Docker Compose (권장)

```bash
# 프로젝트 루트에서 실행
docker compose up --build
```

브라우저에서 `http://localhost:3001` 접속

> 백엔드 API: `http://localhost:8000`  
> API 문서 (Swagger): `http://localhost:8000/docs`

### 로컬 개발 환경

**백엔드**

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에서 DATABASE_URL, JWT_SECRET 등 설정

# DB 초기화 및 시드 데이터 삽입
python app/seed.py

# 서버 실행
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

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 연결 URL | `postgresql://spotify_user:password@localhost:5432/spotify_db` |
| `JWT_SECRET` | JWT 서명 비밀키 | — (필수, 운영 환경에서 반드시 변경) |
| `JWT_ALGORITHM` | JWT 알고리즘 | `HS256` |
| `JWT_EXPIRE_MINUTES` | 토큰 만료 시간 (분) | `10080` (7일) |
| `AUDIO_UPLOAD_DIR` | 오디오 파일 저장 경로 | `uploads/audio` |

## 오디오 파일 준비

시드 데이터는 아래 파일명의 MP3를 `backend/uploads/audio/` 디렉터리에서 찾습니다.  
해당 트랙들은 모두 **Creative Commons** 라이선스의 무료 음원입니다.

| 파일명 | 아티스트 | 출처 |
|--------|----------|------|
| `broke_for_free_petal.mp3` | Broke For Free | Free Music Archive |
| `broke_for_free_night_owl.mp3` | Broke For Free | Free Music Archive |
| `broke_for_free_leaf.mp3` | Broke For Free | Free Music Archive |
| `kevin_impact_moderato.mp3` | Kevin MacLeod | incompetech.com |
| `kevin_cipher.mp3` | Kevin MacLeod | incompetech.com |
| `kevin_anxiety.mp3` | Kevin MacLeod | incompetech.com |
| `kai_satin.mp3` | Kai Engel | Free Music Archive |
| `kai_snowfall.mp3` | Kai Engel | Free Music Archive |
| `kai_hope.mp3` | Kai Engel | Free Music Archive |
| `chris_is_that_you.mp3` | Chris Zabriskie | chriszabriskie.com |
| `chris_divider.mp3` | Chris Zabriskie | chriszabriskie.com |

오디오 파일 없이도 앱은 정상 동작하며, 스트리밍 시 404가 반환됩니다.

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
