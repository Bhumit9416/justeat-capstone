package com.justeat.dto;

import com.justeat.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long customerId;
    private String customerUsername;
    private Long restaurantId;
    private String restaurantName;
    private OrderStatus status;
    private Double totalPrice;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private Long menuItemId;
        private String menuItemName;
        private Integer quantity;
        private Double price;
    }
}

