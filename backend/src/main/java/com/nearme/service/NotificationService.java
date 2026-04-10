package com.nearme.service;

import com.google.firebase.messaging.*;
import com.nearme.model.Block;
import com.nearme.model.LocationRequest;
import com.nearme.model.Request;
import com.nearme.model.User;
import com.nearme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;

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

    // Notify all voters when a cluster is approved
    public void notifyVotersApproved(LocationRequest cluster) {
        List<User> voters = userRepository.findVotersByCluster(cluster.getClusterId());
        String title = "Block Approved!";
        String body  = cluster.getSuggestedName() + " is now live on NearMe!";
        voters.forEach(u -> send(u.getFcmToken(), title, body,
            "BLOCK_APPROVED", cluster.getClusterId().toString()));
    }

    // Notify all voters when a cluster is rejected
    public void notifyVotersRejected(LocationRequest cluster, String reason) {
        List<User> voters = userRepository.findVotersByCluster(cluster.getClusterId());
        String title = "Block Request Declined";
        String body  = cluster.getSuggestedName() + " was not approved."
            + (reason != null ? " Reason: " + reason : "");
        voters.forEach(u -> send(u.getFcmToken(), title, body,
            "BLOCK_REJECTED", cluster.getClusterId().toString()));
    }

    // Notify admin (via FCM or log) when threshold is reached
    public void notifyAdminThresholdReached(LocationRequest cluster) {
        log.info("ADMIN ALERT: Vote cluster '{}' reached threshold — {} / {} votes",
            cluster.getSuggestedName(), cluster.getVoteCount(), cluster.getThresholdRequired());
        // In production: send to admin FCM token or trigger email via SendGrid
    }

    // Notify nearby users about a new request in their block
    public void notifyNearbyUsers(Request request) {
        // In production: use FCM topic messaging per block_id
        // For now: log the intent
        log.info("Notify users in block {} about new {} request",
            request.getBlock().getBlockId(), request.getType());
    }

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
                .putData("type",      type)
                .putData("entityId",  entityId)
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