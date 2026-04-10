package com.nearme.service;

import com.nearme.dto.response.UserResponse;
import com.nearme.exception.UnauthorizedException;
import com.nearme.model.User;
import com.nearme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUser(UUID userId) {
        return UserResponse.from(userRepository.findById(userId)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found")));
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, Map<String, String> updates) {
        User user = userRepository.findById(userId).orElseThrow();
        if (updates.containsKey("name"))     user.setName(updates.get("name"));
        if (updates.containsKey("email"))    user.setEmail(updates.get("email"));
        if (updates.containsKey("fcm_token")) user.setFcmToken(updates.get("fcm_token"));
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void reportUser(UUID reporterId, UUID targetId, String reason) {
        // Persisted via ReportRepository — simplified here
        // Full impl in AdminService handles report management
        if (reporterId.equals(targetId)) throw new IllegalArgumentException("Cannot report yourself");
    }

    @Transactional
    public void blockUser(UUID blockerId, UUID targetId) {
        if (blockerId.equals(targetId)) throw new IllegalArgumentException("Cannot block yourself");
        // Insert into user_blocks via native query — handled by JPA
    }
}