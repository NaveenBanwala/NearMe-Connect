package com.nearme.service;

import com.nearme.model.ActivityCluster;
import com.nearme.model.ActivityCluster.ClusterStatus;
import com.nearme.repository.ClusterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import com.nearme.model.Block;

// ============================================================
// ClusterPromotionService.java
// Handles threshold checking and admin flagging
// Called hourly by ClusterFormationScheduler
//
// Separated from ClusterService intentionally:
// - ClusterService  = user-facing operations (ping, name, fetch)
// - This service    = background lifecycle management
// ============================================================

@Service
@RequiredArgsConstructor
@Slf4j
public class ClusterPromotionService {

    private final ClusterRepository clusterRepository;
    private final NotificationService notificationService;

    // -------------------------------------------------------
    // Thresholds — admin-configurable via application.yml
    // These are per-category defaults; future ThresholdEditor
    // will let admin override per category from the dashboard
    // -------------------------------------------------------

    // Campus thresholds
    @Value("${nearme.cluster.threshold.campus.users:20}")
    private int campusMinUsers;

    @Value("${nearme.cluster.threshold.campus.requests:10}")
    private int campusMinRequests;

    @Value("${nearme.cluster.threshold.campus.days:3}")
    private int campusMinDays;

    // Locality thresholds
    @Value("${nearme.cluster.threshold.locality.users:10}")
    private int localityMinUsers;

    @Value("${nearme.cluster.threshold.locality.requests:5}")
    private int localityMinRequests;

    @Value("${nearme.cluster.threshold.locality.days:2}")
    private int localityMinDays;

    // Small lane thresholds (most lenient)
    @Value("${nearme.cluster.threshold.lane.users:5}")
    private int laneMinUsers;

    @Value("${nearme.cluster.threshold.lane.requests:3}")
    private int laneMinRequests;

    @Value("${nearme.cluster.threshold.lane.days:1}")
    private int laneMinDays;

    // -------------------------------------------------------
    // 1. Main Promotion Check
    // Entry point called by ClusterFormationScheduler every hour
    // -------------------------------------------------------

    /**
     * Scans all ACTIVE clusters and flags any that have met
     * the promotion thresholds for their inferred category.
     *
     * Since clusters don't have a category until admin assigns one,
     * we use the most lenient threshold set (small lane) as the
     * trigger — admin then decides the actual category on review.
     */
    @Transactional
    public void checkAndFlagMatureClusters() {
        log.info("ClusterPromotionService: starting threshold check for all ACTIVE clusters");

        // Use lane thresholds as the minimum bar
        // Any cluster meeting even the lowest bar gets flagged for admin
        List<ActivityCluster> readyClusters = clusterRepository
                .findClustersReadyForPromotion(laneMinUsers, laneMinRequests, laneMinDays);

        if (readyClusters.isEmpty()) {
            log.info("ClusterPromotionService: no clusters ready for promotion");
            return;
        }

        int flaggedCount = 0;

        for (ActivityCluster cluster : readyClusters) {
            flagClusterForAdmin(cluster);
            flaggedCount++;
        }

        log.info("ClusterPromotionService: flagged {} cluster(s) for admin review", flaggedCount);
    }

    private Block.BlockCategory suggestCategory(ActivityCluster cluster) {
    int users    = cluster.getUniqueUserCount();
    int requests = cluster.getRequestCount();
    int days     = cluster.getActiveDays();

    if (users >= 20 && requests >= 10 && days >= 3) return Block.BlockCategory.CAMPUS;
    if (users >= 10 && requests >= 5  && days >= 2) return Block.BlockCategory.LOCALITY;
    if (users >= 8  && requests >= 4  && days >= 2) return Block.BlockCategory.SOCIETY;
    if (users >= 6  && requests >= 3  && days >= 1) return Block.BlockCategory.MARKET;
    return Block.BlockCategory.VILLAGE;
}

    // -------------------------------------------------------
    // 2. Flag Individual Cluster
    // Transitions status → FLAGGED_FOR_ADMIN and notifies admin
    // -------------------------------------------------------

    /**
     * Flags a single cluster for admin review.
     * Sends a push notification to all admin accounts.
     *
     * @param cluster the cluster that has met promotion thresholds
     */
    @Transactional
    public void flagClusterForAdmin(ActivityCluster cluster) {
        cluster.setSuggestedCategory(suggestCategory(cluster));
        cluster.flagForAdmin();
        clusterRepository.save(cluster);

        log.info("Cluster {} flagged for admin — users={}, requests={}, days={}",
                cluster.getClusterId(),
                cluster.getUniqueUserCount(),
                cluster.getRequestCount(),
                cluster.getActiveDays());

        // Build notification message for admin
        String message = buildAdminNotificationMessage(cluster);
        notificationService.notifyAdmins(message, cluster.getClusterId().toString());
    }

    // -------------------------------------------------------
    // 3. Increment Active Days Counter
    // Called once daily by ClusterFormationScheduler
    // Only increments for clusters that had activity today
    // -------------------------------------------------------

    /**
     * Increments the active_days counter for all clusters that
     * were active in the last 24 hours.
     *
     * A cluster is considered active today if its last_active_at
     * is within the last 24 hours.
     */
    @Transactional
    public void incrementActiveDaysForActiveClusters() {
        List<ActivityCluster> activeClusters =
                clusterRepository.findAllByStatus(ClusterStatus.ACTIVE);

        java.time.LocalDateTime cutoff =
                java.time.LocalDateTime.now().minusHours(24);

        int incremented = 0;

        for (ActivityCluster cluster : activeClusters) {
            if (cluster.getLastActiveAt() != null
                    && cluster.getLastActiveAt().isAfter(cutoff)) {
                cluster.setActiveDays(cluster.getActiveDays() + 1);
                clusterRepository.save(cluster);
                incremented++;
            }
        }

        log.info("ClusterPromotionService: incremented active_days for {} cluster(s)", incremented);
    }

    // -------------------------------------------------------
    // 4. Stale Cluster Cleanup
    // Clusters inactive for 7+ days revert to FORMING
    // so they don't stay visible on the map forever
    // -------------------------------------------------------

    /**
     * Marks clusters as FORMING (hidden from map) if they have had
     * no activity in the last 7 days.
     *
     * This handles the case where a temporary gathering (event, meetup)
     * creates a cluster that then goes silent — it fades off the map
     * rather than staying as a ghost blob.
     */
    @Transactional
    public void deactivateStaleClusters() {
        java.time.LocalDateTime staleCutoff =
                java.time.LocalDateTime.now().minusDays(7);

        List<ActivityCluster> staleClusters =
                clusterRepository.findAllByStatusInAndLastActiveAtAfter(
                        List.of(ClusterStatus.ACTIVE),
                        staleCutoff
                );

        // Note: findAllByStatusInAndLastActiveAtAfter returns active AFTER cutoff
        // We want BEFORE cutoff — fetch all active and filter manually
        // TODO: add findAllByStatusAndLastActiveAtBefore to repository
        List<ActivityCluster> activeClusters =
                clusterRepository.findAllByStatus(ClusterStatus.ACTIVE);

        int deactivated = 0;

        for (ActivityCluster cluster : activeClusters) {
            if (cluster.getLastActiveAt() != null
                    && cluster.getLastActiveAt().isBefore(staleCutoff)) {
                cluster.setStatus(ClusterStatus.FORMING);
                clusterRepository.save(cluster);
                deactivated++;
                log.info("Cluster {} deactivated — stale since {}",
                        cluster.getClusterId(), cluster.getLastActiveAt());
            }
        }

        log.info("ClusterPromotionService: deactivated {} stale cluster(s)", deactivated);
    }

    // -------------------------------------------------------
    // 5. Post-Conversion: Notify Users in Area
    // Called by ClusterService.markClusterConverted()
    // after admin approves and official block is live
    // -------------------------------------------------------

    /**
     * Sends a notification to all users who were active in a cluster
     * that has just been promoted to an official block.
     *
     * @param clusterId   the cluster that was promoted
     * @param blockName   the name of the new official block
     * @param newBlockId  the UUID of the new official block
     */
    public void notifyUsersOfPromotion(UUID clusterId, String blockName, UUID newBlockId) {
        String message = String.format(
                "Great news! The area you've been active in is now an official block: \"%s\". "
                        + "You can now find it on the map with full block features.",
                blockName
        );

        // NotificationService handles fetching affected user IDs
        // by querying requests and acceptances tied to this cluster
        notificationService.notifyClusterUsers(clusterId, message, newBlockId.toString());

        log.info("Promotion notification sent for cluster {} → block {} ({})",
                clusterId, blockName, newBlockId);
    }

    // -------------------------------------------------------
    // Internal Helpers
    // -------------------------------------------------------

    private String buildAdminNotificationMessage(ActivityCluster cluster) {
        return String.format(
                "New area showing consistent activity — %d users, %d requests over %d day(s). "
                        + "Center: %.4f°N, %.4f°E. Tap to review and draw boundary.",
                cluster.getUniqueUserCount(),
                cluster.getRequestCount(),
                cluster.getActiveDays(),
                cluster.getCenterLat(),
                cluster.getCenterLng()
        );
    }
}