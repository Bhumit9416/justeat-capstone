package com.justeat.service;

import com.justeat.dto.AuthResponse;
import com.justeat.dto.LoginRequest;
import com.justeat.dto.RegisterRequest;
import com.justeat.dto.ResetPasswordRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void forgotPassword(String email);
    void resetPassword(ResetPasswordRequest request);
}

