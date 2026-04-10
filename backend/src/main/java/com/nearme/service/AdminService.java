package com.nearme.service;

import com.nearme.dto.request.CreateBlockDto;
import com.nearme.dto.response.BlockResponse;
import com.nearme.dto.response.UserResponse;
import com.nearme.model.*;
import com.nearme.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final BlockRepository           blockRepository;
    private final LocationRequestRepository clusterRepository;
    private final UserRepository            userRepository;
    private final RequestRepository         requestRepository;
    private final ReportRepository          reportRepository;
    private final BlockThresholdRepository  thresholdRepository;
    private final NotificationService       notificationService;
    private final GeoService                geoService;

    // Stats dashboard
    public Map<String, Object> getStats() {
        long totalUsers       = userRepository.count();
        long verifiedStudents = userRepository
            .findAllByVerificationStatus(User.VerificationStatus.APPROVED).size();
        long activeBlocks     = blockRepository.findAllByStatus(Block.BlockStatus.ACTIVE).size();
        long pendingVotes     = clusterRepository
            .findAllByStatusOrderByVoteCountDesc(LocationRequest.ClusterStatus.PENDING).size();
        long pendingVerify    = userRepository
            .findAllByVerificationStatus(User.VerificationStatus.PENDING).size();
        long liveUsers        = blockRepository.findAllByStatus(Block.BlockStatus.ACTIVE)
            .stream().mapToLong(Block::getLiveUserCount).sum();
        long openRequests     = blockRepository.findAllByStatus(Block.BlockStatus.ACTIVE)
            .stream().mapToLong(Block::getOpenRequestCount).sum();
        long openReports      = reportRepository.countByStatus(Report.ReportStatus.OPEN);

        return Map.of(
            "total_users",       totalUsers,
            "verified_students", verifiedStudents,
            "active_blocks",     activeBlocks,
            "live_users",        liveUsers,
            "open_requests",     openRequests,
            "pending_votes",     pendingVotes,
            "pending_verify",    pendingVerify,
            "open_reports",      openReports
        );
    }

    // GET /admin/metrics/live
    public Map<String, Object> getLiveMetrics() {
        List<Block> activeBlocks = blockRepository.findAllByStatus(Block.BlockStatus.ACTIVE);
        long totalLive     = activeBlocks.stream().mapToLong(Block::getLiveUserCount).sum();
        long totalRequests = activeBlocks.stream().mapToLong(Block::getOpenRequestCount).sum();
        Block hottest = activeBlocks.stream()
            .max(Comparator.comparingInt(Block::getHeatScore)).orElse(null);

        return Map.of(
            "live_users",          totalLive,
            "open_requests",       totalRequests,
            "active_blocks",       activeBlocks.size(),
            "hottest_block_name",  hottest != null ? hottest.getName()       : "N/A",
            "hottest_block_score", hottest != null ? hottest.getHeatScore()  : 0,
            "timestamp",           Instant.now()
        );
    }

    // GET /admin/blocks
    public List<BlockResponse> getAllBlocks() {
        return blockRepository.findAll().stream()
            .map(BlockResponse::from).collect(Collectors.toList());
    }

    // PUT /admin/blocks/:id
    @Transactional
    public BlockResponse updateBlock(UUID blockId, Map<String, Object> updates) {
        Block block = blockRepository.findById(blockId).orElseThrow(
            () -> new jakarta.persistence.EntityNotFoundException("Block not found: " + blockId));
        if (updates.containsKey("name"))     block.setName((String) updates.get("name"));
        if (updates.containsKey("status"))   block.setStatus(Block.BlockStatus.valueOf(
            ((String) updates.get("status")).toUpperCase()));
        if (updates.containsKey("boundary_geo_json")) block.setGeoPolygon(
            geoService.parseGeoJsonPolygon((String) updates.get("boundary_geo_json")));
        if (updates.containsKey("center_lat")) block.setCenterLat(
            ((Number) updates.get("center_lat")).doubleValue());
        if (updates.containsKey("center_lng")) block.setCenterLng(
            ((Number) updates.get("center_lng")).doubleValue());
        return BlockResponse.from(blockRepository.save(block));
    }

    // DELETE /admin/blocks/:id
    @Transactional
    public void deleteBlock(UUID blockId) {
        blockRepository.deleteById(blockId);
        log.info("Block {} deleted by admin", blockId);
    }

    // GET /admin/users
    public List<UserResponse> getAllUsers(String search, String filter) {
        List<User> users = userRepository.findAll();
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            users = users.stream().filter(u ->
                (u.getName() != null && u.getName().toLowerCase().contains(q)) ||
                (u.getPhone() != null && u.getPhone().contains(q)) ||
                (u.getCollegeName() != null && u.getCollegeName().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }
        if (filter != null) {
            users = switch (filter.toLowerCase()) {
                case "students" -> users.stream().filter(User::isStudentVerified).collect(Collectors.toList());
                case "locals"   -> users.stream().filter(u -> !u.isStudentVerified()).collect(Collectors.toList());
                case "banned"   -> users.stream().filter(u -> u.getStatus() == User.UserStatus.BANNED).collect(Collectors.toList());
                default         -> users;
            };
        }
        return users.stream().map(UserResponse::from).collect(Collectors.toList());
    }

    // DELETE /admin/users/:id
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setStatus(User.UserStatus.DELETED);
        userRepository.save(user);
        log.info("User {} marked deleted by admin", userId);
    }

    // PATCH /admin/users/:id/ban  and  /unban
    @Transactional
    public UserResponse setBanStatus(UUID userId, boolean banned) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setStatus(banned ? User.UserStatus.BANNED : User.UserStatus.ACTIVE);
        return UserResponse.from(userRepository.save(user));
    }

    // GET /admin/reports
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(ReportResponse::from).collect(Collectors.toList());
    }

    // PATCH /admin/reports/:id/resolve
    @Transactional
    public ReportResponse resolveReport(UUID reportId, String adminNotes) {
        Report report = reportRepository.findById(reportId).orElseThrow(
            () -> new jakarta.persistence.EntityNotFoundException("Report not found: " + reportId));
        report.setStatus(Report.ReportStatus.RESOLVED);
        report.setAdminNotes(adminNotes);
        report.setResolvedAt(Instant.now());
        return ReportResponse.from(reportRepository.save(report));
    }

    // PATCH /admin/reports/:id/dismiss
    @Transactional
    public ReportResponse dismissReport(UUID reportId) {
        Report report = reportRepository.findById(reportId).orElseThrow(
            () -> new jakarta.persistence.EntityNotFoundException("Report not found: " + reportId));
        report.setStatus(Report.ReportStatus.DISMISSED);
        report.setResolvedAt(Instant.now());
        return ReportResponse.from(reportRepository.save(report));
    }

    // GET /admin/thresholds
    public List<ThresholdResponse> getThresholds() {
        List<BlockThreshold> saved = thresholdRepository.findAll();
        if (saved.isEmpty()) {
            return Arrays.stream(Block.BlockCategory.values())
                .map(cat -> ThresholdResponse.builder()
                    .category(cat.name().toLowerCase())
                    .threshold(defaultThreshold(cat))
                    .description("Default threshold for " + cat.name().toLowerCase())
                    .build())
                .collect(Collectors.toList());
        }
        return saved.stream().map(t -> ThresholdResponse.builder()
            .category(t.getCategory().name().toLowerCase())
            .threshold(t.getThreshold())
            .description(t.getDescription())
            .build()).collect(Collectors.toList());
    }

    // PUT /admin/thresholds
    @Transactional
    public List<ThresholdResponse> updateThresholds(List<Map<String, Object>> updates) {
        for (Map<String, Object> u : updates) {
            Block.BlockCategory cat = Block.BlockCategory.valueOf(
                ((String) u.get("category")).toUpperCase());
            int threshold = ((Number) u.get("threshold")).intValue();
            String desc   = (String) u.getOrDefault("description", "");
            BlockThreshold bt = thresholdRepository.findByCategory(cat)
                .orElse(BlockThreshold.builder().category(cat).build());
            bt.setThreshold(threshold);
            bt.setDescription(desc);
            thresholdRepository.save(bt);
        }
        return getThresholds();
    }

    private int defaultThreshold(Block.BlockCategory cat) {
        return switch (cat) { case CAMPUS -> 50; case LOCALITY -> 25; case SOCIETY -> 20; case MARKET -> 30; };
    }

    // Existing methods
    public List<ClusterAdminResponse> getVoteClusters() {
        return clusterRepository.findAllByStatusOrderByVoteCountDesc(LocationRequest.ClusterStatus.PENDING)
            .stream().map(ClusterAdminResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public BlockResponse approveCluster(UUID adminId, CreateBlockDto dto) {
        LocationRequest cluster = clusterRepository.findById(dto.getClusterId()).orElseThrow();
        cluster.setStatus(LocationRequest.ClusterStatus.APPROVED);
        cluster.setApprovedAt(Instant.now());
        clusterRepository.save(cluster);
        Block block = Block.builder()
            .name(dto.getName()).category(dto.getCategory())
            .geoPolygon(geoService.parseGeoJsonPolygon(dto.getBoundaryGeoJson()))
            .centerLat(dto.getCenterLat()).centerLng(dto.getCenterLng())
            .status(Block.BlockStatus.ACTIVE).createdByAdmin(adminId).build();
        Block saved = blockRepository.save(block);
        notificationService.notifyVotersApproved(cluster);
        return BlockResponse.from(saved);
    }

    @Transactional
    public void rejectCluster(UUID clusterId, String reason) {
        LocationRequest cluster = clusterRepository.findById(clusterId).orElseThrow();
        cluster.setStatus(LocationRequest.ClusterStatus.REJECTED);
        cluster.setAdminNotes(reason);
        clusterRepository.save(cluster);
        notificationService.notifyVotersRejected(cluster, reason);
    }

    public List<UserResponse> getVerificationQueue() {
        return userRepository.findAllByVerificationStatus(User.VerificationStatus.PENDING)
            .stream().map(UserResponse::from).collect(Collectors.toList());
    }

    public List<BlockResponse> getTopBlocks(int limit) {
        return blockRepository.findTopByHeat(PageRequest.of(0, limit))
            .stream().map(BlockResponse::from).collect(Collectors.toList());
    }

    // Inline response DTOs
    @Data @Builder
    public static class ReportResponse {
        private UUID reportId; private String reportedByName;
        private String againstType; private String againstName;
        private String reason; private String status;
        private String adminNotes; private Instant createdAt; private Instant resolvedAt;
        public static ReportResponse from(Report r) {
            String name = r.getAgainstType() == Report.ReportType.USER
                ? (r.getAgainstUser() != null ? r.getAgainstUser().getName() : "Unknown")
                : (r.getAgainstRequest() != null ? r.getAgainstRequest().getTitle() : "Unknown");
            return ReportResponse.builder()
                .reportId(r.getReportId()).reportedByName(r.getReportedBy().getName())
                .againstType(r.getAgainstType().name().toLowerCase()).againstName(name)
                .reason(r.getReason()).status(r.getStatus().name().toLowerCase())
                .adminNotes(r.getAdminNotes()).createdAt(r.getCreatedAt()).resolvedAt(r.getResolvedAt()).build();
        }
    }

    @Data @Builder
    public static class ThresholdResponse {
        private String category; private int threshold; private String description;
    }

    @Data @Builder
    public static class ClusterAdminResponse {
        private UUID clusterId; private String suggestedName;
        private double geoLat; private double geoLng; private String category;
        private int voteCount; private int uniqueVoterCount; private int thresholdRequired;
        private double progressPct; private boolean thresholdReached;
        private String status; private Instant createdAt;
        public static ClusterAdminResponse from(LocationRequest c) {
            return ClusterAdminResponse.builder()
                .clusterId(c.getClusterId()).suggestedName(c.getSuggestedName())
                .geoLat(c.getGeoLat()).geoLng(c.getGeoLng())
                .category(c.getCategory().name().toLowerCase())
                .voteCount(c.getVoteCount()).uniqueVoterCount(c.getUniqueVoterCount())
                .thresholdRequired(c.getThresholdRequired()).progressPct(c.getProgressPct())
                .thresholdReached(c.isThresholdReached())
                .status(c.getStatus().name().toLowerCase()).createdAt(c.getCreatedAt()).build();
        }
    }
}