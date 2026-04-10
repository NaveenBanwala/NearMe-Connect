package com.nearme.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data @Builder
public class HeatResponse {
    private UUID blockId;
    private String name;
    private Integer heatScore;
    private String heatLevel;
    private Integer liveUserCount;
    private Integer openRequestCount;
    private Instant heatUpdatedAt;
    private int nextRefreshInSeconds;
}