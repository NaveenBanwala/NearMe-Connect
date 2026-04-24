package com.nearme.service;

import com.google.firebase.messaging.*;
import com.nearme.model.Block;
import com.nearme.model.Request;
import com.nearme.model.User;
import com.nearme.repository.RequestRepository;
import com.nearme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

// ============================================================
// NotificationService.java
// Handles all FCM push notifications
//
// Changes from previous version:
//   - Removed LocationRequest import (class deleted)
//   - notifyVotersApproved()  → notifyClusterUsers()
//   - notifyVotersRejected()  → removed (no voters in new system)
//   - notifyAdminThresholdReached() → notifyAdmins()
// ============================================================

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository   userRepository;
    private final RequestRepository requestRepository;

    // -------------------------------------------------------
    // Request notifications (unchanged)
    // -------------------------------------------------------

    // Notify requester that their request was accepted
    public void notifyRequestAccepted(Request request, User accepter) {
        String fcm = request.getUser().getFcmToken();
        if (fcm == null) return;
        send(fcm,
            "Request Accepted!",
            accepter.getName() + " accepted your request: " + request.getTitle(),
            "REQUEST_ACCEPTED",
            request.getRequestId().toString()
        );
    }

    // Notify requester that their request is expiring soon (10 min warning)
    public void notifyExpiryWarning(Request request) {
        String fcm = request.getUser().getFcmToken();
        if (fcm == null) return;
        send(fcm,
            "Request Expiring Soon",
            "Your request \"" + request.getTitle() + "\" expires in 10 minutes.",
            "REQUEST_EXPIRY_WARNING",
            request.getRequestId().toString()
        );
    }

    // Notify nearby users about a new request in their block
    public void notifyNearbyUsers(Request request) {
        // In production: use FCM topic messaging per block_id
        log.info("Notify users in block {} about new {} request",
            request.getBlock().getBlockId(), request.getType());
    }

    // -------------------------------------------------------
    // Cluster → Block promotion notifications (new)
    // Replaces notifyVotersApproved / notifyVotersRejected
    // -------------------------------------------------------

    /**
     * Notifies all users who were active in a cluster that it has
     * been promoted to an official block.
     *
     * Called by ClusterPromotionService.notifyUsersOfPromotion()
     *
     * @param clusterId   the cluster that was promoted
     * @param message     the notification body text
     * @param newBlockId  the new official block UUID (used as entityId)
     */
public void notifyClusterUsers(UUID clusterId, String message, String newBlockId) {
    // Find users by the new block they were promoted into
    List<User> affectedUsers = userRepository.findUsersByBlockId(UUID.fromString(newBlockId));

    if (affectedUsers.isEmpty()) {
        log.info("No users to notify for cluster {} promotion", clusterId);
        return;
    }

    affectedUsers.forEach(user -> {
        if (user.getFcmToken() != null) {
            send(
                user.getFcmToken(),
                "Your area is now official!",
                message,
                "CLUSTER_PROMOTED",
                newBlockId
            );
        }
    });

    log.info("Promotion notification sent to {} user(s) for cluster {}",
        affectedUsers.size(), clusterId);
}
    /**
     * Sends a push notification to all admin accounts.
     * Called by ClusterPromotionService when a cluster meets thresholds.
     *
     * @param message    the notification body (includes cluster stats + coords)
     * @param clusterId  the cluster UUID (used as entityId for deep-link)
     */
    public void notifyAdmins(String message, String clusterId) {
        List<User> admins = userRepository.findAllAdmins();

        if (admins.isEmpty()) {
            // Fallback — log if no admin FCM tokens registered
            log.info("ADMIN ALERT (no FCM tokens): {}", message);
            return;
        }

        admins.forEach(admin -> {
            if (admin.getFcmToken() != null) {
                send(
                    admin.getFcmToken(),
                    "New Area Ready for Review",
                    message,
                    "CLUSTER_FLAGGED",
                    clusterId
                );
            }
        });

        log.info("Admin notification sent to {} admin(s) for cluster {}", admins.size(), clusterId);
    }

    // -------------------------------------------------------
    // Core FCM send (unchanged)
    // -------------------------------------------------------

    private void send(String fcmToken, String title, String body,
                      String type, String entityId) {
        if (fcmToken == null || fcmToken.isBlank()) return;
        try {
            Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .putData("type",     type)
                .putData("entityId", entityId)
                .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.debug("FCM sent: {}", response);
        } catch (FirebaseMessagingException e) {
            log.warn("FCM send failed for token {}: {}", fcmToken, e.getMessage());
        } catch (Exception e) {
            log.warn("Firebase not initialized — notification skipped: {}", e.getMessage());
        }
    }
}