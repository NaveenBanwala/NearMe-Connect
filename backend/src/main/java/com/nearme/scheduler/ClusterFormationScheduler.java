package com.nearme.scheduler;

import com.nearme.service.ClusterPromotionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

// ============================================================
// ClusterFormationScheduler.java
// Background jobs for cluster lifecycle management
//
// Three scheduled tasks:
//   1. Hourly   → check thresholds, flag mature clusters for admin
//   2. Daily    → increment active_days for active clusters
//   3. Daily    → deactivate stale clusters (no activity 7+ days)
//
// All heavy logic lives in ClusterPromotionService —
// this class is purely a trigger/cron wrapper
// ============================================================

@Component
@RequiredArgsConstructor
@Slf4j
public class ClusterFormationScheduler {

    private final ClusterPromotionService clusterPromotionService;

    // -------------------------------------------------------
    // 1. Hourly Threshold Check
    // Scans all ACTIVE clusters and flags any that have met
    // promotion thresholds for admin review
    // Runs every hour at the top of the hour
    // -------------------------------------------------------

    @Scheduled(cron = "0 0 * * * *")
    public void runThresholdCheck() {
        log.info("--- ClusterFormationScheduler: hourly threshold check starting ---");
        try {
            clusterPromotionService.checkAndFlagMatureClusters();
            log.info("--- ClusterFormationScheduler: hourly threshold check complete ---");
        } catch (Exception e) {
            log.error("ClusterFormationScheduler: threshold check failed — {}", e.getMessage(), e);
        }
    }

    // -------------------------------------------------------
    // 2. Daily Active Days Increment
    // Runs every day at midnight
    // Increments active_days for clusters that had activity today
    // -------------------------------------------------------

    @Scheduled(cron = "0 0 0 * * *")
    public void runActiveDaysIncrement() {
        log.info("--- ClusterFormationScheduler: daily active_days increment starting ---");
        try {
            clusterPromotionService.incrementActiveDaysForActiveClusters();
            log.info("--- ClusterFormationScheduler: active_days increment complete ---");
        } catch (Exception e) {
            log.error("ClusterFormationScheduler: active_days increment failed — {}", e.getMessage(), e);
        }
    }

    // -------------------------------------------------------
    // 3. Daily Stale Cluster Cleanup
    // Runs every day at 2AM to avoid overlap with midnight job
    // Deactivates clusters with no activity for 7+ days
    // -------------------------------------------------------

    @Scheduled(cron = "0 0 2 * * *")
    public void runStaleClusterCleanup() {
        log.info("--- ClusterFormationScheduler: stale cluster cleanup starting ---");
        try {
            clusterPromotionService.deactivateStaleClusters();
            log.info("--- ClusterFormationScheduler: stale cluster cleanup complete ---");
        } catch (Exception e) {
            log.error("ClusterFormationScheduler: stale cleanup failed — {}", e.getMessage(), e);
        }
    }
}