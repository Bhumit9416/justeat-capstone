package com.justeat.service.impl;

import com.justeat.dto.MenuItemRequest;
import com.justeat.dto.MenuItemResponse;
import com.justeat.entity.MenuItem;
import com.justeat.entity.Restaurant;
import com.justeat.exception.ResourceNotFoundException;
import com.justeat.exception.UnauthorizedException;
import com.justeat.mapper.EntityMapper;
import com.justeat.repository.MenuItemRepository;
import com.justeat.repository.RestaurantRepository;
import com.justeat.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuServiceImpl implements MenuService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final EntityMapper mapper;

    @Override
    public MenuItemResponse addItem(Long restaurantId, MenuItemRequest request, String ownerUsername) {
        Restaurant restaurant = getAndVerifyRestaurant(restaurantId, ownerUsername);
        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .isSpecial(Boolean.TRUE.equals(request.getIsSpecial()))
                .isDealOfDay(Boolean.TRUE.equals(request.getIsDealOfDay()))
                .isVeg(request.getIsVeg() == null || Boolean.TRUE.equals(request.getIsVeg()))
                .imageUrl(request.getImageUrl())
                .restaurant(restaurant)
                .build();
        return mapper.toMenuItemResponse(menuItemRepository.save(item));
    }

    @Override
    public MenuItemResponse updateItem(Long restaurantId, Long itemId, MenuItemRequest request, String ownerUsername) {
        getAndVerifyRestaurant(restaurantId, ownerUsername);
        MenuItem item = getItem(itemId);
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        if (request.getIsSpecial() != null) item.setIsSpecial(request.getIsSpecial());
        if (request.getIsDealOfDay() != null) item.setIsDealOfDay(request.getIsDealOfDay());
        if (request.getIsVeg() != null) item.setIsVeg(request.getIsVeg());
        item.setImageUrl(request.getImageUrl());
        return mapper.toMenuItemResponse(menuItemRepository.save(item));
    }

    @Override
    public void deleteItem(Long restaurantId, Long itemId, String ownerUsername) {
        getAndVerifyRestaurant(restaurantId, ownerUsername);
        MenuItem item = getItem(itemId);
        menuItemRepository.delete(item);
        log.info("Menu item {} deleted from restaurant {}", itemId, restaurantId);
    }

    @Override
    public List<MenuItemResponse> getMenu(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId)
                .stream().map(mapper::toMenuItemResponse).collect(Collectors.toList());
    }

    @Override
    public MenuItemResponse toggleSpecial(Long itemId, boolean isSpecial, String ownerUsername) {
        MenuItem item = getItem(itemId);
        verifyOwner(item.getRestaurant(), ownerUsername);
        item.setIsSpecial(isSpecial);
        return mapper.toMenuItemResponse(menuItemRepository.save(item));
    }

    @Override
    public MenuItemResponse toggleDealOfDay(Long itemId, boolean isDeal, String ownerUsername) {
        MenuItem item = getItem(itemId);
        verifyOwner(item.getRestaurant(), ownerUsername);
        item.setIsDealOfDay(isDeal);
        return mapper.toMenuItemResponse(menuItemRepository.save(item));
    }

    @Override
    public void recalculateMostlyOrdered(Long restaurantId) {
        List<MenuItem> items = menuItemRepository.findByRestaurantIdOrderByOrderCountDesc(restaurantId);
        // Top 3 items (or items with orderCount > 5) are flagged as mostly ordered
        for (int i = 0; i < items.size(); i++) {
            items.get(i).setIsMostlyOrdered(i < 3 && items.get(i).getOrderCount() > 0);
        }
        menuItemRepository.saveAll(items);
    }

    private Restaurant getAndVerifyRestaurant(Long restaurantId, String ownerUsername) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + restaurantId));
        verifyOwner(restaurant, ownerUsername);
        return restaurant;
    }

    private void verifyOwner(Restaurant restaurant, String ownerUsername) {
        if (!restaurant.getOwner().getUsername().equals(ownerUsername)) {
            throw new UnauthorizedException("You do not own this restaurant");
        }
    }

    private MenuItem getItem(Long itemId) {
        return menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + itemId));
    }
}

