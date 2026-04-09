package com.justeat.service;

import com.justeat.dto.UserPreferenceRequest;
import com.justeat.dto.UserPreferenceResponse;

public interface UserPreferenceService {
    UserPreferenceResponse getPreferences(String username);
    UserPreferenceResponse savePreferences(UserPreferenceRequest request, String username);
}

