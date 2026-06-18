import api from "./client";

export const getPlaylists = () => api.get("/api/playlists");
export const getPlaylist = (id) => api.get(`/api/playlists/${id}`);
export const createPlaylist = (data) => api.post("/api/playlists", data);
export const updatePlaylist = (id, data) => api.patch(`/api/playlists/${id}`, data);
export const deletePlaylist = (id) => api.delete(`/api/playlists/${id}`);
export const addTrackToPlaylist = (id, track_id) =>
  api.post(`/api/playlists/${id}/tracks`, { track_id });
export const removeTrackFromPlaylist = (id, track_id) =>
  api.delete(`/api/playlists/${id}/tracks/${track_id}`);
