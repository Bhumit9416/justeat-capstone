package com.justeat.controller;

import com.justeat.dto.ApiResponse;
import com.justeat.dto.RestaurantRequest;
import com.justeat.dto.RestaurantResponse;
import com.justeat.service.RestaurantService;
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
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Tag(name = "Restaurants", description = "Browse and manage restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    @Operation(summary = "Search restaurants by name, cuisine, or location")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(ApiResponse.success("OK", restaurantService.search(name, cuisine, location)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get restaurant by ID")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("OK", restaurantService.getById(id)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Get all restaurants owned by the authenticated owner")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getMyRestaurants(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("OK", restaurantService.getMyRestaurants(user.getUsername())));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Create a new restaurant (OWNER only)")
    public ResponseEntity<ApiResponse<RestaurantResponse>> create(
            @Valid @RequestBody RestaurantRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Restaurant created", restaurantService.create(request, user.getUsername())));
    }

    @PatchMapping("/{id}/rate")
    @Operation(summary = "Rate a restaurant (any authenticated user)")
    public ResponseEntity<ApiResponse<RestaurantResponse>> rate(
            @PathVariable Long id,
            @RequestParam Double rating) {
        if (rating < 1.0 || rating > 5.0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Rating must be between 1 and 5"));
        }
        return ResponseEntity.ok(ApiResponse.success("Rated", restaurantService.rateRestaurant(id, rating)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update restaurant details (OWNER only)")
    public ResponseEntity<ApiResponse<RestaurantResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated", restaurantService.update(id, request, user.getUsername())));
    }
}

