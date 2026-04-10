package com.nearme.controller;

import com.nearme.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    // POST /api/uploads/presign
    // Body: { filename: "photo.jpg", contentType: "image/jpeg" }
    // Returns: { url: presignedS3Url, publicUrl: finalImageUrl }
    @PostMapping("/presign")
    public ResponseEntity<Map<String, String>> presign(
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(
            uploadService.getPresignedUrl(
                body.get("filename"),
                body.get("contentType")
            )
        );
    }
}