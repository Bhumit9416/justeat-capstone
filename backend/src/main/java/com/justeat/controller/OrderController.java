package com.justeat.controller;

import com.justeat.dto.ApiResponse;
import com.justeat.dto.OrderRequest;
import com.justeat.dto.OrderResponse;
import com.justeat.enums.OrderStatus;
import com.justeat.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Place and manage orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Place a new order (CUSTOMER only)")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Order placed", orderService.placeOrder(request, user.getUsername())));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get order history for the authenticated customer")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("OK", orderService.getMyOrders(user.getUsername())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("OK", orderService.getOrderById(id, user.getUsername())));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Get all orders for a restaurant (OWNER only)")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getRestaurantOrders(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("OK", orderService.getRestaurantOrders(restaurantId, user.getUsername())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update order status (OWNER only): PENDING → PREPARING → READY → COMPLETED")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", orderService.updateStatus(id, status, user.getUsername())));
    }
}

