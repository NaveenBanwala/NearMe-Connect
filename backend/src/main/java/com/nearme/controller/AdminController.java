package com.nearme.controller;

import com.nearme.dto.request.CreateBlockDto;
import com.nearme.dto.response.BlockResponse;
import com.nearme.dto.response.ClusterResponse;
import com.nearme.dto.response.UserResponse;
import com.nearme.service.AdminService;
import com.nearme.service.AdminService.*;
import com.nearme.service.ClusterService;
import com.nearme.service.ClusterPromotionService;
import com.nearme.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

// ============================================================
// AdminController.java
// REST endpoints for the admin web dashboard
//
// Base path: /admin
// All endpoints require ROLE_ADMIN
//
// Sections:
//   1. Stats & Metrics
//   2. Block Management
//   3. Cluster Review          ← replaces old vote-clusters
//   4. User Management
//   5. Verification Queue
//   6. Reports
//   7. Thresholds
// ============================================================

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService            adminService;
    private final ClusterService          clusterService;
    private final ClusterPromotionService clusterPromotionService;
    private final VerificationService     verificationService;

    // ============================================================
    // 1. STATS & METRICS
    // ============================================================

    // GET /admin/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        log.info("Admin: GET /admin/stats");
        return ResponseEntity.ok(adminService.getStats());
    }

    // GET /admin/metrics/live
    @GetMapping("/metrics/live")
    public ResponseEntity<Map<String, Object>> getLiveMetrics() {
        log.info("Admin: GET /admin/metrics/live");
        return ResponseEntity.ok(adminService.getLiveMetrics());
    }

    // ============================================================
    // 2. BLOCK MANAGEMENT
    // ============================================================

    // GET /admin/blocks
    @GetMapping("/blocks")
    public ResponseEntity<List<BlockResponse>> getAllBlocks() {
        log.info("Admin: GET /admin/blocks");
        return ResponseEntity.ok(adminService.getAllBlocks());
    }

    /**
     * POST /admin/blocks
     *
     * Approves a flagged cluster and converts it into an official block.
     * Admin draws/confirms the boundary in the Block Editor UI,
     * then submits with the final polygon and block details.
     *
     * Steps performed:
     *   1. Create official block via AdminService (existing flow)
     *   2. Mark source cluster as CONVERTED (new)
     *   3. Notify users who were active in the cluster area (new)
     *
     * NOTE: CreateBlockDto needs a sourceClusterId field added —
     * nullable UUID, only present when block is promoted from a cluster.
     * If null, block was created directly by admin with no cluster source.
     */
    @PostMapping("/blocks")
    public ResponseEntity<BlockResponse> approveClusterAndCreateBlock(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateBlockDto dto
    ) {
        UUID adminId = UUID.fromString(principal.getUsername());
        log.info("Admin: POST /admin/blocks — adminId={}, blockName='{}', sourceCluster={}",
                adminId, dto.getName(), dto.getSourceClusterId());

        // Step 1: Create the official block (existing AdminService flow)
        BlockResponse block = adminService.approveCluster(adminId, dto);

        // Steps 2 & 3: Only run if block was promoted from a cluster
        if (dto.getSourceClusterId() != null) {

            // Step 2: Mark source cluster as converted
            clusterService.markClusterConverted(
                    dto.getSourceClusterId(),
                    block.getBlockId()
            );

            // Step 3: Notify users who were active in that cluster
            clusterPromotionService.notifyUsersOfPromotion(
                    dto.getSourceClusterId(),
                    block.getName(),
                    block.getBlockId()
            );
        }

        return ResponseEntity.ok(block);
    }

    // PUT /admin/blocks/:id
    @PutMapping("/blocks/{id}")
    public ResponseEntity<BlockResponse> updateBlock(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> updates
    ) {
        log.info("Admin: PUT /admin/blocks/{}", id);
        return ResponseEntity.ok(adminService.updateBlock(id, updates));
    }

    // DELETE /admin/blocks/:id
    @DeleteMapping("/blocks/{id}")
    public ResponseEntity<Void> deleteBlock(@PathVariable UUID id) {
        log.info("Admin: DELETE /admin/blocks/{}", id);
        adminService.deleteBlock(id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // 3. CLUSTER REVIEW
    // Replaces old /vote-clusters endpoints entirely
    // ============================================================

    /**
     * GET /admin/clusters/flagged
     *
     * Returns all clusters that have met activity thresholds
     * and are waiting for admin review.
     * Ordered by flagged_at DESC — newest first.
     *
     * Replaces: GET /admin/vote-clusters
     */
    @GetMapping("/clusters/flagged")
    public ResponseEntity<List<ClusterResponse>> getFlaggedClusters() {
        log.info("Admin: GET /admin/clusters/flagged");
        return ResponseEntity.ok(clusterService.getFlaggedClusters());
    }

    /**
     * DELETE /admin/clusters/:id
     *
     * Dismisses a flagged cluster — marks it DISMISSED so it
     * stops appearing on the map. Used when admin decides the
     * area does not qualify as a block.
     *
     * Query param:
     *   reason (optional) — admin note, logged for audit
     *
     * Replaces: DELETE /admin/vote-clusters/:id
     */
    @DeleteMapping("/clusters/{clusterId}")
    public ResponseEntity<Void> dismissCluster(
            @PathVariable UUID clusterId,
            @RequestParam(required = false) String reason
    ) {
        log.info("Admin: DELETE /admin/clusters/{} — reason: {}", clusterId, reason);
        clusterService.dismissCluster(clusterId);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // 4. USER MANAGEMENT
    // ============================================================

    // GET /admin/users
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String filter
    ) {
        log.info("Admin: GET /admin/users — search='{}', filter='{}'", search, filter);
        return ResponseEntity.ok(adminService.getAllUsers(search, filter));
    }

    // DELETE /admin/users/:id
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        log.info("Admin: DELETE /admin/users/{}", userId);
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // PATCH /admin/users/:userId/ban
    @PatchMapping("/users/{userId}/ban")
    public ResponseEntity<UserResponse> banUser(@PathVariable UUID userId) {
        log.info("Admin: PATCH /admin/users/{}/ban", userId);
        return ResponseEntity.ok(adminService.setBanStatus(userId, true));
    }

    // PATCH /admin/users/:userId/unban
    @PatchMapping("/users/{userId}/unban")
    public ResponseEntity<UserResponse> unbanUser(@PathVariable UUID userId) {
        log.info("Admin: PATCH /admin/users/{}/unban", userId);
        return ResponseEntity.ok(adminService.setBanStatus(userId, false));
    }

    // ============================================================
    // 5. VERIFICATION QUEUE
    // ============================================================

    // GET /admin/verification-queue
    @GetMapping("/verification-queue")
    public ResponseEntity<List<UserResponse>> getVerificationQueue() {
        log.info("Admin: GET /admin/verification-queue");
        return ResponseEntity.ok(adminService.getVerificationQueue());
    }

    /**
     * PATCH /admin/verify/:userId
     *
     * Approves or rejects a college ID verification.
     * Body: { "status": "approved"|"rejected", "reason": "...", "campus_block_id": "uuid" }
     */
    @PatchMapping("/verify/{userId}")
    public ResponseEntity<UserResponse> verifyUser(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body
    ) {
        log.info("Admin: PATCH /admin/verify/{} — status='{}'", userId, body.get("status"));

        String status     = body.get("status");
        String reason     = body.get("reason");
        String blockIdStr = body.get("campus_block_id");

        if ("approved".equalsIgnoreCase(status)) {
            UUID blockId = blockIdStr != null ? UUID.fromString(blockIdStr) : null;
            return ResponseEntity.ok(verificationService.approve(userId, blockId));
        } else {
            return ResponseEntity.ok(verificationService.reject(userId, reason));
        }
    }

    // ============================================================
    // 6. REPORTS
    // ============================================================

    // GET /admin/reports
    @GetMapping("/reports")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        log.info("Admin: GET /admin/reports");
        return ResponseEntity.ok(adminService.getAllReports());
    }

    // PATCH /admin/reports/:id/resolve
    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        log.info("Admin: PATCH /admin/reports/{}/resolve", id);
        String notes = body != null ? body.get("admin_notes") : null;
        return ResponseEntity.ok(adminService.resolveReport(id, notes));
    }

    // PATCH /admin/reports/:id/dismiss
    @PatchMapping("/reports/{id}/dismiss")
    public ResponseEntity<ReportResponse> dismissReport(@PathVariable UUID id) {
        log.info("Admin: PATCH /admin/reports/{}/dismiss", id);
        return ResponseEntity.ok(adminService.dismissReport(id));
    }

    // ============================================================
    // 7. THRESHOLDS
    // Controls activity thresholds for cluster → block promotion
    // Values are read by ClusterPromotionService at runtime
    // ============================================================

    // GET /admin/thresholds
    @GetMapping("/thresholds")
    public ResponseEntity<List<ThresholdResponse>> getThresholds() {
        log.info("Admin: GET /admin/thresholds");
        return ResponseEntity.ok(adminService.getThresholds());
    }

    // PUT /admin/thresholds
    @PutMapping("/thresholds")
    public ResponseEntity<List<ThresholdResponse>> updateThresholds(
            @RequestBody List<Map<String, Object>> updates
    ) {
        log.info("Admin: PUT /admin/thresholds — {} update(s)", updates.size());
        return ResponseEntity.ok(adminService.updateThresholds(updates));
    }
}