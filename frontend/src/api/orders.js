import api from "./client";

export async function placeOrder(payload) {
  const res = await api.post("/api/orders", payload);
  return res.data;
}

export async function getMyOrders() {
  const res = await api.get("/api/orders/my");
  return res.data;
}

export async function getOrderById(id) {
  const res = await api.get(`/api/orders/${id}`);
  return res.data;
}

export async function getRestaurantOrders(restaurantId) {
  const res = await api.get(`/api/orders/restaurant/${restaurantId}`);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  const res = await api.patch(`/api/orders/${id}/status?status=${status}`);
  return res.data;
}
