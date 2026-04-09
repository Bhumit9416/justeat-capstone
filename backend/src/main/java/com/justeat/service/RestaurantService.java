package com.justeat.service;

import com.justeat.dto.RestaurantRequest;
import com.justeat.dto.RestaurantResponse;
import java.util.List;

public interface RestaurantService {
    RestaurantResponse create(RestaurantRequest request, String ownerUsername);
    RestaurantResponse update(Long id, RestaurantRequest request, String ownerUsername);
    RestaurantResponse getById(Long id);
    List<RestaurantResponse> search(String name, String cuisine, String location);
    List<RestaurantResponse> getMyRestaurants(String ownerUsername);
    RestaurantResponse rateRestaurant(Long id, Double userRating);
}

