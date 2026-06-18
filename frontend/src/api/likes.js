import api from "./client";

export const toggleLike = (track_id) => api.post(`/api/likes/${track_id}`);
export const getLikedTracks = () => api.get("/api/likes");
