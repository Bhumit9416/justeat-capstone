package com.justeat.service;

import com.justeat.dto.MenuItemResponse;
import com.justeat.entity.MenuItem;
import com.justeat.entity.Restaurant;
import com.justeat.entity.User;
import com.justeat.enums.Role;
import com.justeat.mapper.EntityMapper;
import com.justeat.repository.MenuItemRepository;
import com.justeat.repository.RestaurantRepository;
import com.justeat.service.impl.MenuServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock MenuItemRepository menuItemRepository;
    @Mock RestaurantRepository restaurantRepository;
    @Mock EntityMapper mapper;

    @InjectMocks MenuServiceImpl menuService;

    private User owner;
    private Restaurant restaurant;
    private MenuItem menuItem;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).username("owner1").role(Role.OWNER).build();
        restaurant = Restaurant.builder().id(1L).name("Burger King").owner(owner).build();
        menuItem = MenuItem.builder()
                .id(10L).name("Whopper").price(8.99)
                .isSpecial(false).isDealOfDay(false)
                .orderCount(0L).restaurant(restaurant).build();
    }

    // Test 7 – toggleSpecial sets isSpecial = true
    @Test
    void toggleSpecial_setsSpecialTrue() {
        when(menuItemRepository.findById(10L)).thenReturn(Optional.of(menuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);
        MenuItemResponse mockResponse = MenuItemResponse.builder().id(10L).isSpecial(true).build();
        when(mapper.toMenuItemResponse(any())).thenReturn(mockResponse);

        MenuItemResponse result = menuService.toggleSpecial(10L, true, "owner1");

        assertThat(result.getIsSpecial()).isTrue();
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    // Test 8 – deleteItem removes item from repository
    @Test
    void deleteItem_removesFromRepository() {
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(10L)).thenReturn(Optional.of(menuItem));

        menuService.deleteItem(1L, 10L, "owner1");

        verify(menuItemRepository).delete(menuItem);
    }
}

