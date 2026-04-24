package com.nearme.controller;

import com.nearme.dto.request.CreateRequestDto;
import com.nearme.dto.response.RequestResponse;
import com.nearme.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
@Slf4j
public class RequestController {

    private final RequestService requestService;

    // ── GET /api/requests?blockId=&mode=&type=&page= ──────────────
    // blockId is required for the block feed (existing flow)
    @GetMapping
    public ResponseEntity<List<RequestResponse>> getFeed(
        @AuthenticationPrincipal UserDetails principal,
        @RequestParam UUID blockId,
        @RequestParam(required = false, defaultValue = "campus") String mode,
        @RequestParam(required = false) String type,
        @RequestParam(defaultValue = "0") int page
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(
            requestService.getFeed(blockId, userId, mode, type, page));
    }

    // ── GET /api/requests/radius?lat=&lng=&radius= ────────────────
    // Used by HomeMapScreen to populate the "Nearby Requests" panel
    @GetMapping("/radius")
public ResponseEntity<List<RequestResponse>> getInRadius(
    @AuthenticationPrincipal UserDetails principal,
    @RequestParam double lat,
    @RequestParam double lng,
    @RequestParam(defaultValue = "2000") double radius
) {
    // Check if principal is null before using it
    UUID userId = (principal != null) ? UUID.fromString(principal.getUsername()) : null;
    return ResponseEntity.ok(requestService.getInRadius(userId, lat, lng, radius));
}

    // ── POST /api/requests ────────────────────────────────────────
    // Accepts block requests, cluster requests, and free-pin requests.
    // The DTO's blockId, clusterId, and lat/lng are all nullable;
    // RequestService.create() decides which path to take.
    @PostMapping
    public ResponseEntity<RequestResponse> create(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody CreateRequestDto dto
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        log.info("POST /api/requests — user={}, blockId={}, clusterId={}, freePinPin={}",
            userId, dto.getBlockId(), dto.getClusterId(), dto.isFreePinRequest());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(requestService.create(userId, dto));
    }

    // ── GET /api/requests/:id ─────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<RequestResponse> getById(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(requestService.getById(id, userId));
    }

    // ── POST /api/requests/:id/accept ────────────────────────────
    @PostMapping("/{id}/accept")
    public ResponseEntity<RequestResponse> accept(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(requestService.accept(id, userId));
    }

    // ── PATCH /api/requests/:id/close ────────────────────────────
    @PatchMapping("/{id}/close")
    public ResponseEntity<Void> close(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        requestService.close(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ── DELETE /api/requests/:id ──────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID id
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        requestService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}