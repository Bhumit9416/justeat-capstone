package com.justeat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RestaurantResponse {
    private Long id;
    private String name;
    private String cuisine;
    private String location;
    private Double rating;
    private Long ratingCount;
    private String imageUrl;
    private Long ownerId;
    private String ownerUsername;
}

