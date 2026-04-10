package com.nearme.controller;

import com.nearme.dto.request.LoginRequest;
import com.nearme.dto.request.RegisterRequest;
import com.nearme.dto.response.AuthResponse;
import com.nearme.dto.response.UserResponse;
import com.nearme.security.JwtTokenProvider;
import com.nearme.service.AuthService;
import com.nearme.service.UploadService;
import com.nearme.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService         authService;
    private final VerificationService verificationService;
    private final UploadService       uploadService;

    // POST /api/auth/send-otp
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(
        @Valid @RequestBody LoginRequest req
    ) {
        authService.sendOtp(req.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    // POST /api/auth/verify-otp
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
        @Valid @RequestBody RegisterRequest req
    ) {
        AuthResponse response = authService.verifyOtp(
            req.getPhone(), req.getCode(), req.getName(), req.getFcmToken());
        return ResponseEntity.ok(response);
    }

    // POST /api/auth/upload-college-id  (multipart)
    @PostMapping("/upload-college-id")
    public ResponseEntity<UserResponse> uploadCollegeId(
        @AuthenticationPrincipal UserDetails principal,
        @RequestParam("file")        MultipartFile file,
        @RequestParam("college_name") String collegeName
    ) throws Exception {
        UUID userId = UUID.fromString(principal.getUsername());

        // Upload to S3 via presigned URL flow
        var presign   = uploadService.getPresignedUrl(file.getOriginalFilename(),
                                                      file.getContentType());
        String publicUrl = presign.get("publicUrl");

        UserResponse resp = verificationService.submitCollegeId(userId, publicUrl, collegeName);
        return ResponseEntity.ok(resp);
    }

    // GET /api/auth/me
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
        @AuthenticationPrincipal UserDetails principal
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(authService.getMe(userId));
    }
}