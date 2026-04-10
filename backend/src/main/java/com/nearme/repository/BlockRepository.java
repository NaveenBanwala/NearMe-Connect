package com.nearme.repository;

import com.nearme.model.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlockRepository extends JpaRepository<Block, UUID> {

    // All active blocks within a radius of a GPS point (using PostGIS ST_DWithin)
    @Query(value = """
        SELECT b.* FROM blocks b
        WHERE b.status = 'ACTIVE'
          AND ST_DWithin(
                ST_Transform(b.geo_polygon, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
                :radiusMeters
              )
        ORDER BY ST_Distance(
                ST_Transform(ST_SetSRID(ST_MakePoint(b.center_lng, b.center_lat), 4326), 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)
               ) ASC
        """, nativeQuery = true)
    List<Block> findNearby(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusMeters") double radiusMeters
    );

    // Nearby campus blocks only — for Nearby Campuses mode
    @Query(value = """
        SELECT b.* FROM blocks b
        WHERE b.status = 'ACTIVE'
          AND b.category = 'CAMPUS'
          AND ST_DWithin(
                ST_Transform(b.geo_polygon, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
                :radiusMeters
              )
        ORDER BY ST_Distance(
                ST_Transform(ST_SetSRID(ST_MakePoint(b.center_lng, b.center_lat), 4326), 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)
               ) ASC
        """, nativeQuery = true)
    List<Block> findNearbyByCategory(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusMeters") double radiusMeters
    );

    // Check if a GPS point is inside a specific block's polygon
    @Query(value = """
        SELECT COUNT(*) > 0 FROM blocks
        WHERE block_id = :blockId
          AND ST_Contains(
                geo_polygon,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
              )
        """, nativeQuery = true)
    boolean isPointInsideBlock(
        @Param("blockId") UUID blockId,
        @Param("lat") double lat,
        @Param("lng") double lng
    );

    // Search by name
    List<Block> findByNameContainingIgnoreCaseAndStatus(String name, Block.BlockStatus status);

    // All active blocks — for heat scheduler
    List<Block> findAllByStatus(Block.BlockStatus status);

    // Top N hottest blocks
    @Query("SELECT b FROM Block b WHERE b.status = 'ACTIVE' ORDER BY b.heatScore DESC")
    List<Block> findTopByHeat(org.springframework.data.domain.Pageable pageable);
}