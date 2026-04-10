package com.nearme.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import jakarta.annotation.PostConstruct;
import java.net.URL;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class UploadService {

    @Value("${aws.access-key}")   private String accessKey;
    @Value("${aws.secret-key}")   private String secretKey;
    @Value("${aws.bucket-name}")  private String bucketName;
    @Value("${aws.region}")       private String region;

    private S3Presigner presigner;
    private boolean     enabled = false;

    @PostConstruct
    public void init() {
        if (accessKey != null && !accessKey.isBlank()) {
            var creds = AwsBasicCredentials.create(accessKey, secretKey);
            presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(creds))
                .build();
            enabled = true;
            log.info("AWS S3 upload service initialized");
        } else {
            log.warn("AWS not configured — uploads will return mock URLs");
        }
    }

    // Returns { url: presignedPutUrl, publicUrl: finalImageUrl }
    public Map<String, String> getPresignedUrl(String filename, String contentType) {
        String key = "uploads/" + UUID.randomUUID() + "/" + filename;

        if (!enabled) {
            // Dev fallback — return mock URL
            return Map.of(
                "url",       "http://localhost:9000/" + bucketName + "/" + key,
                "publicUrl", "http://localhost:9000/" + bucketName + "/" + key
            );
        }

        PutObjectRequest putReq = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .build();

        PutObjectPresignRequest presignReq = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(10))
            .putObjectRequest(putReq)
            .build();

        URL presignedUrl = presigner.presignPutObject(presignReq).url();
        String publicUrl = "https://" + bucketName + ".s3." + region
            + ".amazonaws.com/" + key;

        return Map.of(
            "url",       presignedUrl.toString(),
            "publicUrl", publicUrl
        );
    }
}