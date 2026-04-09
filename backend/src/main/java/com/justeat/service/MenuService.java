package com.justeat.service;

import com.justeat.dto.MenuItemRequest;
import com.justeat.dto.MenuItemResponse;
import java.util.List;

public interface MenuService {
    MenuItemResponse addItem(Long restaurantId, MenuItemRequest request, String ownerUsername);
    MenuItemResponse updateItem(Long restaurantId, Long itemId, MenuItemRequest request, String ownerUsername);
    void deleteItem(Long restaurantId, Long itemId, String ownerUsername);
    List<MenuItemResponse> getMenu(Long restaurantId);
    MenuItemResponse toggleSpecial(Long itemId, boolean isSpecial, String ownerUsername);
    MenuItemResponse toggleDealOfDay(Long itemId, boolean isDeal, String ownerUsername);
    void recalculateMostlyOrdered(Long restaurantId);
}

