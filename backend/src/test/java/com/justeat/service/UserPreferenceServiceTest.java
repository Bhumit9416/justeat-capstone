package com.justeat.service;

import com.justeat.dto.UserPreferenceRequest;
import com.justeat.dto.UserPreferenceResponse;
import com.justeat.entity.User;
import com.justeat.entity.UserPreference;
import com.justeat.enums.Role;
import com.justeat.mapper.EntityMapper;
import com.justeat.repository.UserPreferenceRepository;
import com.justeat.repository.UserRepository;
import com.justeat.service.impl.UserPreferenceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserPreferenceServiceTest {

    @Mock UserPreferenceRepository preferenceRepository;
    @Mock UserRepository userRepository;
    @Mock EntityMapper mapper;

    @InjectMocks UserPreferenceServiceImpl preferenceService;

    private User customer;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).username("customer1").role(Role.CUSTOMER).build();
    }

    // Test 12 – savePreferences persists correctly
    @Test
    void savePreferences_persistsCorrectly() {
        UserPreferenceRequest request = new UserPreferenceRequest();
        request.setPreferredCuisines(List.of("Italian", "Chinese"));
        request.setDietaryRestrictions(List.of("vegan"));
        request.setFavouriteRestaurantIds(List.of(1L, 2L));

        UserPreference saved = UserPreference.builder()
                .id(1L).user(customer)
                .preferredCuisines(List.of("Italian", "Chinese"))
                .dietaryRestrictions(List.of("vegan"))
                .favouriteRestaurantIds(List.of(1L, 2L))
                .build();

        UserPreferenceResponse mockResponse = UserPreferenceResponse.builder()
                .userId(1L)
                .preferredCuisines(List.of("Italian", "Chinese"))
                .dietaryRestrictions(List.of("vegan"))
                .favouriteRestaurantIds(List.of(1L, 2L))
                .build();

        when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(customer));
        when(preferenceRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(UserPreference.class))).thenReturn(saved);
        when(mapper.toPreferenceResponse(any())).thenReturn(mockResponse);

        UserPreferenceResponse response = preferenceService.savePreferences(request, "customer1");

        assertThat(response.getPreferredCuisines()).contains("Italian", "Chinese");
        assertThat(response.getDietaryRestrictions()).contains("vegan");
        verify(preferenceRepository).save(any(UserPreference.class));
    }
}

