package com.justeat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RestaurantRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String cuisine;

    @NotBlank
    private String location;

    private Double rating;

    private String imageUrl;
}

