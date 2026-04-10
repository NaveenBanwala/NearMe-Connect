package com.nearme.scheduler;

import com.nearme.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class RequestExpiryScheduler {

    private final RequestRepository requestRepository;

    // Runs every 5 minutes
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void expireOldRequests() {
        int count = requestRepository.expireOldRequests(Instant.now());
        if (count > 0) {
            log.info("Expired {} overdue requests", count);
        }
    }
}