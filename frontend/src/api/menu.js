import api from "./client";

export async function getMenu(restaurantId) {
  const res = await api.get(`/api/restaurants/${restaurantId}/menu`);
  return res.data;
}

export async function addMenuItem(restaurantId, payload) {
  const res = await api.post(`/api/restaurants/${restaurantId}/menu`, payload);
  return res.data;
}

export async function updateMenuItem(restaurantId, itemId, payload) {
  const res = await api.put(`/api/restaurants/${restaurantId}/menu/${itemId}`, payload);
  return res.data;
}

export async function deleteMenuItem(restaurantId, itemId) {
  const res = await api.delete(`/api/restaurants/${restaurantId}/menu/${itemId}`);
  return res.data;
}

export async function toggleSpecial(restaurantId, itemId, value) {
  const res = await api.patch(`/api/restaurants/${restaurantId}/menu/${itemId}/special?value=${value}`);
  return res.data;
}

export async function toggleDeal(restaurantId, itemId, value) {
  const res = await api.patch(`/api/restaurants/${restaurantId}/menu/${itemId}/deal?value=${value}`);
  return res.data;
}
