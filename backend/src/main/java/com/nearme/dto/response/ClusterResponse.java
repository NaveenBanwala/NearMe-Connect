package com.nearme.dto.response;

import com.nearme.model.ActivityCluster.ClusterStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;



// ============================================================
// ClusterResponse.java
// Response object returned by all cluster API endpoints
// Never expose the raw ActivityCluster entity directly
// ============================================================

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClusterResponse {

    // -------------------------------------------------------
    // Identity
    // -------------------------------------------------------

    private UUID clusterId;

    // Display name — either user-suggested or fallback "Active Area"
    private String displayName;

    private String suggestedCategory;

    // -------------------------------------------------------
    // Geographic Data
    // Sent to frontend for blob rendering on map
    // -------------------------------------------------------

    private Double centerLat;
    private Double centerLng;

    // Radius drives the blob size on the map
    private Integer radiusMeters;

    // -------------------------------------------------------
    // Heat Data
    // Used to determine blob glow intensity on map
    // -------------------------------------------------------

    private Double heatScore;

    // Human-readable heat label derived from heat score
    // cold / mild / warm / hot / on_fire
    private String heatLevel;

    // -------------------------------------------------------
    // Activity Stats
    // Shown in ClusterCard and admin ClusterStatsCard
    // -------------------------------------------------------

    private Integer uniqueUserCount;
    private Integer requestCount;
    private Integer activeDays;

    // -------------------------------------------------------
    // Status
    // -------------------------------------------------------

    private ClusterStatus status;

    // Whether this cluster is currently accepting requests
    // Derived from status — true if ACTIVE or FLAGGED_FOR_ADMIN
    private Boolean acceptingRequests;

    // -------------------------------------------------------
    // Timestamps
    // -------------------------------------------------------

    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;

    private LocalDateTime flaggedAt;

    // -------------------------------------------------------
    // Static Factory
    // Maps ActivityCluster entity → ClusterResponse
    // Call this in ClusterService, never in controllers
    // -------------------------------------------------------

    public static ClusterResponse from(com.nearme.model.ActivityCluster cluster) {
        return ClusterResponse.builder()
                .clusterId(cluster.getClusterId())
                .displayName(
                        cluster.getSuggestedName() != null
                                ? cluster.getSuggestedName()
                                : "Active Area"
                )
                .centerLat(cluster.getCenterLat())
                .centerLng(cluster.getCenterLng())
                .radiusMeters(cluster.getRadiusMeters())
                .heatScore(cluster.getHeatScore())
                .heatLevel(resolveHeatLevel(cluster.getHeatScore()))
                .uniqueUserCount(cluster.getUniqueUserCount())
                .requestCount(cluster.getRequestCount())
                .activeDays(cluster.getActiveDays())
                // Add to the from() builder, after .activeDays(...):
.suggestedCategory(
    cluster.getSuggestedCategory() != null
        ? cluster.getSuggestedCategory().name()
        : "LOCALITY"
)
                .status(cluster.getStatus())
                .acceptingRequests(cluster.isActive())
                .createdAt(cluster.getCreatedAt())
                .lastActiveAt(cluster.getLastActiveAt())
                .flaggedAt(cluster.getFlaggedAt())
                .build();
    }

    // -------------------------------------------------------
    // Heat Level Resolver
    // Mirrors the same thresholds used for official blocks
    // cold     → 1–5
    // mild     → 6–20
    // warm     → 21–50
    // hot      → 51–100
    // on_fire  → 100+
    // -------------------------------------------------------

    private static String resolveHeatLevel(double score) {
        if (score >= 100) return "on_fire";
        if (score >= 51)  return "hot";
        if (score >= 21)  return "warm";
        if (score >= 6)   return "mild";
        return "cold";
    }
}