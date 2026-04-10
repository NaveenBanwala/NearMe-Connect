package com.nearme.repository;

import com.nearme.model.Request;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequestRepository extends JpaRepository<Request, UUID> {

    // Requests for students — can see both students_only and public
    @Query("""
        SELECT r FROM Request r
        WHERE r.block.blockId = :blockId
          AND r.status = 'OPEN'
          AND r.expiryTime > :now
          AND (:type IS NULL OR r.type = :type)
          AND r.user.userId NOT IN (
              SELECT ub.blockedId FROM UserBlock ub WHERE ub.blockerId = :viewerId
          )
        ORDER BY r.createdAt DESC
        """)
    List<Request> findStudentFeed(
        @Param("blockId") UUID blockId,
        @Param("now") Instant now,
        @Param("type") Request.RequestType type,
        @Param("viewerId") UUID viewerId,
        Pageable pageable
    );

    // Requests for locals — public only
    @Query("""
        SELECT r FROM Request r
        WHERE r.block.blockId = :blockId
          AND r.status = 'OPEN'
          AND r.expiryTime > :now
          AND r.visibility = 'PUBLIC'
          AND (:type IS NULL OR r.type = :type)
          AND r.user.userId NOT IN (
              SELECT ub.blockedId FROM UserBlock ub WHERE ub.blockerId = :viewerId
          )
        ORDER BY r.createdAt DESC
        """)
    List<Request> findLocalFeed(
        @Param("blockId") UUID blockId,
        @Param("now") Instant now,
        @Param("type") Request.RequestType type,
        @Param("viewerId") UUID viewerId,
        Pageable pageable
    );

    // Radius mode — all visible requests within a GPS circle
    @Query(value = """
        SELECT r.* FROM requests r
        JOIN blocks b ON r.block_id = b.block_id
        WHERE r.status = 'OPEN'
          AND r.expiry_time > NOW()
          AND ST_DWithin(
                ST_Transform(r.geo_point, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
                :radiusMeters
              )
          AND r.user_id NOT IN (
                SELECT blocked_id FROM user_blocks WHERE blocker_id = :viewerId
          )
        ORDER BY ST_Distance(
                ST_Transform(r.geo_point, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)
               ) ASC
        """, nativeQuery = true)
    List<Request> findInRadius(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusMeters") double radiusMeters,
        @Param("viewerId") UUID viewerId
    );

    // Count open requests in a block — used by heat scheduler
    @Query("SELECT COUNT(r) FROM Request r WHERE r.block.blockId = :blockId " +
           "AND r.status = 'OPEN' AND r.expiryTime > :now")
    long countOpenRequests(@Param("blockId") UUID blockId, @Param("now") Instant now);

    // Count new requests in last hour — used by heat scheduler
    @Query("SELECT COUNT(r) FROM Request r WHERE r.block.blockId = :blockId " +
           "AND r.createdAt > :since")
    long countRecentRequests(@Param("blockId") UUID blockId, @Param("since") Instant since);

    // Expire overdue open requests — called by scheduler
    @Modifying
    @Query("UPDATE Request r SET r.status = 'EXPIRED' WHERE r.status = 'OPEN' AND r.expiryTime <= :now")
    int expireOldRequests(@Param("now") Instant now);

    // User's own requests
    List<Request> findAllByUserUserIdOrderByCreatedAtDesc(UUID userId);
}