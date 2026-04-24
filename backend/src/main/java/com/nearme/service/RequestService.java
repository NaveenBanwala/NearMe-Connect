package com.nearme.service;

import com.nearme.dto.request.CreateRequestDto;
import com.nearme.dto.response.RequestResponse;
import com.nearme.exception.BlockNotFoundException;
import com.nearme.exception.UnauthorizedException;
import com.nearme.model.*;
import com.nearme.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository    requestRepository;
    private final BlockRepository      blockRepository;
    private final ClusterRepository    clusterRepository;      // ← added
    private final UserRepository       userRepository;
    private final AcceptanceRepository acceptanceRepository;
    private final NotificationService  notificationService;
    private final ClusterService       clusterService;         // ← added
    private final GeoService           geoService;

    // ── Feed for a block ──────────────────────────────────────────
  // ── Feed for a block ──────────────────────────────────────────
  @Transactional(readOnly = true)
public List<RequestResponse> getFeed(UUID blockId, UUID viewerId,
                                     String mode, String type, int page) {
    Instant now  = Instant.now();
    String reqType = type != null ? type.toUpperCase() : null;  // ← String, not enum
    var pageable = PageRequest.of(page, 20);

    User viewer = userRepository.findById(viewerId).orElseThrow();
    List<Request> requests = viewer.isStudentVerified()
        ? requestRepository.findStudentFeed(blockId, now, reqType, viewerId, pageable)
        : requestRepository.findLocalFeed(blockId, now, reqType, viewerId, pageable);

    return requests.stream().map(r -> {
        RequestResponse resp = RequestResponse.from(r);
        resp.setAlreadyAccepted(
            acceptanceRepository.existsByRequestRequestIdAndAcceptedUserUserId(
                r.getRequestId(), viewerId));
        return resp;
    }).collect(Collectors.toList());
}
   @Transactional(readOnly = true)
public List<RequestResponse> getInRadius(UUID viewerId, double lat, double lng,
                                          double radiusMeters) {
    return requestRepository.findInRadius(lat, lng, radiusMeters, viewerId)
        .stream()
        .map(RequestResponse::from)
        .collect(Collectors.toList());
}

    // ── Create — handles all three contexts ───────────────────────
    @Transactional
    public RequestResponse create(UUID userId, CreateRequestDto dto) {
        User user = userRepository.findById(userId).orElseThrow();

        // Locals cannot post students-only requests regardless of context
        if (!user.isStudentVerified()
                && dto.getVisibility() == Request.Visibility.STUDENTS_ONLY) {
            throw new UnauthorizedException(
                "Only verified students can post students-only requests");
        }

        if (dto.isBlockRequest()) {
            return createBlockRequest(user, dto);
        } else if (dto.isClusterRequest()) {
            return createClusterRequest(user, dto);
        } else {
            return createFreePinRequest(user, dto);
        }
    }

    @Transactional(readOnly = true)          // ← ADD THIS
public RequestResponse getById(UUID requestId, UUID viewerId) {
    Request r = requestRepository.findById(requestId).orElseThrow(
        () -> new jakarta.persistence.EntityNotFoundException(
            "Request not found: " + requestId));
    RequestResponse resp = RequestResponse.from(r);   // user proxy still live ✓

    acceptanceRepository
        .findByRequestRequestIdAndAcceptedUserUserId(requestId, viewerId)
        .ifPresent(a -> {
            resp.setAcceptanceId(a.getAcceptanceId());
            resp.setAcceptedUserId(a.getAcceptedUser().getUserId());
            resp.setAcceptedUserName(a.getAcceptedUser().getName());   // also lazy — safe now ✓
            resp.setAcceptanceStatus(a.getStatus().name().toLowerCase());
            resp.setAcceptedAt(a.getAcceptedAt());
            resp.setAlreadyAccepted(true);
        });

    return resp;
}

    // // ── Single request detail ─────────────────────────────────────
    // public RequestResponse getById(UUID requestId, UUID viewerId) {
    //     Request r = requestRepository.findById(requestId).orElseThrow(
    //         () -> new jakarta.persistence.EntityNotFoundException(
    //             "Request not found: " + requestId));
    //     RequestResponse resp = RequestResponse.from(r);

    //     acceptanceRepository
    //         .findByRequestRequestIdAndAcceptedUserUserId(requestId, viewerId)
    //         .ifPresent(a -> {
    //             resp.setAcceptanceId(a.getAcceptanceId());
    //             resp.setAcceptedUserId(a.getAcceptedUser().getUserId());
    //             resp.setAcceptedUserName(a.getAcceptedUser().getName());
    //             resp.setAcceptanceStatus(a.getStatus().name().toLowerCase());
    //             resp.setAcceptedAt(a.getAcceptedAt());
    //             resp.setAlreadyAccepted(true);
    //         });

    //     return resp;
    // }

    // ── Accept ────────────────────────────────────────────────────
    @Transactional
    public RequestResponse accept(UUID requestId, UUID userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();

        if (request.getUser().getUserId().equals(userId))
            throw new UnauthorizedException("You cannot accept your own request");
        if (request.getStatus() != Request.RequestStatus.OPEN)
            throw new IllegalStateException("Request is no longer open");
        if (acceptanceRepository.existsByRequestRequestIdAndAcceptedUserUserId(requestId, userId))
            throw new IllegalStateException("Already accepted");

        User accepter = userRepository.findById(userId).orElseThrow();

        Acceptance acceptance = Acceptance.builder()
            .request(request)
            .acceptedUser(accepter)
            .status(Acceptance.AcceptanceStatus.ACTIVE)
            .acceptedAt(Instant.now())
            .build();
        acceptanceRepository.save(acceptance);

        request.setStatus(Request.RequestStatus.ACCEPTED);
        requestRepository.save(request);

        notificationService.notifyRequestAccepted(request, accepter);
        return getById(requestId, userId);
    }

    // ── Close ─────────────────────────────────────────────────────
    @Transactional
    public void close(UUID requestId, UUID userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        if (!request.getUser().getUserId().equals(userId))
            throw new UnauthorizedException("Only the request owner can close it");
        request.setStatus(Request.RequestStatus.CLOSED);
        requestRepository.save(request);
    }

    // ── Delete ────────────────────────────────────────────────────
    @Transactional
    public void delete(UUID requestId, UUID userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        if (!request.getUser().getUserId().equals(userId))
            throw new UnauthorizedException("Only the request owner can delete it");
        requestRepository.delete(request);
    }

    // ============================================================
    // Private: three create paths
    // ============================================================

    // ── Path A: user is inside an official block ──────────────────
    private RequestResponse createBlockRequest(User user, CreateRequestDto dto) {
        Block block = blockRepository.findById(dto.getBlockId())
            .orElseThrow(() -> new BlockNotFoundException(dto.getBlockId()));

        Request request = buildRequest(user, dto)
            .block(block)
            .build();

        Request saved = requestRepository.save(request);
        log.info("Block request {} created by {} in block {}",
            saved.getRequestId(), user.getUserId(), block.getBlockId());
        return RequestResponse.from(saved);
    }

    // ── Path B: user is inside an unofficial cluster ──────────────
    private RequestResponse createClusterRequest(User user, CreateRequestDto dto) {
        ActivityCluster cluster = clusterRepository.findById(dto.getClusterId())
            .orElseThrow(() -> new BlockNotFoundException(
                "Cluster not found: " + dto.getClusterId()));

        Request request = buildRequest(user, dto)
            .cluster(cluster)
            .build();

        Request saved = requestRepository.save(request);

        // Increment the cluster's request counter so it stays warm
        // and feeds into ClusterPromotionService thresholds
        clusterService.onRequestPostedInCluster(cluster.getClusterId());

        log.info("Cluster request {} created by {} in cluster {}",
            saved.getRequestId(), user.getUserId(), cluster.getClusterId());
        return RequestResponse.from(saved);
    }

    // ── Path C: user is in open space — free-pin ─────────────────
    private RequestResponse createFreePinRequest(User user, CreateRequestDto dto) {
        if (dto.getLatitude() == null || dto.getLongitude() == null) {
            throw new IllegalArgumentException(
                "lat and lng are required for free-pin requests");
        }

        Request request = buildRequest(user, dto).build();   // no block, no cluster
        Request saved   = requestRepository.save(request);

        log.info("Free-pin request {} created by {} at ({}, {})",
            saved.getRequestId(), user.getUserId(),
            dto.getLatitude(), dto.getLongitude());

        // ── Feed free-pin coordinates into cluster formation ──────
        // Same pipeline as the location ping: if enough free-pin
        // requests accumulate near each other, ClusterService will
        // promote the area from FORMING → ACTIVE, and
        // ClusterPromotionService will eventually flag it for admin.
        //
        // Run in a try/catch so a cluster-service hiccup never
        // blocks the user's request from being saved.
        try {
            clusterService.handleUserPing(user, dto.getLatitude(), dto.getLongitude());
        } catch (Exception ex) {
            log.warn("Cluster ping failed for free-pin request {} — {}",
                saved.getRequestId(), ex.getMessage());
        }

        return RequestResponse.from(saved);
    }

    // ── Shared builder (common fields for all three paths) ────────
   private Request.RequestBuilder buildRequest(User user, CreateRequestDto dto) {
    Double lat = dto.getLatitude();
    Double lng = dto.getLongitude();

    return Request.builder()
        .user(user)
        .status(Request.RequestStatus.OPEN)   // ← ADD THIS
        .type(dto.getType())
        .title(dto.getTitle())
        .description(dto.getDescription())
        .imageUrl(dto.getImageUrl())
        .visibility(dto.getVisibility())
        .latitude(lat)
        .longitude(lng)
        .geoPoint(lat != null && lng != null
            ? geoService.makePoint(lat, lng) : null)
        .expiryTime(dto.getExpiryTime())
        .anonymous(dto.isAnonymous());
}
}