package com.nearme.repository;

import com.nearme.model.LocationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LocationRequestRepository extends JpaRepository<LocationRequest, UUID> {

    List<LocationRequest> findAllByStatusOrderByVoteCountDesc(LocationRequest.ClusterStatus status);

    // Find existing pending cluster within 500m of GPS point
    @Query(value = """
        SELECT lr.* FROM location_requests lr
        WHERE lr.status = 'PENDING'
          AND ST_DWithin(
                ST_Transform(lr.geo_point, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
                500
              )
        ORDER BY ST_Distance(
                ST_Transform(lr.geo_point, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)
               ) ASC
        LIMIT 1
        """, nativeQuery = true)
    Optional<LocationRequest> findNearbyPendingCluster(
        @Param("lat") double lat,
        @Param("lng") double lng
    );

    // Nearby clusters shown to user before they submit a vote
    @Query(value = """
        SELECT lr.* FROM location_requests lr
        WHERE lr.status = 'PENDING'
          AND ST_DWithin(
                ST_Transform(lr.geo_point, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
                2000
              )
        ORDER BY ST_Distance(
                ST_Transform(lr.geo_point, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)
               ) ASC
        LIMIT 5
        """, nativeQuery = true)
    List<LocationRequest> findNearbyClusters(
        @Param("lat") double lat,
        @Param("lng") double lng
    );
}