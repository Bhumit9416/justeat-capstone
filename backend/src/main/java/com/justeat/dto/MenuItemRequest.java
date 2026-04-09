package com.justeat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class MenuItemRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private Double price;

    private Boolean isSpecial = false;
    private Boolean isDealOfDay = false;
    private Boolean isVeg = true;
    private String imageUrl;
}

