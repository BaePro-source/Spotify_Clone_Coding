import api from "./client";

export const addHistory = (track_id) => api.post("/api/history", { track_id });
export const getHistory = () => api.get("/api/history");
