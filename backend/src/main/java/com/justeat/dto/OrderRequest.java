package com.justeat.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {

    @NotNull
    private Long restaurantId;

    @NotEmpty
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        @NotNull
        private Long menuItemId;

        @NotNull
        private Integer quantity;
    }
}

