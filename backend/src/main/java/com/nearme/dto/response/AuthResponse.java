package com.nearme.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data @Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private long expiresIn;
    private UserResponse user;
}