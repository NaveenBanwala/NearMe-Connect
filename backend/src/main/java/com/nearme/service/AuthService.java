package com.nearme.service;

import com.nearme.dto.response.AuthResponse;
import com.nearme.dto.response.UserResponse;
import com.nearme.exception.UnauthorizedException;
import com.nearme.model.User;
import com.nearme.repository.UserRepository;
import com.nearme.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository   userRepository;
    private final JwtTokenProvider tokenProvider;
    private final TwilioService    twilioService;

    // Step 1: Send OTP
    public void sendOtp(String phone) {
        twilioService.sendOtp(phone);
    }

    // Step 2: Verify OTP → create user if new → return JWT
    @Transactional
    public AuthResponse verifyOtp(String phone, String code, String name, String fcmToken) {
        boolean valid = twilioService.verifyOtp(phone, code);
        if (!valid) throw new UnauthorizedException("Invalid or expired OTP");

        User user = userRepository.findByPhone(phone).orElseGet(() -> {
            User newUser = User.builder()
                .phone(phone)
                .name(name != null ? name : "User")
                .phoneVerified(true)
                .lastSeenAt(Instant.now())
                .build();
            return userRepository.save(newUser);
        });

        user.setPhoneVerified(true);
        user.setLastSeenAt(Instant.now());
        if (fcmToken != null) user.setFcmToken(fcmToken);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUserId());
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresIn(tokenProvider.getExpiryMs() / 1000)
            .user(UserResponse.from(user))
            .build();
    }

    @Transactional
    public void updateFcmToken(UUID userId, String fcmToken) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setFcmToken(fcmToken);
            u.setLastSeenAt(Instant.now());
            userRepository.save(u);
        });
    }

    public UserResponse getMe(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        userRepository.updateLastSeen(userId, Instant.now());
        return UserResponse.from(user);
    }
}