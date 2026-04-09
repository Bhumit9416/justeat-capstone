package com.justeat.controller;

import com.justeat.dto.ApiResponse;
import com.justeat.dto.UserPreferenceRequest;
import com.justeat.dto.UserPreferenceResponse;
import com.justeat.service.UserPreferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
@Tag(name = "Preferences", description = "Customer food preferences")
public class UserPreferenceController {

    private final UserPreferenceService preferenceService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get saved preferences for the authenticated customer")
    public ResponseEntity<ApiResponse<UserPreferenceResponse>> getPreferences(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("OK", preferenceService.getPreferences(user.getUsername())));
    }

    @PutMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Save/update preferences for the authenticated customer")
    public ResponseEntity<ApiResponse<UserPreferenceResponse>> savePreferences(
            @RequestBody UserPreferenceRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Preferences saved", preferenceService.savePreferences(request, user.getUsername())));
    }
}

