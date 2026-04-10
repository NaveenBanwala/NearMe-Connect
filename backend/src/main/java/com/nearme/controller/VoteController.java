package com.nearme.controller;

import com.nearme.dto.request.VoteRequestDto;
import com.nearme.service.VoteService;
import com.nearme.service.VoteService.VoteStatusResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/blocks")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    // POST /api/blocks/vote
    @PostMapping("/vote")
    public ResponseEntity<VoteStatusResponse> submitVote(
        @AuthenticationPrincipal UserDetails principal,
        @Valid @RequestBody VoteRequestDto dto
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(voteService.submitVote(userId, dto));
    }

    // GET /api/blocks/vote/status?clusterId=
    @GetMapping("/vote/status")
    public ResponseEntity<VoteStatusResponse> getVoteStatus(
        @AuthenticationPrincipal UserDetails principal,
        @RequestParam UUID clusterId
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(voteService.getVoteStatus(clusterId, userId));
    }

    // GET /api/blocks/vote/nearby?lat=&lng=
    @GetMapping("/vote/nearby")
    public ResponseEntity<List<VoteStatusResponse>> getNearbyClusters(
        @AuthenticationPrincipal UserDetails principal,
        @RequestParam double lat,
        @RequestParam double lng
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(voteService.getNearbyClusters(lat, lng, userId));
    }
}