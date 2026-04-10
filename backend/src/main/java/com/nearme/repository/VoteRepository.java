package com.nearme.repository;

import com.nearme.model.LocationVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<LocationVote, UUID> {

    boolean existsByUserUserIdAndClusterClusterId(UUID userId, UUID clusterId);

    long countByClusterClusterId(UUID clusterId);
}