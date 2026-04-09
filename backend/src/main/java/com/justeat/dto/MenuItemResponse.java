package com.justeat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MenuItemResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Boolean isSpecial;
    private Boolean isDealOfDay;
    private Boolean isMostlyOrdered;
    private Boolean isVeg;
    private Long orderCount;
    private Long restaurantId;
    private String imageUrl;
}

