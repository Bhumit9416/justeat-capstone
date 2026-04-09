package com.justeat.mapper;

import com.justeat.dto.*;
import com.justeat.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class EntityMapper {

    public RestaurantResponse toRestaurantResponse(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .cuisine(r.getCuisine())
                .location(r.getLocation())
                .rating(r.getRating())
                .ratingCount(r.getRatingCount())
                .imageUrl(r.getImageUrl())
                .ownerId(r.getOwner().getId())
                .ownerUsername(r.getOwner().getUsername())
                .build();
    }

    public MenuItemResponse toMenuItemResponse(MenuItem m) {
        return MenuItemResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .description(m.getDescription())
                .price(m.getPrice())
                .isSpecial(m.getIsSpecial())
                .isDealOfDay(m.getIsDealOfDay())
                .isMostlyOrdered(m.getIsMostlyOrdered())
                .isVeg(m.getIsVeg())
                .orderCount(m.getOrderCount())
                .restaurantId(m.getRestaurant().getId())
                .imageUrl(m.getImageUrl())
                .build();
    }

    public OrderResponse toOrderResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .customerId(o.getCustomer().getId())
                .customerUsername(o.getCustomer().getUsername())
                .restaurantId(o.getRestaurant().getId())
                .restaurantName(o.getRestaurant().getName())
                .status(o.getStatus())
                .totalPrice(o.getTotalPrice())
                .createdAt(o.getCreatedAt())
                .items(o.getItems().stream().map(item ->
                        OrderResponse.OrderItemResponse.builder()
                                .menuItemId(item.getMenuItem().getId())
                                .menuItemName(item.getMenuItem().getName())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }

    public UserPreferenceResponse toPreferenceResponse(UserPreference p) {
        return UserPreferenceResponse.builder()
                .userId(p.getUser().getId())
                .favouriteRestaurantIds(p.getFavouriteRestaurantIds())
                .preferredCuisines(p.getPreferredCuisines())
                .dietaryRestrictions(p.getDietaryRestrictions())
                .build();
    }
}

