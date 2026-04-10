package com.nearme.service;

import com.nearme.exception.UnauthorizedException;
import com.nearme.model.Acceptance;
import com.nearme.model.ChatMessage;
import com.nearme.model.Request;
import com.nearme.repository.AcceptanceRepository;
import com.nearme.repository.ChatRepository;
import com.nearme.repository.RequestRepository;
import com.nearme.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository       chatRepository;
    private final RequestRepository    requestRepository;
    private final UserRepository       userRepository;
    private final AcceptanceRepository acceptanceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Check user is either requester or accepter before allowing chat
    private void validateChatAccess(UUID requestId, UUID userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        boolean isOwner = request.getUser().getUserId().equals(userId);
        boolean isAccepter = acceptanceRepository
            .existsByRequestRequestIdAndAcceptedUserUserId(requestId, userId);
        if (!isOwner && !isAccepter) {
            throw new UnauthorizedException("You are not part of this chat");
        }
    }

    public List<ChatMessageResponse> getMessages(UUID requestId, UUID userId) {
        validateChatAccess(requestId, userId);
        chatRepository.markAllReadForUser(requestId, userId);
        return chatRepository
            .findAllByRequestRequestIdOrderBySentAtAsc(requestId)
            .stream()
            .map(ChatMessageResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponse sendMessage(UUID requestId, UUID senderId, String text) {
        validateChatAccess(requestId, senderId);

        Request request = requestRepository.findById(requestId).orElseThrow();
        var sender = userRepository.findById(senderId).orElseThrow();

        ChatMessage msg = ChatMessage.builder()
            .request(request)
            .sender(sender)
            .message(text)
            .sentAt(Instant.now())
            .build();

        ChatMessage saved = chatRepository.save(msg);
        ChatMessageResponse response = ChatMessageResponse.from(saved);

        // Broadcast via WebSocket to all subscribers of this chat topic
        messagingTemplate.convertAndSend(
            "/topic/chat/" + requestId, response);

        return response;
    }

    // Inline response DTO
    @Data @Builder
    public static class ChatMessageResponse {
        private UUID    chatId;
        private UUID    requestId;
        private UUID    senderId;
        private String  senderName;
        private String  message;
        private boolean read;
        private Instant sentAt;

        public static ChatMessageResponse from(ChatMessage m) {
            return ChatMessageResponse.builder()
                .chatId(m.getChatId())
                .requestId(m.getRequest().getRequestId())
                .senderId(m.getSender().getUserId())
                .senderName(m.getSender().getName())
                .message(m.getMessage())
                .read(m.isRead())
                .sentAt(m.getSentAt())
                .build();
        }
    }
}