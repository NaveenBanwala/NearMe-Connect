package com.nearme.dto.request;

import com.nearme.model.Request;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CreateRequestDto {

    // ── Context: exactly ONE of these three should be provided ───
    // Validated in RequestService, not via Bean Validation,
    // because cross-field constraints in Jakarta are cumbersome.

    // Present when user is inside an official block
    private UUID blockId;          // nullable

    // Present when user is inside an unofficial cluster
    private UUID clusterId;        // nullable

    // Present when user is in open space (free-pin)
    // lat/lng are also used for precise pin-on-map for block/cluster requests
    private Double latitude;       // required for free-pin; optional otherwise
    private Double longitude;      // required for free-pin; optional otherwise

    // ── Required for all request types ───────────────────────────

    @NotNull
    private Request.RequestType type;

    @NotBlank
    @Size(max = 150)
    private String title;

    @Size(max = 1000)
    private String description;

    private String imageUrl;

    @NotNull
    private Request.Visibility visibility;

    @NotNull
    @Future
    private Instant expiryTime;

    private boolean anonymous = false;

    // ── Derived helpers used by RequestService ────────────────────

    public boolean isBlockRequest()   { return blockId   != null; }
    public boolean isClusterRequest() { return clusterId != null; }
    public boolean isFreePinRequest() { return blockId == null && clusterId == null; }
}