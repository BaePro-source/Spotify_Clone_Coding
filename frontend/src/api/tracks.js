import api from "./client";

export const getTracks = (q) => api.get("/api/tracks", { params: q ? { q } : {} });
export const getTrack = (id) => api.get(`/api/tracks/${id}`);
export const getArtist = (id) => api.get(`/api/artists/${id}`);
export const getAlbum = (id) => api.get(`/api/albums/${id}`);
export const getStreamUrl = (id) =>
  (import.meta.env.VITE_API_URL || "") + `/api/tracks/${id}/stream`;
