package com.nearme.dto.response;

import com.nearme.model.Request;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data @Builder
public class RequestResponse {
    private UUID requestId;
    private UUID blockId;
    private String blockName;
    private String type;
    private String title;
    private String description;
    private String imageUrl;
    private String visibility;
    private Double latitude;
    private Double longitude;
    private Instant expiryTime;
    private String status;
    private boolean anonymous;
    private Instant createdAt;
    private long expiresInSeconds;

    // Author info — null if anonymous
    private UUID userId;
    private String userName;
    private boolean studentVerified;
    private String collegeName;

    // Acceptance info — populated on detail fetch
    private UUID acceptanceId;
    private UUID acceptedUserId;
    private String acceptedUserName;
    private String acceptanceStatus;
    private Instant acceptedAt;

    // Per-user flag
    private boolean alreadyAccepted;

    public static RequestResponse from(Request r) {
        long expiresIn = Math.max(0,
            r.getExpiryTime().getEpochSecond() - Instant.now().getEpochSecond());

        return RequestResponse.builder()
            .requestId(r.getRequestId())
            .blockId(r.getBlock().getBlockId())
            .blockName(r.getBlock().getName())
            .type(r.getType().name().toLowerCase())
            .title(r.getTitle())
            .description(r.getDescription())
            .imageUrl(r.getImageUrl())
            .visibility(r.getVisibility().name().toLowerCase())
            .latitude(r.isAnonymous() ? null : r.getLatitude())
            .longitude(r.isAnonymous() ? null : r.getLongitude())
            .expiryTime(r.getExpiryTime())
            .status(r.getStatus().name().toLowerCase())
            .anonymous(r.isAnonymous())
            .createdAt(r.getCreatedAt())
            .expiresInSeconds(expiresIn)
            .userId(r.isAnonymous() ? null : r.getUser().getUserId())
            .userName(r.isAnonymous() ? "Anonymous" : r.getUser().getName())
            .studentVerified(r.getUser().isStudentVerified())
            .collegeName(r.isAnonymous() ? null : r.getUser().getCollegeName())
            .build();
    }
}