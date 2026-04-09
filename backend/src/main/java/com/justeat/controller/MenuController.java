package com.justeat.controller;

import com.justeat.dto.ApiResponse;
import com.justeat.dto.MenuItemRequest;
import com.justeat.dto.MenuItemResponse;
import com.justeat.service.MenuService;
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
@RequestMapping("/api/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
@Tag(name = "Menu", description = "Manage menu items")
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    @Operation(summary = "Get all menu items for a restaurant")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenu(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(ApiResponse.success("OK", menuService.getMenu(restaurantId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Add a menu item (OWNER only)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> addItem(
            @PathVariable Long restaurantId,
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Item added", menuService.addItem(restaurantId, request, user.getUsername())));
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update a menu item (OWNER only)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateItem(
            @PathVariable Long restaurantId,
            @PathVariable Long itemId,
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Item updated", menuService.updateItem(restaurantId, itemId, request, user.getUsername())));
    }

    @DeleteMapping("/{itemId}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Delete a menu item (OWNER only)")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable Long restaurantId,
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails user) {
        menuService.deleteItem(restaurantId, itemId, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Item deleted", null));
    }

    @PatchMapping("/{itemId}/special")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Toggle Today's Special flag (OWNER only)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleSpecial(
            @PathVariable Long restaurantId,
            @PathVariable Long itemId,
            @RequestParam boolean value,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Updated", menuService.toggleSpecial(itemId, value, user.getUsername())));
    }

    @PatchMapping("/{itemId}/deal")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Toggle Deal of the Day flag (OWNER only)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleDeal(
            @PathVariable Long restaurantId,
            @PathVariable Long itemId,
            @RequestParam boolean value,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Updated", menuService.toggleDealOfDay(itemId, value, user.getUsername())));
    }
}

