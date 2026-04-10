package com.nearme.service;

import com.nearme.dto.request.VoteRequestDto;
import com.nearme.model.*;
import com.nearme.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteService {

    private final LocationRequestRepository clusterRepository;
    private final VoteRepository            voteRepository;
    private final UserRepository            userRepository;
    private final GeoService                geoService;
    private final NotificationService       notificationService;

    @Value("${block.default-campus-threshold}")  private int campusThreshold;
    @Value("${block.default-locality-threshold}") private int localityThreshold;
    @Value("${block.default-society-threshold:20}") private int societyThreshold;
    @Value("${block.default-market-threshold:30}")  private int marketThreshold;
    @Value("${block.vote-cluster-radius-meters:500}") private double clusterRadius;

    @Transactional
    public VoteStatusResponse submitVote(UUID userId, VoteRequestDto dto) {
        User user = userRepository.findById(userId).orElseThrow();

        // Find or create a cluster near the user's GPS
        LocationRequest cluster = clusterRepository
            .findNearbyPendingCluster(dto.getUserLat(), dto.getUserLng())
            .orElseGet(() -> createCluster(dto));

        // Prevent duplicate votes
        if (voteRepository.existsByUserUserIdAndClusterClusterId(userId, cluster.getClusterId())) {
            return VoteStatusResponse.from(cluster, true);
        }

        // Validate user is actually near the cluster (GPS fraud prevention)
        double dist = geoService.distanceMeters(
            dto.getUserLat(), dto.getUserLng(), cluster.getGeoLat(), cluster.getGeoLng());
        if (dist > clusterRadius * 2) {
            throw new IllegalStateException("You must be near the location to vote");
        }

        // Save vote
        Point userPoint = geoService.makePoint(dto.getUserLat(), dto.getUserLng());
        LocationVote vote = LocationVote.builder()
            .user(user)
            .cluster(cluster)
            .userLat(dto.getUserLat())
            .userLng(dto.getUserLng())
            .build();
        voteRepository.save(vote);

        // Reload cluster (trigger already incremented vote_count in DB)
        cluster = clusterRepository.findById(cluster.getClusterId()).orElseThrow();

        // Notify admin when threshold is first reached
        if (cluster.isThresholdReached()) {
            log.info("Cluster {} reached threshold — notifying admin", cluster.getClusterId());
            notificationService.notifyAdminThresholdReached(cluster);
        }

        return VoteStatusResponse.from(cluster, true);
    }

    public VoteStatusResponse getVoteStatus(UUID clusterId, UUID userId) {
        LocationRequest cluster = clusterRepository.findById(clusterId).orElseThrow();
        boolean hasVoted = voteRepository.existsByUserUserIdAndClusterClusterId(userId, clusterId);
        return VoteStatusResponse.from(cluster, hasVoted);
    }

    public List<VoteStatusResponse> getNearbyClusters(double lat, double lng, UUID userId) {
        return clusterRepository.findNearbyClusters(lat, lng).stream()
            .map(c -> {
                boolean hasVoted = voteRepository
                    .existsByUserUserIdAndClusterClusterId(userId, c.getClusterId());
                return VoteStatusResponse.from(c, hasVoted);
            })
            .collect(Collectors.toList());
    }

    private LocationRequest createCluster(VoteRequestDto dto) {
        int threshold = switch (dto.getCategory()) {
            case CAMPUS   -> campusThreshold;
            case LOCALITY -> localityThreshold;
            case SOCIETY  -> societyThreshold;
            case MARKET   -> marketThreshold;
        };

        LocationRequest cluster = LocationRequest.builder()
            .suggestedName(dto.getSuggestedName())
            .geoLat(dto.getUserLat())
            .geoLng(dto.getUserLng())
            .geoPoint(geoService.makePoint(dto.getUserLat(), dto.getUserLng()))
            .category(dto.getCategory())
            .voteCount(0)
            .uniqueVoterCount(0)
            .thresholdRequired(threshold)
            .status(LocationRequest.ClusterStatus.PENDING)
            .build();

        return clusterRepository.save(cluster);
    }

    @Data @Builder
    public static class VoteStatusResponse {
        private UUID    clusterId;
        private String  suggestedName;
        private String  category;
        private int     voteCount;
        private int     thresholdRequired;
        private double  progressPct;
        private boolean thresholdReached;
        private boolean userHasVoted;
        private String  status;

        public static VoteStatusResponse from(LocationRequest c, boolean userHasVoted) {
            return VoteStatusResponse.builder()
                .clusterId(c.getClusterId())
                .suggestedName(c.getSuggestedName())
                .category(c.getCategory().name().toLowerCase())
                .voteCount(c.getVoteCount())
                .thresholdRequired(c.getThresholdRequired())
                .progressPct(c.getProgressPct())
                .thresholdReached(c.isThresholdReached())
                .userHasVoted(userHasVoted)
                .status(c.getStatus().name().toLowerCase())
                .build();
        }
    }
}