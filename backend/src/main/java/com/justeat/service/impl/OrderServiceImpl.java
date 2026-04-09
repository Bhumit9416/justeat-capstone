package com.justeat.service.impl;

import com.justeat.dto.OrderRequest;
import com.justeat.dto.OrderResponse;
import com.justeat.entity.*;
import com.justeat.enums.OrderStatus;
import com.justeat.exception.ResourceNotFoundException;
import com.justeat.exception.UnauthorizedException;
import com.justeat.mapper.EntityMapper;
import com.justeat.repository.*;
import com.justeat.service.MenuService;
import com.justeat.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuService menuService;
    private final EntityMapper mapper;

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request, String customerUsername) {
        User customer = getUser(customerUsername);
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0.0;

        Order order = Order.builder()
                .customer(customer)
                .restaurant(restaurant)
                .totalPrice(0.0)
                .build();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + itemReq.getMenuItemId()));

            double linePrice = menuItem.getPrice() * itemReq.getQuantity();
            total += linePrice;

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .price(linePrice)
                    .build();
            orderItems.add(orderItem);

            // Increment order count for popularity tracking
            menuItem.setOrderCount(menuItem.getOrderCount() + itemReq.getQuantity());
            menuItemRepository.save(menuItem);
        }

        order.setItems(orderItems);
        order.setTotalPrice(total);
        Order saved = orderRepository.save(order);

        // Recalculate mostly ordered items
        menuService.recalculateMostlyOrdered(restaurant.getId());

        log.info("Order placed by {} at restaurant {} | Total: {}", customerUsername, restaurant.getName(), total);
        return mapper.toOrderResponse(saved);
    }

    @Override
    public OrderResponse updateStatus(Long orderId, OrderStatus status, String ownerUsername) {
        Order order = getOrder(orderId);
        if (!order.getRestaurant().getOwner().getUsername().equals(ownerUsername)) {
            throw new UnauthorizedException("You do not own this restaurant");
        }
        order.setStatus(status);
        return mapper.toOrderResponse(orderRepository.save(order));
    }

    @Override
    public List<OrderResponse> getMyOrders(String customerUsername) {
        User customer = getUser(customerUsername);
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream().map(mapper::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getRestaurantOrders(Long restaurantId, String ownerUsername) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        if (!restaurant.getOwner().getUsername().equals(ownerUsername)) {
            throw new UnauthorizedException("You do not own this restaurant");
        }
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream().map(mapper::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(Long orderId, String username) {
        Order order = getOrder(orderId);
        boolean isCustomer = order.getCustomer().getUsername().equals(username);
        boolean isOwner = order.getRestaurant().getOwner().getUsername().equals(username);
        if (!isCustomer && !isOwner) {
            throw new UnauthorizedException("Access denied");
        }
        return mapper.toOrderResponse(order);
    }

    private Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}

