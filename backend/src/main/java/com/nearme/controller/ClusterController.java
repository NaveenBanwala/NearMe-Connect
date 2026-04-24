package com.nearme.controller;

import com.nearme.dto.request.NameSuggestionDto;
import com.nearme.dto.response.ClusterResponse;
import com.nearme.exception.UserNotFoundException;
import com.nearme.model.User;
import com.nearme.repository.UserRepository;
import com.nearme.service.ClusterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

// ============================================================
// ClusterController.java
// REST endpoints for unofficial activity clusters
//
// Base path: /api/clusters
//
// Endpoints:
//   GET  /api/clusters/nearby              → fetch visible clusters on map
//   GET  /api/clusters/:id                 → single cluster detail
//   GET  /api/clusters/:id/heat            → heat score only (lightweight poll)
//   POST /api/clusters/:id/suggest-name    → user suggests a name
//   POST /api/clusters/ping                → user location ping (drives formation)
// ============================================================

@RestController
@RequestMapping("/clusters")
@RequiredArgsConstructor
@Slf4j
public class ClusterController {

    private final ClusterService clusterService;

    private final UserRepository   userRepository;

    // -------------------------------------------------------
    // GET /api/clusters/nearby
    // Returns all visible clusters near a given lat/lng
    // Called by home map screen every time viewport changes
    //
    // Query params:
    //   lat    (required) — user's current latitude
    //   lng    (required) — user's current longitude
    //   radius (optional) — search radius in meters, default 3000
    // -------------------------------------------------------

    @GetMapping("/nearby")
    public ResponseEntity<List<ClusterResponse>> getNearbyClusters(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "3000") int radius
    ) {
        log.debug("GET /api/clusters/nearby — lat={}, lng={}, radius={}", lat, lng, radius);

        List<ClusterResponse> clusters = clusterService.getNearbyClusters(lat, lng, radius);
        return ResponseEntity.ok(clusters);
    }

    // -------------------------------------------------------
    // GET /api/clusters/:id
    // Returns full detail for a single cluster
    // Called when user taps a cluster blob on the map
    // -------------------------------------------------------

    @GetMapping("/{clusterId}")
    public ResponseEntity<ClusterResponse> getClusterById(
            @PathVariable UUID clusterId
    ) {
        log.debug("GET /api/clusters/{}", clusterId);

        ClusterResponse cluster = clusterService.getClusterById(clusterId);
        return ResponseEntity.ok(cluster);
    }

    // -------------------------------------------------------
    // GET /api/clusters/:id/heat
    // Lightweight endpoint — returns heat score and level only
    // Called by frontend every 2 minutes to refresh blob glow
    // Cheaper than fetching the full cluster object
    // -------------------------------------------------------

    @GetMapping("/{clusterId}/heat")
    public ResponseEntity<HeatOnlyResponse> getClusterHeat(
            @PathVariable UUID clusterId
    ) {
        log.debug("GET /api/clusters/{}/heat", clusterId);

        ClusterResponse cluster = clusterService.getClusterById(clusterId);

        HeatOnlyResponse heat = new HeatOnlyResponse(
                cluster.getClusterId(),
                cluster.getHeatScore(),
                cluster.getHeatLevel()
        );

        return ResponseEntity.ok(heat);
    }

    // -------------------------------------------------------
    // POST /api/clusters/:id/suggest-name
    // User suggests a name for an active cluster they are inside
    // Requires verified user
    //
    // Body: { "suggestedName": "KIIT Gate 4 Area" }
    // -------------------------------------------------------

    @PostMapping("/{clusterId}/suggest-name")
    public ResponseEntity<ClusterResponse> suggestName(
            @PathVariable UUID clusterId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody NameSuggestionDto dto
    ) {
        log.info("POST /api/clusters/{}/suggest-name — user={}, name='{}'",
                clusterId, currentUser.getUserId(), dto.getSuggestedName());

        ClusterResponse updated = clusterService.suggestName(clusterId, currentUser, dto);
        return ResponseEntity.ok(updated);
    }

    // -------------------------------------------------------
    // POST /api/clusters/ping
    // User location ping — drives cluster formation and updates
    // Called silently by the app every time user opens or moves
    // Returns the cluster the user is currently inside (if any)
    //
    // Body: { "lat": 20.2961, "lng": 85.8245 }
    // -------------------------------------------------------
@PostMapping("/ping")
public ResponseEntity<ClusterResponse> ping(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody PingRequest pingRequest
) {
    UUID userId = UUID.fromString(userDetails.getUsername());
    User currentUser = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

    log.debug("POST /api/clusters/ping — user={}, lat={}, lng={}",
            currentUser.getUserId(), pingRequest.lat(), pingRequest.lng());

    ClusterResponse cluster = clusterService.handleUserPing(
            currentUser, pingRequest.lat(), pingRequest.lng());

    return ResponseEntity.ok(cluster);
}
//     @PostMapping("/ping")
//     public ResponseEntity<ClusterResponse> ping(
//             @AuthenticationPrincipal User currentUser,
//             @Valid @RequestBody PingRequest pingRequest
//     ) {
//         log.debug("POST /api/clusters/ping — user={}, lat={}, lng={}",
//                 currentUser.getUserId(),
//                 pingRequest.lat(),
//                 pingRequest.lng());

//         ClusterResponse cluster = clusterService.handleUserPing(
//                 currentUser,
//                 pingRequest.lat(),
//                 pingRequest.lng()
//         );

//         return ResponseEntity.ok(cluster);
//     }

    // -------------------------------------------------------
    // Inline Request / Response Records
    // Small enough to live here — no need for separate DTO files
    // -------------------------------------------------------

    /**
     * Lightweight heat-only response.
     * Returned by GET /api/clusters/:id/heat
     */
    public record HeatOnlyResponse(
            UUID clusterId,
            Double heatScore,
            String heatLevel
    ) {}

    /**
     * User location ping request body.
     * Used by POST /api/clusters/ping
     */
    public record PingRequest(
            @jakarta.validation.constraints.NotNull double lat,
            @jakarta.validation.constraints.NotNull double lng
    ) {}
}