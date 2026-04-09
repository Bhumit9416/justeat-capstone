package com.justeat.service;

import com.justeat.dto.OrderRequest;
import com.justeat.dto.OrderResponse;
import com.justeat.enums.OrderStatus;
import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(OrderRequest request, String customerUsername);
    OrderResponse updateStatus(Long orderId, OrderStatus status, String ownerUsername);
    List<OrderResponse> getMyOrders(String customerUsername);
    List<OrderResponse> getRestaurantOrders(Long restaurantId, String ownerUsername);
    OrderResponse getOrderById(Long orderId, String username);
}

