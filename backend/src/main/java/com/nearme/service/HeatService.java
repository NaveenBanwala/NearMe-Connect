package com.nearme.service;

import com.nearme.model.Block;
import com.nearme.repository.BlockRepository;
import com.nearme.repository.RequestRepository;
import com.nearme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HeatService {

    private final BlockRepository   blockRepository;
    private final RequestRepository requestRepository;
    private final UserRepository    userRepository;

    // Called by HeatScoreScheduler every 2 minutes
    @Transactional
    public void recalculateAll() {
        Instant now        = Instant.now();
        Instant liveCutoff = now.minus(15, ChronoUnit.MINUTES);
        Instant hourAgo    = now.minus(1, ChronoUnit.HOURS);

        List<Block> activeBlocks = blockRepository.findAllByStatus(Block.BlockStatus.ACTIVE);

        for (Block block : activeBlocks) {
            long liveUsers    = userRepository.countLiveUsersInBlock(block.getBlockId(), liveCutoff);
            long openRequests = requestRepository.countOpenRequests(block.getBlockId(), now);
            long newRequests  = requestRepository.countRecentRequests(block.getBlockId(), hourAgo);

            // Formula: (live × 1.0) + (open × 1.5) + (new last hour × 0.5)
            int heatScore = (int) Math.round(
                liveUsers  * 1.0 +
                openRequests * 1.5 +
                newRequests  * 0.5
            );

            block.setHeatScore(heatScore);
            block.setLiveUserCount((int) liveUsers);
            block.setOpenRequestCount((int) openRequests);
            block.setHeatUpdatedAt(now);
        }

        blockRepository.saveAll(activeBlocks);
        log.debug("Heat recalculated for {} blocks", activeBlocks.size());
    }
}