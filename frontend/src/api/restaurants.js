import api from "./client";

export async function searchRestaurants(name = "", cuisine = "", location = "") {
  const params = new URLSearchParams();
  if (name) params.append("name", name);
  if (cuisine) params.append("cuisine", cuisine);
  if (location) params.append("location", location);

  const res = await api.get(`/api/restaurants?${params.toString()}`);
  return res.data;
}

export async function getRestaurantById(id) {
  const res = await api.get(`/api/restaurants/${id}`);
  return res.data;
}

export async function getMyRestaurants() {
  const res = await api.get("/api/restaurants/my");
  return res.data;
}

export async function createRestaurant(payload) {
  const res = await api.post("/api/restaurants", payload);
  return res.data;
}

export async function updateRestaurant(id, payload) {
  const res = await api.put(`/api/restaurants/${id}`, payload);
  return res.data;
}

export async function rateRestaurant(id, rating) {
  const res = await api.patch(`/api/restaurants/${id}/rate?rating=${rating}`);
  return res.data;
}
