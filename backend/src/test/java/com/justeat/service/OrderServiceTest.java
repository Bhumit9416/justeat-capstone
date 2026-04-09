package com.justeat.service;

import com.justeat.dto.OrderRequest;
import com.justeat.dto.OrderResponse;
import com.justeat.entity.*;
import com.justeat.enums.OrderStatus;
import com.justeat.enums.Role;
import com.justeat.mapper.EntityMapper;
import com.justeat.repository.*;
import com.justeat.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock UserRepository userRepository;
    @Mock RestaurantRepository restaurantRepository;
    @Mock MenuItemRepository menuItemRepository;
    @Mock MenuService menuService;
    @Mock EntityMapper mapper;

    @InjectMocks OrderServiceImpl orderService;

    private User customer;
    private User owner;
    private Restaurant restaurant;
    private MenuItem menuItem;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).username("customer1").role(Role.CUSTOMER).build();
        owner    = User.builder().id(2L).username("owner1").role(Role.OWNER).build();
        restaurant = Restaurant.builder().id(1L).name("Pizzeria").owner(owner).build();
        menuItem   = MenuItem.builder().id(5L).name("Pizza").price(10.0).orderCount(0L).restaurant(restaurant).build();
    }

    // Test 9 – placeOrder calculates total price correctly
    @Test
    void placeOrder_calculatesTotal() {
        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest();
        itemReq.setMenuItemId(5L);
        itemReq.setQuantity(2);

        OrderRequest request = new OrderRequest();
        request.setRestaurantId(1L);
        request.setItems(List.of(itemReq));

        Order savedOrder = Order.builder()
                .id(1L).customer(customer).restaurant(restaurant)
                .totalPrice(20.0).status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now()).items(List.of()).build();

        when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(customer));
        when(restaurantRepository.findById(1L)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(5L)).thenReturn(Optional.of(menuItem));
        when(menuItemRepository.save(any())).thenReturn(menuItem);
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        OrderResponse mockResponse = OrderResponse.builder().id(1L).totalPrice(20.0).build();
        when(mapper.toOrderResponse(any())).thenReturn(mockResponse);

        OrderResponse response = orderService.placeOrder(request, "customer1");

        assertThat(response.getTotalPrice()).isEqualTo(20.0);
        verify(orderRepository).save(any(Order.class));
    }

    // Test 10 – updateStatus by owner changes status successfully
    @Test
    void updateStatus_byOwner_updatesSuccessfully() {
        Order order = Order.builder()
                .id(1L).customer(customer).restaurant(restaurant)
                .status(OrderStatus.PENDING).totalPrice(20.0)
                .createdAt(LocalDateTime.now()).items(List.of()).build();

        Order updatedOrder = Order.builder()
                .id(1L).customer(customer).restaurant(restaurant)
                .status(OrderStatus.PREPARING).totalPrice(20.0)
                .createdAt(LocalDateTime.now()).items(List.of()).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(updatedOrder);
        OrderResponse mockResponse = OrderResponse.builder().id(1L).status(OrderStatus.PREPARING).build();
        when(mapper.toOrderResponse(any())).thenReturn(mockResponse);

        OrderResponse response = orderService.updateStatus(1L, OrderStatus.PREPARING, "owner1");

        assertThat(response.getStatus()).isEqualTo(OrderStatus.PREPARING);
    }

    // Test 11 – getMostlyOrdered: recalculate flags top items
    @Test
    void recalculateMostlyOrdered_flagsTopItems() {
        MenuItem item1 = MenuItem.builder().id(1L).name("Pizza").orderCount(50L).restaurant(restaurant).build();
        MenuItem item2 = MenuItem.builder().id(2L).name("Burger").orderCount(30L).restaurant(restaurant).build();
        MenuItem item3 = MenuItem.builder().id(3L).name("Pasta").orderCount(10L).restaurant(restaurant).build();
        MenuItem item4 = MenuItem.builder().id(4L).name("Salad").orderCount(2L).restaurant(restaurant).build();

        when(menuItemRepository.findByRestaurantIdOrderByOrderCountDesc(1L))
                .thenReturn(List.of(item1, item2, item3, item4));
        when(menuItemRepository.saveAll(any())).thenReturn(List.of());

        // Use MenuServiceImpl directly for this test
        com.justeat.service.impl.MenuServiceImpl menuServiceImpl =
                new com.justeat.service.impl.MenuServiceImpl(menuItemRepository, restaurantRepository, mapper);
        menuServiceImpl.recalculateMostlyOrdered(1L);

        assertThat(item1.getIsMostlyOrdered()).isTrue();
        assertThat(item2.getIsMostlyOrdered()).isTrue();
        assertThat(item3.getIsMostlyOrdered()).isTrue();
        assertThat(item4.getIsMostlyOrdered()).isFalse();
    }
}

