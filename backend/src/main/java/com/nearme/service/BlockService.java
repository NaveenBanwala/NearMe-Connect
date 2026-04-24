package com.nearme.service;

import com.nearme.dto.response.BlockResponse;
import com.nearme.dto.response.HeatResponse;
import com.nearme.exception.BlockNotFoundException;
import com.nearme.model.Block;
import com.nearme.repository.BlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlockService {

    private final BlockRepository blockRepository;
    private final GeoService      geoService;

 public List<BlockResponse> getNearby(double lat, double lng, double radiusMeters) {
    return blockRepository.findNearby(lat, lng, radiusMeters).stream()
        .map(b -> {
            BlockResponse resp = BlockResponse.from(b);
            resp.setBoundaryGeoJson(geoService.toGeoJson(b.getGeoPolygon())); // ✅ ADD THIS
            resp.setUserIsInside(blockRepository.isPointInsideBlock(b.getBlockId(), lat, lng));
            return resp;
        })
        .collect(Collectors.toList());
}
public List<BlockResponse> getAllBlocks() {
    return blockRepository.findAllByStatus(Block.BlockStatus.ACTIVE)
        .stream()
        .sorted((a, b) -> Double.compare(b.getHeatScore(), a.getHeatScore()))
        .map(b -> {
            BlockResponse resp = BlockResponse.from(b);
            resp.setBoundaryGeoJson(geoService.toGeoJson(b.getGeoPolygon()));
            return resp;
        })
        .collect(Collectors.toList());
}
    public List<BlockResponse> getNearbyCampus(double lat, double lng, double radiusMeters) {
        return blockRepository.findNearbyByCategory(lat, lng, radiusMeters).stream()
            .map(b -> {
                BlockResponse resp = BlockResponse.from(b);
                resp.setBoundaryGeoJson(geoService.toGeoJson(b.getGeoPolygon()));
                return resp;
            })
            .collect(Collectors.toList());
    }
public List<BlockResponse> search(String query) {
    return blockRepository
        .findByNameContainingIgnoreCaseAndStatus(query, Block.BlockStatus.ACTIVE)
        .stream()
        .map(b -> {
            BlockResponse resp = BlockResponse.from(b);
            resp.setBoundaryGeoJson(geoService.toGeoJson(b.getGeoPolygon()));
            return resp;
        })
        .collect(Collectors.toList()); // ✅ this was missing
}

    public BlockResponse getBlock(UUID blockId) {
        Block b = blockRepository.findById(blockId)
            .orElseThrow(() -> new BlockNotFoundException(blockId));
        BlockResponse resp = BlockResponse.from(b);
        resp.setBoundaryGeoJson(geoService.toGeoJson(b.getGeoPolygon()));
        return resp;
    }

    public HeatResponse getHeat(UUID blockId) {
        Block b = blockRepository.findById(blockId)
            .orElseThrow(() -> new BlockNotFoundException(blockId));

        long nextRefresh = Math.max(0,
            b.getHeatUpdatedAt().plusSeconds(120).getEpochSecond()
            - Instant.now().getEpochSecond());

        return HeatResponse.builder()
            .blockId(b.getBlockId())
            .name(b.getName())
            .heatScore(b.getHeatScore())
            .heatLevel(b.getHeatLevel())
            .liveUserCount(b.getLiveUserCount())
            .openRequestCount(b.getOpenRequestCount())
            .heatUpdatedAt(b.getHeatUpdatedAt())
            .nextRefreshInSeconds((int) nextRefresh)
            .build();
    }

    public boolean isUserInsideBlock(UUID blockId, double lat, double lng) {
        return blockRepository.isPointInsideBlock(blockId, lat, lng);
    }
}