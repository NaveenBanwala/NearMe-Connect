package com.nearme.dto.response;

import com.nearme.model.Block;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data @Builder
public class BlockResponse {
    private UUID blockId;
    private String name;
    private String category;
    private Double centerLat;
    private Double centerLng;
    private String boundaryGeoJson;     // returned only when single block fetched
    private Integer heatScore;
    private String heatLevel;
    private Integer liveUserCount;
    private Integer openRequestCount;
    private Instant heatUpdatedAt;
    private String status;
    private boolean userIsInside;       // populated per-user on nearby query
    private Double distanceMeters;      // populated on nearby query

    public static BlockResponse from(Block b) {
        return BlockResponse.builder()
            .blockId(b.getBlockId())
            .name(b.getName())
            .category(b.getCategory().name().toLowerCase())
            .centerLat(b.getCenterLat())
            .centerLng(b.getCenterLng())
            .heatScore(b.getHeatScore())
            .heatLevel(b.getHeatLevel())
            .liveUserCount(b.getLiveUserCount())
            .openRequestCount(b.getOpenRequestCount())
            .heatUpdatedAt(b.getHeatUpdatedAt())
            .status(b.getStatus().name().toLowerCase())
            .build();
    }
}