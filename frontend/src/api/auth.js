import api from "./client";

export async function login(username, password) {
  const res = await api.post("/api/auth/login", { username, password });
  return res.data;
}

export async function register(payload) {
  const res = await api.post("/api/auth/register", payload);
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
  return res.data;
}

export async function resetPassword(token, newPassword) {
  const res = await api.post("/api/auth/reset-password", { token, newPassword });
  return res.data;
}
