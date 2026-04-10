package com.nearme.scheduler;

import com.nearme.model.Block;
import com.nearme.repository.BlockRepository;
import com.nearme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LiveUserCleanupScheduler {

    private final BlockRepository blockRepository;
    private final UserRepository  userRepository;

    // Runs every 5 minutes — resets live_user_count for blocks
    // based on users whose last_seen_at is within the 15-min window
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void refreshLiveUserCounts() {
        Instant cutoff = Instant.now().minus(15, ChronoUnit.MINUTES);
        List<Block> blocks = blockRepository.findAllByStatus(Block.BlockStatus.ACTIVE);

        for (Block block : blocks) {
            long live = userRepository.countLiveUsersInBlock(block.getBlockId(), cutoff);
            block.setLiveUserCount((int) live);
        }

        blockRepository.saveAll(blocks);
        log.debug("Live user counts refreshed for {} blocks", blocks.size());
    }
}