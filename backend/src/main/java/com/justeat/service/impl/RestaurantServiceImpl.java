package com.justeat.service.impl;

import com.justeat.dto.RestaurantRequest;
import com.justeat.dto.RestaurantResponse;
import com.justeat.entity.Restaurant;
import com.justeat.entity.User;
import com.justeat.exception.ResourceNotFoundException;
import com.justeat.exception.UnauthorizedException;
import com.justeat.mapper.EntityMapper;
import com.justeat.repository.RestaurantRepository;
import com.justeat.repository.UserRepository;
import com.justeat.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @Override
    public RestaurantResponse create(RestaurantRequest request, String ownerUsername) {
        User owner = getUser(ownerUsername);
        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .cuisine(request.getCuisine())
                .location(request.getLocation())
                .rating(request.getRating() != null ? request.getRating() : 0.0)
                .imageUrl(request.getImageUrl())
                .owner(owner)
                .build();
        return mapper.toRestaurantResponse(restaurantRepository.save(restaurant));
    }

    @Override
    public RestaurantResponse update(Long id, RestaurantRequest request, String ownerUsername) {
        Restaurant restaurant = getRestaurant(id);
        if (!restaurant.getOwner().getUsername().equals(ownerUsername)) {
            throw new UnauthorizedException("You do not own this restaurant");
        }
        restaurant.setName(request.getName());
        restaurant.setCuisine(request.getCuisine());
        restaurant.setLocation(request.getLocation());
        if (request.getRating() != null) restaurant.setRating(request.getRating());
        if (request.getImageUrl() != null) restaurant.setImageUrl(request.getImageUrl());
        return mapper.toRestaurantResponse(restaurantRepository.save(restaurant));
    }

    @Override
    public RestaurantResponse getById(Long id) {
        return mapper.toRestaurantResponse(getRestaurant(id));
    }

    @Override
    public List<RestaurantResponse> search(String name, String cuisine, String location) {
        String n = (name != null && !name.isBlank()) ? name.trim() : "";
        String c = (cuisine != null && !cuisine.isBlank()) ? cuisine.trim() : "";
        String l = (location != null && !location.isBlank()) ? location.trim() : "";
        return restaurantRepository.search(n, c, l)
                .stream().map(mapper::toRestaurantResponse).collect(Collectors.toList());
    }

    @Override
    public List<RestaurantResponse> getMyRestaurants(String ownerUsername) {
        User owner = getUser(ownerUsername);
        return restaurantRepository.findByOwnerId(owner.getId())
                .stream().map(mapper::toRestaurantResponse).collect(Collectors.toList());
    }

    @Override
    public RestaurantResponse rateRestaurant(Long id, Double userRating) {
        Restaurant restaurant = getRestaurant(id);
        long count = restaurant.getRatingCount() == null ? 0L : restaurant.getRatingCount();
        double current = restaurant.getRating() == null ? 0.0 : restaurant.getRating();
        double newRating = (current * count + userRating) / (count + 1);
        // Round to 1 decimal place
        newRating = Math.round(newRating * 10.0) / 10.0;
        restaurant.setRating(newRating);
        restaurant.setRatingCount(count + 1);
        log.info("Restaurant {} rated {}. New avg: {} ({} ratings)", id, userRating, newRating, count + 1);
        return mapper.toRestaurantResponse(restaurantRepository.save(restaurant));
    }

    private Restaurant getRestaurant(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + id));
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}

