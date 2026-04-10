package com.nearme.controller;

import com.nearme.dto.response.BlockResponse;
import com.nearme.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/heat")
@RequiredArgsConstructor
public class HeatController {

    private final AdminService adminService;

    // GET /api/heat/top?limit=10  — top hottest blocks for admin heatmap
    @GetMapping("/top")
    public ResponseEntity<List<BlockResponse>> topBlocks(
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(adminService.getTopBlocks(limit));
    }
}