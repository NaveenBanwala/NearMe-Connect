package com.nearme.dto.response;

import com.nearme.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data @Builder
public class UserResponse {
    private UUID userId;
    private String name;
    private String phone;
    private String email;
    private boolean admin;          // ← add this
    private boolean phoneVerified;
    private boolean studentVerified;
    private String collegeName;
    private User.VerificationStatus verificationStatus;
    private UUID campusBlockId;
    private User.UserStatus status;
    private Instant createdAt;
    private Instant lastSeenAt;

    public static UserResponse from(User u) {
        return UserResponse.builder()
            .userId(u.getUserId())
            .name(u.getName())
            .phone(u.getPhone())
            .email(u.getEmail())
            .admin(u.isAdmin())     // ← add this
            .phoneVerified(u.isPhoneVerified())
            .studentVerified(u.isStudentVerified())
            .collegeName(u.getCollegeName())
            .verificationStatus(u.getVerificationStatus())
            .campusBlockId(u.getCampusBlockId())
            .status(u.getStatus())
            .createdAt(u.getCreatedAt())
            .lastSeenAt(u.getLastSeenAt())
            .build();
    }
}