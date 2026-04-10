package com.nearme.controller;

import com.nearme.dto.response.BlockResponse;
import com.nearme.dto.response.HeatResponse;
import com.nearme.service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    // GET /api/blocks/nearby?lat=&lng=&radius=
    @GetMapping("/nearby")
    public ResponseEntity<List<BlockResponse>> nearby(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue = "5000") double radius
    ) {
        return ResponseEntity.ok(blockService.getNearby(lat, lng, radius));
    }

    // GET /api/blocks/nearby/campus?lat=&lng=&radius=  (nearby campuses mode)
    @GetMapping("/nearby/campus")
    public ResponseEntity<List<BlockResponse>> nearbyCampus(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue = "10000") double radius
    ) {
        return ResponseEntity.ok(blockService.getNearbyCampus(lat, lng, radius));
    }

    // GET /api/blocks/search?q=
    @GetMapping("/search")
    public ResponseEntity<List<BlockResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(blockService.search(q));
    }

    // GET /api/blocks/:id
    @GetMapping("/{id}")
    public ResponseEntity<BlockResponse> getBlock(@PathVariable UUID id) {
        return ResponseEntity.ok(blockService.getBlock(id));
    }

    // GET /api/blocks/:id/heat
    @GetMapping("/{id}/heat")
    public ResponseEntity<HeatResponse> getHeat(@PathVariable UUID id) {
        return ResponseEntity.ok(blockService.getHeat(id));
    }
}