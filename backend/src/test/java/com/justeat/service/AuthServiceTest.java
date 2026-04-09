package com.justeat.service;

import com.justeat.dto.LoginRequest;
import com.justeat.dto.RegisterRequest;
import com.justeat.dto.ResetPasswordRequest;
import com.justeat.dto.AuthResponse;
import com.justeat.entity.User;
import com.justeat.enums.Role;
import com.justeat.exception.BadRequestException;
import com.justeat.repository.UserRepository;
import com.justeat.security.JwtUtil;
import com.justeat.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock AuthenticationManager authenticationManager;
    @Mock UserDetailsService userDetailsService;
    @Mock JavaMailSender mailSender;

    @InjectMocks AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private User savedUser;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("john");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("Pass@1234");
        registerRequest.setRole(Role.CUSTOMER);

        savedUser = User.builder()
                .id(1L).username("john").email("john@example.com")
                .password("encoded").role(Role.CUSTOMER).build();

        userDetails = new org.springframework.security.core.userdetails.User(
                "john", "encoded",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
    }

    // Test 1 – register new user successfully
    @Test
    void register_newUser_returnsToken() {
        when(userRepository.existsByUsername("john")).thenReturn(false);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Pass@1234")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userDetailsService.loadUserByUsername("john")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUsername()).isEqualTo("john");
        assertThat(response.getRole()).isEqualTo(Role.CUSTOMER);
        verify(userRepository).save(any(User.class));
    }

    // Test 2 – register with duplicate username throws exception
    @Test
    void register_duplicateUsername_throwsBadRequest() {
        when(userRepository.existsByUsername("john")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Username already taken");
    }

    // Test 3 – login with valid credentials returns JWT
    @Test
    void login_validCredentials_returnsToken() {
        LoginRequest req = new LoginRequest();
        req.setUsername("john");
        req.setPassword("Pass@1234");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(savedUser));
        when(userDetailsService.loadUserByUsername("john")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUsername()).isEqualTo("john");
    }

    // Test 4 – login with bad password throws BadCredentialsException
    @Test
    void login_invalidPassword_throwsBadCredentials() {
        LoginRequest req = new LoginRequest();
        req.setUsername("john");
        req.setPassword("wrong");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }

    // Test 5 – resetPassword with expired token throws BadRequestException
    @Test
    void resetPassword_expiredToken_throwsBadRequest() {
        User user = User.builder()
                .resetToken("expired-token")
                .resetTokenExpiry(LocalDateTime.now().minusHours(2))
                .build();

        when(userRepository.findByResetToken("expired-token")).thenReturn(Optional.of(user));

        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("expired-token");
        req.setNewPassword("NewPass@1234");

        assertThatThrownBy(() -> authService.resetPassword(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("expired");
    }
}

