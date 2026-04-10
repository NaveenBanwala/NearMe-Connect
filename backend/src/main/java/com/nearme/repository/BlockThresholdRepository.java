package com.nearme.repository;

import com.nearme.model.Block;
import com.nearme.model.BlockThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlockThresholdRepository extends JpaRepository<BlockThreshold, Block.BlockCategory> {

    Optional<BlockThreshold> findByCategory(Block.BlockCategory category);
}