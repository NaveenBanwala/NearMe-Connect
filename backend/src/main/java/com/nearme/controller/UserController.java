package com.nearme.controller;

import com.nearme.dto.response.UserResponse;
import com.nearme.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/:id
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    // PATCH /api/users/profile
    @PatchMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
        @AuthenticationPrincipal UserDetails principal,
        @RequestBody Map<String, String> updates
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(userService.updateProfile(userId, updates));
    }

    // POST /api/users/report
    @PostMapping("/report")
    public ResponseEntity<Void> report(
        @AuthenticationPrincipal UserDetails principal,
        @RequestBody Map<String, String> body
    ) {
        UUID reporterId = UUID.fromString(principal.getUsername());
        UUID targetId   = UUID.fromString(body.get("userId"));
        userService.reportUser(reporterId, targetId, body.get("reason"));
        return ResponseEntity.ok().build();
    }

    // POST /api/users/block
    @PostMapping("/block")
    public ResponseEntity<Void> blockUser(
        @AuthenticationPrincipal UserDetails principal,
        @RequestBody Map<String, String> body
    ) {
        UUID blockerId = UUID.fromString(principal.getUsername());
        UUID targetId  = UUID.fromString(body.get("userId"));
        userService.blockUser(blockerId, targetId);
        return ResponseEntity.ok().build();
    }
}
