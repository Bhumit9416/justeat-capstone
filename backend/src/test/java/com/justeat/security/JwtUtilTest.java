package com.justeat.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// Test 13 – JwtUtil generates valid token and extracts correct username
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 86400000L);

        userDetails = new User("testuser", "password",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
    }

    @Test
    void generateToken_validToken_extractsUsername() {
        String token = jwtUtil.generateToken(userDetails);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("testuser");
        assertThat(jwtUtil.isTokenValid(token, userDetails)).isTrue();
    }
}

