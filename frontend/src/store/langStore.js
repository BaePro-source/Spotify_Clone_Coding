import { create } from "zustand";

const translations = {
  ko: {
    // 네비게이션
    home: "홈",
    search: "검색",
    myLibrary: "내 라이브러리",
    likedSongs: "좋아요한 곡",
    // 인증
    login: "로그인",
    logout: "로그아웃",
    signup: "가입",
    signupLong: "가입하기",
    signupFree: "무료로 가입하기",
    // 사이드바
    loginToCreate: "로그인하면 플레이리스트를\n만들 수 있어요",
    addPlaylist: "플레이리스트 추가",
    enterName: "이름 입력",
    add: "추가",
    // 상단 검색
    searchPlaceholder: "어떤 콘텐츠를 감상하고 싶으세요?",
    // 홈 섹션
    recentlyPlayed: "최근 재생",
    popularTracks: "인기 상승 곡",
    popularArtists: "인기 아티스트",
    popularAlbums: "인기 앨범",
    allTracks: "전체 트랙",
    artist: "아티스트",
    loading: "로딩 중...",
    // 플레이어
    noSongPlaying: "재생 중인 곡이 없습니다",
    shuffleTitle: "셔플",
    prevTitle: "이전 곡",
    nextTitle: "다음 곡",
    repeatTitle: "반복",
    // 트랙 목록 헤더
    colTitle: "제목",
    colGenre: "장르",
    colTime: "시간",
    // 검색 페이지
    searchHint: "위 검색창에서 트랙이나 아티스트를 찾아보세요",
    searching: "검색 중...",
    searchResultsLabel: "검색 결과",
    noResultsTitle: "검색 결과 없음",
    noResultsDesc: "에 대한 트랙이나 아티스트를 찾을 수 없습니다.",
    songs: "곡",
    // 로그인 배너
    previewTitle: "Spotify 미리 듣기",
    previewDesc: "가끔 표시되는 광고와 함께 무제한 곡 및 플레이리스트를 이용하려면 가입하세요. 신용카드는 필요 없습니다.",
    // 로그인 페이지
    loginTitle: "Spotify에 로그인",
    email: "이메일",
    emailPlaceholder: "이메일 주소",
    password: "비밀번호",
    passwordPlaceholder: "비밀번호",
    loggingIn: "로그인 중...",
    noAccount: "아직 계정이 없으신가요?",
    loginFailed: "로그인 실패",
    // 회원가입 페이지
    registerTitle: "무료 계정 만들기",
    username: "사용자 이름",
    usernamePlaceholder: "닉네임",
    passwordLongPlaceholder: "비밀번호 (6자 이상)",
    signingUp: "가입 중...",
    hasAccount: "이미 계정이 있으신가요?",
    signupFailed: "가입 실패",
    // 재생 큐
    queueTitle: "재생 큐",
    nowPlayingLabel: "지금 재생 중",
    nextUpLabel: "다음 재생",
    emptyQueue: "재생 큐가 비어 있습니다",
    // 장르 필터
    genreAll: "전체",
    // 아티스트/앨범 페이지
    playAll: "모두 재생",
    topTracks: "인기 트랙",
    albumsLabel: "앨범",
    artistNotFound: "아티스트를 찾을 수 없습니다.",
    albumNotFound: "앨범을 찾을 수 없습니다.",
    // 언어
    langLabel: "한국어",
  },
  en: {
    // Navigation
    home: "Home",
    search: "Search",
    myLibrary: "My Library",
    likedSongs: "Liked Songs",
    // Auth
    login: "Log in",
    logout: "Log out",
    signup: "Sign up",
    signupLong: "Sign up",
    signupFree: "Sign up free",
    // Sidebar
    loginToCreate: "Log in to create\nplaylists",
    addPlaylist: "Add playlist",
    enterName: "Enter name",
    add: "Add",
    // Search bar
    searchPlaceholder: "What do you want to listen to?",
    // Home sections
    recentlyPlayed: "Recently Played",
    popularTracks: "Trending",
    popularArtists: "Popular Artists",
    popularAlbums: "Popular Albums",
    allTracks: "All Tracks",
    artist: "Artist",
    loading: "Loading...",
    // Player
    noSongPlaying: "No song playing",
    shuffleTitle: "Shuffle",
    prevTitle: "Previous",
    nextTitle: "Next",
    repeatTitle: "Repeat",
    // Track list headers
    colTitle: "Title",
    colGenre: "Genre",
    colTime: "Time",
    // Search page
    searchHint: "Search for tracks or artists above",
    searching: "Searching...",
    searchResultsLabel: "Search results",
    noResultsTitle: "No results found",
    noResultsDesc: "No tracks or artists found for",
    songs: "songs",
    // Login banner
    previewTitle: "Preview Spotify",
    previewDesc: "Sign up to get unlimited songs with occasional ads. No credit card needed.",
    // Login page
    loginTitle: "Log in to Spotify",
    email: "Email",
    emailPlaceholder: "Email address",
    password: "Password",
    passwordPlaceholder: "Password",
    loggingIn: "Logging in...",
    noAccount: "Don't have an account?",
    loginFailed: "Login failed",
    // Register page
    registerTitle: "Create a free account",
    username: "Username",
    usernamePlaceholder: "Nickname",
    passwordLongPlaceholder: "Password (min. 6 characters)",
    signingUp: "Signing up...",
    hasAccount: "Already have an account?",
    signupFailed: "Sign up failed",
    // Queue
    queueTitle: "Queue",
    nowPlayingLabel: "Now Playing",
    nextUpLabel: "Next up",
    emptyQueue: "Your queue is empty",
    // Genre filter
    genreAll: "All",
    // Artist/Album pages
    playAll: "Play All",
    topTracks: "Popular Tracks",
    albumsLabel: "Albums",
    artistNotFound: "Artist not found.",
    albumNotFound: "Album not found.",
    // Language
    langLabel: "English",
  },
};

const useLangStore = create((set) => ({
  lang: localStorage.getItem("lang") || "ko",
  setLang: (lang) => {
    localStorage.setItem("lang", lang);
    set({ lang });
  },
}));

export const useT = () => {
  const lang = useLangStore((s) => s.lang);
  return translations[lang];
};

export default useLangStore;
