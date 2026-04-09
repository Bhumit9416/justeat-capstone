package com.justeat.service.impl;

import com.justeat.dto.UserPreferenceRequest;
import com.justeat.dto.UserPreferenceResponse;
import com.justeat.entity.User;
import com.justeat.entity.UserPreference;
import com.justeat.exception.ResourceNotFoundException;
import com.justeat.mapper.EntityMapper;
import com.justeat.repository.UserPreferenceRepository;
import com.justeat.repository.UserRepository;
import com.justeat.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserPreferenceServiceImpl implements UserPreferenceService {

    private final UserPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @Override
    public UserPreferenceResponse getPreferences(String username) {
        User user = getUser(username);
        UserPreference pref = preferenceRepository.findByUserId(user.getId())
                .orElse(UserPreference.builder().user(user).build());
        return mapper.toPreferenceResponse(pref);
    }

    @Override
    public UserPreferenceResponse savePreferences(UserPreferenceRequest request, String username) {
        User user = getUser(username);
        UserPreference pref = preferenceRepository.findByUserId(user.getId())
                .orElse(UserPreference.builder().user(user).build());

        if (request.getFavouriteRestaurantIds() != null)
            pref.setFavouriteRestaurantIds(request.getFavouriteRestaurantIds());
        if (request.getPreferredCuisines() != null)
            pref.setPreferredCuisines(request.getPreferredCuisines());
        if (request.getDietaryRestrictions() != null)
            pref.setDietaryRestrictions(request.getDietaryRestrictions());

        UserPreference saved = preferenceRepository.save(pref);
        log.info("Preferences saved for user {}", username);
        return mapper.toPreferenceResponse(saved);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}

