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
    private final UserRepository       userRepository;
    private final AcceptanceRepository acceptanceRepository;
    private final NotificationService  notificationService;
    private final GeoService           geoService;

    // Fetch request feed for a block — respects student vs local visibility
    public List<RequestResponse> getFeed(UUID blockId, UUID viewerId,
                                         String mode, String type, int page) {
        Instant now    = Instant.now();
        Request.RequestType reqType = type != null
            ? Request.RequestType.valueOf(type.toUpperCase()) : null;
        var pageable = PageRequest.of(page, 20);

        User viewer = userRepository.findById(viewerId).orElseThrow();
        List<Request> requests;

        if (viewer.isStudentVerified()) {
            requests = requestRepository.findStudentFeed(blockId, now, reqType, viewerId, pageable);
        } else {
            requests = requestRepository.findLocalFeed(blockId, now, reqType, viewerId, pageable);
        }

        return requests.stream().map(r -> {
            RequestResponse resp = RequestResponse.from(r);
            resp.setAlreadyAccepted(
                acceptanceRepository.existsByRequestRequestIdAndAcceptedUserUserId(
                    r.getRequestId(), viewerId));
            return resp;
        }).collect(Collectors.toList());
    }

    // Fetch requests in radius mode
    public List<RequestResponse> getInRadius(UUID viewerId, double lat, double lng,
                                              double radiusMeters) {
        return requestRepository.findInRadius(lat, lng, radiusMeters, viewerId)
            .stream()
            .map(RequestResponse::from)
            .collect(Collectors.toList());
    }

    // Create a new request
    @Transactional
    public RequestResponse create(UUID userId, CreateRequestDto dto) {
        User user   = userRepository.findById(userId).orElseThrow();
        Block block = blockRepository.findById(dto.getBlockId())
            .orElseThrow(() -> new BlockNotFoundException(dto.getBlockId()));

        // Locals can only post public requests
        if (!user.isStudentVerified() && dto.getVisibility() == Request.Visibility.STUDENTS_ONLY) {
            throw new UnauthorizedException("Only verified students can post students-only requests");
        }

        Request request = Request.builder()
            .user(user)
            .block(block)
            .type(dto.getType())
            .title(dto.getTitle())
            .description(dto.getDescription())
            .imageUrl(dto.getImageUrl())
            .visibility(dto.getVisibility())
            .latitude(dto.getLatitude())
            .longitude(dto.getLongitude())
            .geoPoint(geoService.makePoint(dto.getLatitude(), dto.getLongitude()))
            .expiryTime(dto.getExpiryTime())
            .anonymous(dto.isAnonymous())
            .build();

        Request saved = requestRepository.save(request);
        log.info("Request {} created by user {} in block {}", saved.getRequestId(), userId, block.getBlockId());
        return RequestResponse.from(saved);
    }

    // Get single request detail
    public RequestResponse getById(UUID requestId, UUID viewerId) {
        Request r = requestRepository.findById(requestId).orElseThrow(
            () -> new jakarta.persistence.EntityNotFoundException("Request not found: " + requestId));
        RequestResponse resp = RequestResponse.from(r);

        // Attach acceptance info if accepted
        acceptanceRepository.findByRequestRequestIdAndAcceptedUserUserId(requestId, viewerId)
            .ifPresent(a -> {
                resp.setAcceptanceId(a.getAcceptanceId());
                resp.setAcceptedUserId(a.getAcceptedUser().getUserId());
                resp.setAcceptedUserName(a.getAcceptedUser().getName());
                resp.setAcceptanceStatus(a.getStatus().name().toLowerCase());
                resp.setAcceptedAt(a.getAcceptedAt());
                resp.setAlreadyAccepted(true);
            });

        return resp;
    }

    // Accept a request
    @Transactional
    public RequestResponse accept(UUID requestId, UUID userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();

        if (request.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You cannot accept your own request");
        }
        if (request.getStatus() != Request.RequestStatus.OPEN) {
            throw new IllegalStateException("Request is no longer open");
        }
        if (acceptanceRepository.existsByRequestRequestIdAndAcceptedUserUserId(requestId, userId)) {
            throw new IllegalStateException("Already accepted");
        }

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

        // Notify requester
        notificationService.notifyRequestAccepted(request, accepter);

        return getById(requestId, userId);
    }

    // Close a request (by owner)
    @Transactional
    public void close(UUID requestId, UUID userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        if (!request.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("Only the request owner can close it");
        }
        request.setStatus(Request.RequestStatus.CLOSED);
        requestRepository.save(request);
    }

    // Delete a request (by owner)
    @Transactional
    public void delete(UUID requestId, UUID userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        if (!request.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("Only the request owner can delete it");
        }
        requestRepository.delete(request);
    }
}