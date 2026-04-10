package com.nearme.controller;

import com.nearme.dto.request.CreateBlockDto;
import com.nearme.dto.response.BlockResponse;
import com.nearme.dto.response.UserResponse;
import com.nearme.service.AdminService;
import com.nearme.service.AdminService.*;
import com.nearme.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService        adminService;
    private final VerificationService verificationService;

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // GET /api/admin/metrics/live  (P4 new)
    @GetMapping("/metrics/live")
    public ResponseEntity<Map<String, Object>> getLiveMetrics() {
        return ResponseEntity.ok(adminService.getLiveMetrics());
    }

    // ── Block management ───────────────────────────────────────────────────

    // GET /api/admin/blocks  (P4 new)
    @GetMapping("/blocks")
    public ResponseEntity<List<BlockResponse>> getAllBlocks() {
        return ResponseEntity.ok(adminService.getAllBlocks());
    }

    // POST /api/admin/blocks — approve cluster + create block
    @PostMapping("/blocks")
    public ResponseEntity<BlockResponse> approveCluster(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody CreateBlockDto dto
    ) {
        UUID adminId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(adminService.approveCluster(adminId, dto));
    }

    // PUT /api/admin/blocks/:id  (P4 new)
    @PutMapping("/blocks/{id}")
    public ResponseEntity<BlockResponse> updateBlock(
        @PathVariable UUID id,
        @RequestBody Map<String, Object> updates
    ) {
        return ResponseEntity.ok(adminService.updateBlock(id, updates));
    }

    // DELETE /api/admin/blocks/:id  (P4 new)
    @DeleteMapping("/blocks/{id}")
    public ResponseEntity<Void> deleteBlock(@PathVariable UUID id) {
        adminService.deleteBlock(id);
        return ResponseEntity.noContent().build();
    }

    // ── Vote cluster management ────────────────────────────────────────────

    // GET /api/admin/vote-clusters
    @GetMapping("/vote-clusters")
    public ResponseEntity<List<ClusterAdminResponse>> getVoteClusters() {
        return ResponseEntity.ok(adminService.getVoteClusters());
    }

    // DELETE /api/admin/vote-clusters/:id — reject cluster
    @DeleteMapping("/vote-clusters/{id}")
    public ResponseEntity<Void> rejectCluster(
        @PathVariable UUID id,
        @RequestBody(required = false) Map<String, String> body
    ) {
        adminService.rejectCluster(id, body != null ? body.get("reason") : null);
        return ResponseEntity.noContent().build();
    }

    // ── User management ───────────────────────────────────────────────────

    // GET /api/admin/users  (P4 new)
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String filter
    ) {
        return ResponseEntity.ok(adminService.getAllUsers(search, filter));
    }

    // DELETE /api/admin/users/:id  (P4 new)
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/admin/users/:userId/ban  (was POST — fixed to PATCH per audit)
    @PatchMapping("/users/{userId}/ban")
    public ResponseEntity<UserResponse> banUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(adminService.setBanStatus(userId, true));
    }

    // PATCH /api/admin/users/:userId/unban  (was POST — fixed to PATCH per audit)
    @PatchMapping("/users/{userId}/unban")
    public ResponseEntity<UserResponse> unbanUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(adminService.setBanStatus(userId, false));
    }

    // ── Verification queue ────────────────────────────────────────────────

    // GET /api/admin/verification-queue
    @GetMapping("/verification-queue")
    public ResponseEntity<List<UserResponse>> getVerificationQueue() {
        return ResponseEntity.ok(adminService.getVerificationQueue());
    }

    // PATCH /api/admin/verify/:userId
    @PatchMapping("/verify/{userId}")
    public ResponseEntity<UserResponse> verifyUser(
        @PathVariable UUID userId,
        @RequestBody Map<String, String> body
    ) {
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

    // ── Reports (P4 new) ──────────────────────────────────────────────────

    // GET /api/admin/reports
    @GetMapping("/reports")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(adminService.getAllReports());
    }

    // PATCH /api/admin/reports/:id/resolve
    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(
        @PathVariable UUID id,
        @RequestBody(required = false) Map<String, String> body
    ) {
        String notes = body != null ? body.get("admin_notes") : null;
        return ResponseEntity.ok(adminService.resolveReport(id, notes));
    }

    // PATCH /api/admin/reports/:id/dismiss
    @PatchMapping("/reports/{id}/dismiss")
    public ResponseEntity<ReportResponse> dismissReport(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.dismissReport(id));
    }

    // ── Thresholds (P4 new) ───────────────────────────────────────────────

    // GET /api/admin/thresholds
    @GetMapping("/thresholds")
    public ResponseEntity<List<ThresholdResponse>> getThresholds() {
        return ResponseEntity.ok(adminService.getThresholds());
    }

    // PUT /api/admin/thresholds
    @PutMapping("/thresholds")
    public ResponseEntity<List<ThresholdResponse>> updateThresholds(
        @RequestBody List<Map<String, Object>> updates
    ) {
        return ResponseEntity.ok(adminService.updateThresholds(updates));
    }
}