package com.nearme.repository;

import com.nearme.model.ActivityCluster;
import com.nearme.model.ActivityCluster.ClusterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// ============================================================
// ClusterRepository.java
// DB access layer for activity_clusters table
// ============================================================

@Repository
public interface ClusterRepository extends JpaRepository<ActivityCluster, UUID> {

    // -------------------------------------------------------
    // Nearby Clusters
    // Used by the map to fetch clusters visible in current viewport
    // Uses Haversine approximation — good enough for cluster-level proximity
    // For precise PostGIS queries use the @Query natives below
    // -------------------------------------------------------

    /**
     * Finds all visible clusters within a given radius (meters) of a lat/lng point.
     * Only returns ACTIVE and FLAGGED_FOR_ADMIN clusters — not forming or dismissed.
     *
     * Uses the Haversine formula approximated in SQL.
     * 111320 = meters per degree of latitude.
     */
 @Query(value = """
    SELECT * FROM activity_clusters
    WHERE status IN ('ACTIVE', 'FLAGGED_FOR_ADMIN')
      AND ST_DWithin(
          ST_Transform(geo_point, 3857), 
          ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857), 
          :radiusMeters
      )
    ORDER BY last_active_at DESC
    """, nativeQuery = true)
List<ActivityCluster> findNearbyClusters(double lat, double lng, int radiusMeters);

    // -------------------------------------------------------
    // Status Queries
    // Used by schedulers and admin endpoints
    // -------------------------------------------------------

    /** All clusters in a given status. Used by schedulers. */
    List<ActivityCluster> findAllByStatus(ClusterStatus status);

    /** All clusters flagged for admin review, newest first. */
    List<ActivityCluster> findAllByStatusOrderByFlaggedAtDesc(ClusterStatus status);

    /** Clusters that have been active recently — used by heat scheduler. */
    List<ActivityCluster> findAllByStatusInAndLastActiveAtAfter(
            List<ClusterStatus> statuses,
            LocalDateTime since
    );

    // -------------------------------------------------------
    // Duplicate Detection
    // Prevents two clusters forming within 200m of each other
    // -------------------------------------------------------

    /**
     * Finds any existing active cluster within 200m of a given point.
     * Called before creating a new cluster to avoid duplicates.
     */
    @Query(value = """
            SELECT * FROM activity_clusters
            WHERE status IN ('FORMING', 'ACTIVE', 'FLAGGED_FOR_ADMIN')
            AND (
                6371000 * acos(
                    cos(radians(:lat)) * cos(radians(center_lat))
                    * cos(radians(center_lng) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(center_lat))
                )
            ) <= 200
            LIMIT 1
            """, nativeQuery = true)
    Optional<ActivityCluster> findExistingClusterNear(
            @Param("lat") double lat,
            @Param("lng") double lng
    );

    // -------------------------------------------------------
    // Activity Counter Updates
    // Bulk updates called by scheduler — avoids loading full entities
    // -------------------------------------------------------

    /** Increments unique_user_count for a cluster. */
    @Modifying
    @Query("""
            UPDATE ActivityCluster c
            SET c.uniqueUserCount = c.uniqueUserCount + 1
            WHERE c.clusterId = :clusterId
            """)
    void incrementUserCount(@Param("clusterId") UUID clusterId);

    /** Increments request_count for a cluster. */
    @Modifying
    @Query("""
            UPDATE ActivityCluster c
            SET c.requestCount = c.requestCount + 1
            WHERE c.clusterId = :clusterId
            """)
    void incrementRequestCount(@Param("clusterId") UUID clusterId);

    /** Updates heat score directly — called by ClusterHeatScheduler. */
    @Modifying
    @Query("""
            UPDATE ActivityCluster c
            SET c.heatScore = :heatScore,
                c.lastActiveAt = :now
            WHERE c.clusterId = :clusterId
            """)
    void updateHeatScore(
            @Param("clusterId") UUID clusterId,
            @Param("heatScore") double heatScore,
            @Param("now") LocalDateTime now
    );

    /** Updates last_active_at — called whenever a user pings inside a cluster area. */
    @Modifying
    @Query("""
            UPDATE ActivityCluster c
            SET c.lastActiveAt = :now
            WHERE c.clusterId = :clusterId
            """)
    void touchLastActive(
            @Param("clusterId") UUID clusterId,
            @Param("now") LocalDateTime now
    );

    // -------------------------------------------------------
    // Name Suggestion
    // -------------------------------------------------------

    /** Updates suggested_name if the new name is provided. */
    @Modifying
    @Query("""
            UPDATE ActivityCluster c
            SET c.suggestedName = :name
            WHERE c.clusterId = :clusterId
            """)
    void updateSuggestedName(
            @Param("clusterId") UUID clusterId,
            @Param("name") String name
    );

    // -------------------------------------------------------
    // Threshold Check
    // Used by ClusterFormationScheduler to find clusters ready for admin review
    // Thresholds passed in from admin-configured values, not hardcoded
    // -------------------------------------------------------

    /**
     * Finds active clusters that have met all three promotion thresholds.
     * Called hourly by ClusterFormationScheduler.
     *
     * @param minUsers     minimum unique users required
     * @param minRequests  minimum requests required
     * @param minDays      minimum active days required
     */
    @Query("""
            SELECT c FROM ActivityCluster c
            WHERE c.status = 'ACTIVE'
            AND c.uniqueUserCount >= :minUsers
            AND c.requestCount >= :minRequests
            AND c.activeDays >= :minDays
            """)
    List<ActivityCluster> findClustersReadyForPromotion(
            @Param("minUsers") int minUsers,
            @Param("minRequests") int minRequests,
            @Param("minDays") int minDays
    );
}