import api from "./client";

export async function getPreferences() {
  const res = await api.get("/api/preferences");
  return res.data;
}

export async function savePreferences(payload) {
  const res = await api.put("/api/preferences", payload);
  return res.data;
}
