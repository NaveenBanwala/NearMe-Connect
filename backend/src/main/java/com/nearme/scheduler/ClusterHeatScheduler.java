package com.nearme.scheduler;

import com.nearme.model.ActivityCluster;
import com.nearme.model.ActivityCluster.ClusterStatus;
import com.nearme.repository.ClusterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// ============================================================
// ClusterHeatScheduler.java
// Recalculates heat scores for all active clusters every 2 minutes
//
// Heat Formula (mirrors official block formula):
//   (liveUsers × 1.0) + (openRequests × 1.5) + (newRequestsLastHour × 0.5)
//
// A user counts as live if last_seen_at is within 15 minutes
// Heat decays automatically as users leave — no manual cleanup
//
// Runs every 2 minutes, same cadence as the block heat scheduler
// ============================================================

@Component
@RequiredArgsConstructor
@Slf4j
public class ClusterHeatScheduler {

    private final ClusterRepository clusterRepository;

    // Heat formula weights — mirrors HeatScoreScheduler for official blocks
    private static final double LIVE_USER_WEIGHT        = 1.0;
    private static final double OPEN_REQUEST_WEIGHT     = 1.5;
    private static final double NEW_REQUEST_HOUR_WEIGHT = 0.5;

    // A user is considered "live" if active within this window
    private static final int LIVE_USER_WINDOW_MINUTES = 15;

    // -------------------------------------------------------
    // Main Job — runs every 2 minutes
    // -------------------------------------------------------

    @Scheduled(fixedRate = 120_000) // 120,000ms = 2 minutes
    @Transactional
    public void recalculateClusterHeatScores() {
        log.debug("ClusterHeatScheduler: heat recalculation starting");

        // Only recalculate for visible clusters
        // FORMING and DISMISSED clusters don't need heat scores
        List<ActivityCluster> activeClusters = clusterRepository
                .findAllByStatusInAndLastActiveAtAfter(
                        List.of(ClusterStatus.ACTIVE, ClusterStatus.FLAGGED_FOR_ADMIN),
                        LocalDateTime.now().minusMinutes(30) // only clusters active in last 30 min
                );

        if (activeClusters.isEmpty()) {
            log.debug("ClusterHeatScheduler: no active clusters to update");
            return;
        }

        int updated = 0;

        for (ActivityCluster cluster : activeClusters) {
            try {
                double newHeatScore = calculateHeatScore(cluster);
                clusterRepository.updateHeatScore(
                        cluster.getClusterId(),
                        newHeatScore,
                        LocalDateTime.now()
                );
                updated++;
            } catch (Exception e) {
                // Log and continue — one cluster failure must not stop the rest
                log.error("ClusterHeatScheduler: failed to update heat for cluster {} — {}",
                        cluster.getClusterId(), e.getMessage());
            }
        }

        log.debug("ClusterHeatScheduler: updated heat for {} cluster(s)", updated);
    }

    // -------------------------------------------------------
    // Heat Score Calculation
    //
    // For clusters we use stored counters (uniqueUserCount, requestCount)
    // as a proxy since we don't have a separate live_users table per cluster.
    //
    // A more precise implementation would query:
    //   - COUNT of users with last_seen_at within 15 min and GPS inside cluster radius
    //   - COUNT of open (non-expired) requests tied to this cluster
    //   - COUNT of requests created in the last hour for this cluster
    //
    // That requires joining users and requests tables on every tick.
    // For MVP, we use the stored counters with a decay factor.
    // Replace calculateHeatScore() with DB queries post-MVP.
    // -------------------------------------------------------

    /**
     * Calculates heat score for a cluster using stored counters.
     *
     * MVP formula uses stored counts with a recency decay:
     *   - uniqueUserCount is treated as approximate live users
     *   - requestCount split into open (70%) and last-hour (30%) estimate
     *
     * Post-MVP: replace with direct DB queries against users.last_seen_at
     * and requests.created_at for precise live counts.
     */
    private double calculateHeatScore(ActivityCluster cluster) {
        // Approximate live users from stored unique_user_count
        // Apply recency decay based on how long ago cluster was last active
        double liveUserEstimate = estimateLiveUsers(cluster);

        // Approximate open requests: 70% of total request count
        double openRequestEstimate = cluster.getRequestCount() * 0.7;

        // Approximate requests in last hour: 30% of total request count
        double recentRequestEstimate = cluster.getRequestCount() * 0.3;

        double heat = (liveUserEstimate    * LIVE_USER_WEIGHT)
                    + (openRequestEstimate  * OPEN_REQUEST_WEIGHT)
                    + (recentRequestEstimate * NEW_REQUEST_HOUR_WEIGHT);

        // Floor at 0 — heat never goes negative
        return Math.max(0.0, heat);
    }

    /**
     * Estimates live user count based on recency of last activity.
     * Decays the stored unique_user_count based on how stale the cluster is.
     *
     * Within 15 min  → full count
     * 15–30 min      → 50% count
     * 30–60 min      → 20% count
     * 60+ min        → 0 (cluster is stale, heat decays to near zero)
     */
    private double estimateLiveUsers(ActivityCluster cluster) {
        if (cluster.getLastActiveAt() == null) return 0;

        long minutesSinceActive = java.time.Duration.between(
                cluster.getLastActiveAt(), LocalDateTime.now()
        ).toMinutes();

        if (minutesSinceActive <= LIVE_USER_WINDOW_MINUTES) {
            return cluster.getUniqueUserCount();           // full
        } else if (minutesSinceActive <= 30) {
            return cluster.getUniqueUserCount() * 0.5;    // 50% decay
        } else if (minutesSinceActive <= 60) {
            return cluster.getUniqueUserCount() * 0.2;    // 80% decay
        } else {
            return 0;                                      // fully decayed
        }
    }
}