package com.nearme.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

// ============================================================
// ActivityCluster.java
// JPA entity for the activity_clusters table
// Represents an auto-formed geographic cluster of active users
// ============================================================

import com.nearme.model.Block;

@Entity
@Table(name = "activity_clusters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityCluster {

    // -------------------------------------------------------
    // Primary Key
    // -------------------------------------------------------

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cluster_id", updatable = false, nullable = false)
    private UUID clusterId;

    // -------------------------------------------------------
    // Geographic Center
    // Auto-calculated from the spread of active users in area
    // -------------------------------------------------------

    @Column(name = "center_lat", nullable = false)
    private Double centerLat;

    @Column(name = "center_lng", nullable = false)
    private Double centerLng;

    // Radius in meters — auto-calculated from user spread
    @Column(name = "radius_meters", nullable = false)
    @Builder.Default
    private Integer radiusMeters = 500;

    // -------------------------------------------------------
    // Naming
    // Most-used name suggested by users inside this cluster
    // Null until at least one user suggests a name
    // -------------------------------------------------------

    @Column(name = "suggested_name", length = 100)
    private String suggestedName;

    // -------------------------------------------------------
    // Activity Counters
    // Used by ClusterFormationScheduler for threshold checks
    // -------------------------------------------------------

    @Column(name = "unique_user_count", nullable = false)
    @Builder.Default
    private Integer uniqueUserCount = 0;
// Add field after suggestedName:
@Enumerated(EnumType.STRING)
@Column(name = "suggested_category", length = 20)
private Block.BlockCategory suggestedCategory;

    @Column(name = "request_count", nullable = false)
    @Builder.Default
    private Integer requestCount = 0;

    @Column(name = "active_days", nullable = false)
    @Builder.Default
    private Integer activeDays = 0;

    // -------------------------------------------------------
    // Heat Score
    // Recalculated every 2 minutes by ClusterHeatScheduler
    // Formula: (liveUsers × 1.0) + (openRequests × 1.5) + (newRequestsLastHour × 0.5)
    // -------------------------------------------------------

    @Column(name = "heat_score", nullable = false)
    @Builder.Default
    private Double heatScore = 0.0;

    // -------------------------------------------------------
    // Lifecycle Status
    // forming          → just created, < 2 verified users
    // active           → 2+ users present, visible as blob on map
    // flagged_for_admin → thresholds met, waiting for admin review
    // converted        → admin approved, now an official block
    // dismissed        → admin rejected
    // -------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ClusterStatus status = ClusterStatus.FORMING;

    public enum ClusterStatus {
        FORMING,
        ACTIVE,
        FLAGGED_FOR_ADMIN,
        CONVERTED,
        DISMISSED
    }

    // -------------------------------------------------------
    // Promotion Tracking
    // -------------------------------------------------------

    // Set when status moves to FLAGGED_FOR_ADMIN
    @Column(name = "flagged_at")
    private LocalDateTime flaggedAt;

    // Set when admin approves and cluster becomes an official block
    // References blocks.block_id — kept as UUID to avoid circular entity dependency
    @Column(name = "converted_to_block_id")
    private UUID convertedToBlockId;

    // -------------------------------------------------------
    // Timestamps
    // -------------------------------------------------------

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    // Updated every time a user is seen active in this cluster area
    @Column(name = "last_active_at", nullable = false)
    private LocalDateTime lastActiveAt;

    // -------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------

    /**
     * Returns true if this cluster is currently visible on the map.
     * Forming and dismissed clusters are not shown to users.
     */
    public boolean isVisibleOnMap() {
        return this.status == ClusterStatus.ACTIVE
                || this.status == ClusterStatus.FLAGGED_FOR_ADMIN;
    }

    /**
     * Returns true if users can post and accept requests inside this cluster.
     */
    public boolean isActive() {
        return this.status == ClusterStatus.ACTIVE
                || this.status == ClusterStatus.FLAGGED_FOR_ADMIN;
    }

    /**
     * Marks this cluster as flagged for admin review.
     * Called by ClusterFormationScheduler when all thresholds are met.
     */
    public void flagForAdmin() {
        this.status = ClusterStatus.FLAGGED_FOR_ADMIN;
        this.flaggedAt = LocalDateTime.now();
    }

    /**
     * Marks this cluster as converted to an official block.
     * Called by ClusterService when admin approves.
     */
    public void markConverted(UUID blockId) {
        this.status = ClusterStatus.CONVERTED;
        this.convertedToBlockId = blockId;
    }
}