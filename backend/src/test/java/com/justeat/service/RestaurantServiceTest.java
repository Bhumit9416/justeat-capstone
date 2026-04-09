package com.justeat.service;

import com.justeat.dto.RestaurantResponse;
import com.justeat.entity.Restaurant;
import com.justeat.entity.User;
import com.justeat.enums.Role;
import com.justeat.mapper.EntityMapper;
import com.justeat.repository.RestaurantRepository;
import com.justeat.repository.UserRepository;
import com.justeat.service.impl.RestaurantServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RestaurantServiceTest {

    @Mock RestaurantRepository restaurantRepository;
    @Mock UserRepository userRepository;
    @Mock EntityMapper mapper;

    @InjectMocks RestaurantServiceImpl restaurantService;

    private User owner;
    private Restaurant restaurant;
    private RestaurantResponse response;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).username("owner1").role(Role.OWNER).build();
        restaurant = Restaurant.builder()
                .id(1L).name("Burger King").cuisine("American")
                .location("London").rating(4.5).owner(owner).build();
        response = RestaurantResponse.builder()
                .id(1L).name("Burger King").cuisine("American")
                .location("London").rating(4.5).build();
    }

    // Test 6 – search by cuisine returns matching restaurants
    @Test
    void search_byCuisine_returnsMatchingRestaurants() {
        when(restaurantRepository.search(null, "American", null)).thenReturn(List.of(restaurant));
        when(mapper.toRestaurantResponse(restaurant)).thenReturn(response);

        List<RestaurantResponse> results = restaurantService.search(null, "American", null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCuisine()).isEqualTo("American");
    }
}

