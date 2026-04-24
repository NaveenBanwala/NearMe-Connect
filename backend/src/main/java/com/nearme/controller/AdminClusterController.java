package com.nearme.controller;

import com.nearme.dto.request.ApproveClusterRequest;
import com.nearme.model.Block;
import com.nearme.model.ActivityCluster;
import com.nearme.repository.ClusterRepository;
import com.nearme.repository.BlockRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminClusterController {

    private final ClusterRepository      clusterRepository;
    private final BlockRepository        blockRepository;
    private final NamedParameterJdbcTemplate jdbc;

    // ── GET /api/admin/clusters/flagged ──────────────────────────
    @GetMapping("/clusters/flagged")
    public ResponseEntity<List<ActivityCluster>> getFlaggedClusters() {
        return ResponseEntity.ok(
            clusterRepository.findAllByStatus(ActivityCluster.ClusterStatus.FLAGGED_FOR_ADMIN)
        );
    }

    // ── POST /api/admin/blocks  (approve cluster → create block) ─
    @PostMapping("/blocks")
    public ResponseEntity<Map<String, Object>> approveCluster(
            @Valid @RequestBody ApproveClusterRequest req) {

        // 1. Build WKT polygon from boundary points
        List<ApproveClusterRequest.BoundaryPoint> pts = req.getBoundaryGeoJson();
        if (pts == null || pts.size() < 3) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Need at least 3 boundary points"));
        }

        // Close the ring — last point must equal first
        List<ApproveClusterRequest.BoundaryPoint> ring = new ArrayList<>(pts);
        ring.add(pts.get(0));

        String coords = ring.stream()
            .map(p -> p.getLng() + " " + p.getLat())
            .collect(Collectors.joining(", "));
        String wkt = "POLYGON((" + coords + "))";

        // 2. Find the admin UUID (any admin will do — use cluster's area owner or hardcode)
        ActivityCluster cluster = clusterRepository.findById(req.getClusterId())
            .orElseThrow(() -> new RuntimeException("Cluster not found: " + req.getClusterId()));

        // 3. Insert new block
        String sql = """
            INSERT INTO blocks (name, category, geo_polygon, center_lat, center_lng,
                                status, created_by_admin)
            VALUES (:name, :category,
                    ST_SetSRID(ST_GeomFromText(:wkt), 4326),
                    :centerLat, :centerLng,
                    'ACTIVE', :adminId)
            RETURNING block_id
            """;

        UUID blockId = jdbc.queryForObject(sql, Map.of(
            "name",      req.getName(),
            "category",  req.getCategory().toUpperCase(),
            "wkt",       wkt,
            "centerLat", req.getCenterLat(),
            "centerLng", req.getCenterLng(),
            "adminId",   cluster.getClusterId()   // reuse cluster UUID as placeholder admin
        ), UUID.class);

        // 4. Mark cluster as CONVERTED
        cluster.markConverted(blockId);
        clusterRepository.save(cluster);

        log.info("Cluster {} approved → Block {}", req.getClusterId(), blockId);

        return ResponseEntity.ok(Map.of("blockId", blockId));
    }

    // ── DELETE /api/admin/clusters/:id  (dismiss) ────────────────
    @DeleteMapping("/clusters/{clusterId}")
    public ResponseEntity<Void> dismissCluster(
            @PathVariable UUID clusterId,
            @RequestBody(required = false) Map<String, String> body) {

        ActivityCluster cluster = clusterRepository.findById(clusterId)
            .orElseThrow(() -> new RuntimeException("Cluster not found"));

        cluster.setStatus(ActivityCluster.ClusterStatus.DISMISSED);
        clusterRepository.save(cluster);

        log.info("Cluster {} dismissed. Reason: {}", clusterId,
            body != null ? body.get("reason") : "none");

        return ResponseEntity.noContent().build();
    }
}