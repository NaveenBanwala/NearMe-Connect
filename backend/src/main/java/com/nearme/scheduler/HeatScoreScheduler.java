package com.nearme.scheduler;

import com.nearme.service.HeatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class HeatScoreScheduler {

    private final HeatService heatService;

    // Runs every 2 minutes (120,000 ms) — configurable via application.yml
    @Scheduled(fixedDelayString = "${heat.recalc-interval-ms:120000}")
    public void recalculateHeatScores() {
        log.debug("Running heat score recalculation...");
        try {
            heatService.recalculateAll();
        } catch (Exception e) {
            log.error("Heat score recalculation failed: {}", e.getMessage(), e);
        }
    }
}