package com.nearme.service;

import com.nearme.dto.response.UserResponse;
import com.nearme.exception.UnauthorizedException;
import com.nearme.model.User;
import com.nearme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final UserRepository userRepository;
    private final UploadService  uploadService;

    // Called after student uploads college ID
    @Transactional
    public UserResponse submitCollegeId(UUID userId, String idImageUrl, String collegeName) {
        User user = userRepository.findById(userId).orElseThrow();

        if (!user.isPhoneVerified()) {
            throw new UnauthorizedException("Phone must be verified first");
        }

        user.setCollegeIdUrl(idImageUrl);
        user.setCollegeName(collegeName);
        user.setVerificationStatus(User.VerificationStatus.PENDING);
        User saved = userRepository.save(user);

        log.info("User {} submitted college ID for verification (college: {})", userId, collegeName);
        return UserResponse.from(saved);
    }

    // Admin: get pending verification queue
    public List<UserResponse> getPendingQueue() {
        return userRepository
            .findAllByVerificationStatus(User.VerificationStatus.PENDING)
            .stream()
            .map(UserResponse::from)
            .collect(Collectors.toList());
    }

    // Admin: approve student verification
    @Transactional
    public UserResponse approve(UUID userId, UUID blockId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setStudentVerified(true);
        user.setVerificationStatus(User.VerificationStatus.APPROVED);
        if (blockId != null) user.setCampusBlockId(blockId);
        User saved = userRepository.save(user);
        log.info("User {} approved as student (campus: {})", userId, blockId);
        return UserResponse.from(saved);
    }

    // Admin: reject student verification
    @Transactional
    public UserResponse reject(UUID userId, String reason) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setVerificationStatus(User.VerificationStatus.REJECTED);
        User saved = userRepository.save(user);
        log.info("User {} verification rejected: {}", userId, reason);
        return UserResponse.from(saved);
    }
}