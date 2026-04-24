package com.nearme.service;

import com.nearme.dto.request.NameSuggestionDto;
import com.nearme.dto.response.ClusterResponse;
import com.nearme.exception.BlockNotFoundException;
import com.nearme.exception.UnauthorizedException;
import com.nearme.model.ActivityCluster;
import com.nearme.model.ActivityCluster.ClusterStatus;
import com.nearme.model.Request;
import com.nearme.model.User;
import com.nearme.repository.ClusterRepository;
import com.nearme.repository.RequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// ============================================================
// ClusterService.java
// Core business logic for unofficial activity clusters
// Handles: formation, lookup, naming, user pings, dismissal
// Promotion logic lives separately in ClusterPromotionService
// ============================================================

@Service
@RequiredArgsConstructor
@Slf4j
public class ClusterService {

    private final ClusterRepository clusterRepository;
    private final NotificationService notificationService;

    private final RequestRepository requestRepository;

    // Minimum number of verified users needed before a cluster
    // moves from FORMING → ACTIVE and becomes visible on the map
    private static final int MIN_USERS_TO_ACTIVATE = 2;

    // Search radius used when fetching clusters for the home map
    private static final int DEFAULT_NEARBY_RADIUS_METERS = 3000;

    // -------------------------------------------------------
    // 1. User Ping
    // Called every time a verified user opens the app or moves
    // Drives cluster formation and last_active_at updates
    // -------------------------------------------------------

    /**
     * Called when a verified user is seen active at a location.
     *
     * Flow:
     *   1. Check if an existing cluster is within 200m
     *   2. If yes → update that cluster (increment user count, touch last_active)
     *   3. If no  → create a new FORMING cluster centered on user's location
     *   4. If cluster now has 2+ users → promote to ACTIVE
     *
     * @param user     the verified user who just pinged
     * @param lat      user's current latitude
     * @param lng      user's current longitude
     */


     @Transactional
    public ClusterResponse handleUserPing(User user, double lat, double lng) {

        Optional<ActivityCluster> existing =
                clusterRepository.findExistingClusterNear(lat, lng);

        ActivityCluster cluster;

        if (existing.isPresent()) {
            cluster = existing.get();
            clusterRepository.incrementUserCount(cluster.getClusterId());
            clusterRepository.touchLastActive(cluster.getClusterId(), LocalDateTime.now());
            cluster.setUniqueUserCount(cluster.getUniqueUserCount() + 1);
            log.debug("User pinged into existing cluster {}", cluster.getClusterId());
        } else {
            cluster = ActivityCluster.builder()
                    .centerLat(lat)
                    .centerLng(lng)
                    .radiusMeters(500)
                    .uniqueUserCount(1)
                    .requestCount(0)
                    .activeDays(1)
                    .heatScore(0.0)
                    .status(ClusterStatus.FORMING)
                    .lastActiveAt(LocalDateTime.now())
                    .build();

            cluster = clusterRepository.save(cluster);
            log.info("New cluster FORMING at ({}, {}), id={}", lat, lng, cluster.getClusterId());
        }

        // ── REPLACE the old if-block with this ──────────────────
        if (cluster.getStatus() == ClusterStatus.FORMING
                && cluster.getUniqueUserCount() >= MIN_USERS_TO_ACTIVATE) {
            cluster.setStatus(ClusterStatus.ACTIVE);
            clusterRepository.save(cluster);
            log.info("Cluster {} promoted FORMING → ACTIVE", cluster.getClusterId());

            linkOrphanFreePins(cluster);   // ← pulls in nearby free-pin requests
        }
        // ────────────────────────────────────────────────────────

        return ClusterResponse.from(cluster);
    }

        private void linkOrphanFreePins(ActivityCluster cluster) {
        List<Request> orphans = requestRepository.findFreePinsNear(
            cluster.getCenterLat(),
            cluster.getCenterLng(),
            cluster.getRadiusMeters()
        );

        if (!orphans.isEmpty()) {
            for (Request r : orphans) {
                r.setCluster(cluster);
            }
            requestRepository.saveAll(orphans);
            log.info("Linked {} orphan free-pin(s) into cluster {}",
                orphans.size(), cluster.getClusterId());
        }
    }
    // @Transactional
    // public ClusterResponse handleUserPing(User user, double lat, double lng) {

    //     Optional<ActivityCluster> existing =
    //             clusterRepository.findExistingClusterNear(lat, lng);

    //     ActivityCluster cluster;

    //     if (existing.isPresent()) {
    //         // Update existing cluster
    //         cluster = existing.get();
    //         clusterRepository.incrementUserCount(cluster.getClusterId());
    //         clusterRepository.touchLastActive(cluster.getClusterId(), LocalDateTime.now());
    //         cluster.setUniqueUserCount(cluster.getUniqueUserCount() + 1);
    //         log.debug("User pinged into existing cluster {}", cluster.getClusterId());
    //     } else {
    //         // Create new FORMING cluster centered on user's location
    //         cluster = ActivityCluster.builder()
    //                 .centerLat(lat)
    //                 .centerLng(lng)
    //                 .radiusMeters(500)
    //                 .uniqueUserCount(1)
    //                 .requestCount(0)
    //                 .activeDays(1)
    //                 .heatScore(0.0)
    //                 .status(ClusterStatus.FORMING)
    //                 .lastActiveAt(LocalDateTime.now())
    //                 .build();

    //         cluster = clusterRepository.save(cluster);
    //         log.info("New cluster FORMING at ({}, {}), id={}", lat, lng, cluster.getClusterId());
    //     }

    //     // Promote FORMING → ACTIVE if user threshold is now met
    //     if (cluster.getStatus() == ClusterStatus.FORMING
    //             && cluster.getUniqueUserCount() >= MIN_USERS_TO_ACTIVATE) {
    //         cluster.setStatus(ClusterStatus.ACTIVE);
    //         clusterRepository.save(cluster);
    //         log.info("Cluster {} promoted FORMING → ACTIVE", cluster.getClusterId());
    //     }

    //     return ClusterResponse.from(cluster);
    // }

    // -------------------------------------------------------
    // 2. Fetch Nearby Clusters
    // Called by home map screen to show blobs in viewport
    // -------------------------------------------------------

    /**
     * Returns all visible clusters within the default nearby radius
     * of the user's current location.
     * Only ACTIVE and FLAGGED_FOR_ADMIN clusters are returned.
     */
    public List<ClusterResponse> getNearbyClusters(double lat, double lng) {
        return getNearbyClusters(lat, lng, DEFAULT_NEARBY_RADIUS_METERS);
    }

    /**
     * Returns all visible clusters within a custom radius (meters).
     */
    public List<ClusterResponse> getNearbyClusters(double lat, double lng, int radiusMeters) {
        List<ActivityCluster> clusters =
                clusterRepository.findNearbyClusters(lat, lng, radiusMeters);

        return clusters.stream()
                .map(ClusterResponse::from)
                .toList();
    }

    // -------------------------------------------------------
    // 3. Get Single Cluster
    // Called when user taps a cluster blob on the map
    // -------------------------------------------------------

    /**
     * Returns a single cluster by ID.
     * Throws BlockNotFoundException (reused) if not found or not visible.
     */
    public ClusterResponse getClusterById(UUID clusterId) {
        ActivityCluster cluster = findActiveClusterOrThrow(clusterId);
        return ClusterResponse.from(cluster);
    }

    // -------------------------------------------------------
    // 4. Name Suggestion
    // Called when a user inside a cluster taps "Suggest a name"
    // -------------------------------------------------------

    /**
     * Records a name suggestion from a user inside an active cluster.
     *
     * Simple strategy: last suggestion wins.
     * Can be upgraded later to a voting/frequency model without
     * changing this method's signature.
     *
     * @param clusterId  the cluster being named
     * @param user       the user making the suggestion
     * @param dto        contains the suggested name string
     */
    @Transactional
    public ClusterResponse suggestName(UUID clusterId, User user, NameSuggestionDto dto) {

        ActivityCluster cluster = findActiveClusterOrThrow(clusterId);

        // Only allow name suggestions from verified users
        if (!user.isPhoneVerified()) {
            throw new UnauthorizedException("Only verified users can suggest names");
        }

        String cleanName = dto.getSuggestedName().trim();
        clusterRepository.updateSuggestedName(clusterId, cleanName);
        cluster.setSuggestedName(cleanName);

        log.info("Cluster {} name suggested: '{}' by user {}",
                clusterId, cleanName, user.getUserId());

        return ClusterResponse.from(cluster);
    }

    // -------------------------------------------------------
    // 5. Request Posted Inside Cluster
    // Called by RequestService when a request is created inside a cluster
    // Increments request_count on the cluster
    // -------------------------------------------------------

    @Transactional
    public void onRequestPostedInCluster(UUID clusterId) {
        clusterRepository.findById(clusterId).ifPresent(cluster -> {
            clusterRepository.incrementRequestCount(clusterId);
            clusterRepository.touchLastActive(clusterId, LocalDateTime.now());
            log.debug("Request posted in cluster {}, count incremented", clusterId);
        });
    }

    // -------------------------------------------------------
    // 6. Recalculate Center
    // Called by scheduler when user spread changes significantly
    // Updates center_lat, center_lng, and radius_meters
    // -------------------------------------------------------

    /**
     * Recalculates the geographic center and radius of a cluster
     * based on the current spread of active users.
     *
     * @param clusterId   the cluster to update
     * @param newCenterLat new calculated center latitude
     * @param newCenterLng new calculated center longitude
     * @param newRadius    new calculated radius in meters
     */
    @Transactional
    public void recalculateClusterBounds(UUID clusterId,
                                          double newCenterLat,
                                          double newCenterLng,
                                          int newRadius) {
        clusterRepository.findById(clusterId).ifPresent(cluster -> {
            cluster.setCenterLat(newCenterLat);
            cluster.setCenterLng(newCenterLng);
            cluster.setRadiusMeters(newRadius);
            clusterRepository.save(cluster);
            log.debug("Cluster {} bounds updated: center=({},{}), radius={}m",
                    clusterId, newCenterLat, newCenterLng, newRadius);
        });
    }

    // -------------------------------------------------------
    // 7. Admin: Dismiss Cluster
    // Called when admin rejects a flagged cluster
    // Notifies users who were active in this area
    // -------------------------------------------------------

    @Transactional
    public void dismissCluster(UUID clusterId) {
        ActivityCluster cluster = clusterRepository.findById(clusterId)
                .orElseThrow(() -> new BlockNotFoundException("Cluster not found: " + clusterId));

        cluster.setStatus(ClusterStatus.DISMISSED);
        clusterRepository.save(cluster);

        log.info("Cluster {} dismissed by admin", clusterId);
        // Notification to affected users handled by admin controller flow
    }

    // -------------------------------------------------------
    // 8. Admin: Mark Converted
    // Called by ClusterPromotionService after admin approves
    // and an official block has been created
    // -------------------------------------------------------

    @Transactional
    public void markClusterConverted(UUID clusterId, UUID newBlockId) {
        ActivityCluster cluster = clusterRepository.findById(clusterId)
                .orElseThrow(() -> new BlockNotFoundException("Cluster not found: " + clusterId));

        cluster.markConverted(newBlockId);
        clusterRepository.save(cluster);

        log.info("Cluster {} converted to official block {}", clusterId, newBlockId);
    }

    // -------------------------------------------------------
    // 9. Get All Flagged (Admin View)
    // Returns all clusters waiting for admin review
    // -------------------------------------------------------

    public List<ClusterResponse> getFlaggedClusters() {
        return clusterRepository
                .findAllByStatusOrderByFlaggedAtDesc(ClusterStatus.FLAGGED_FOR_ADMIN)
                .stream()
                .map(ClusterResponse::from)
                .toList();
    }

    // -------------------------------------------------------
    // Internal Helpers
    // -------------------------------------------------------

    /**
     * Loads a cluster by ID and verifies it is active (visible + accepting requests).
     * Throws BlockNotFoundException if not found or not in an active state.
     */
    private ActivityCluster findActiveClusterOrThrow(UUID clusterId) {
        ActivityCluster cluster = clusterRepository.findById(clusterId)
                .orElseThrow(() -> new BlockNotFoundException("Cluster not found: " + clusterId));

        if (!cluster.isActive()) {
            throw new BlockNotFoundException(
                    "Cluster " + clusterId + " is not currently active (status=" + cluster.getStatus() + ")"
            );
        }
        return cluster;
    }
}