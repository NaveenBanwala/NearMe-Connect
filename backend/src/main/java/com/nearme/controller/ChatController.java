package com.nearme.controller;

import com.nearme.service.ChatService;
import com.nearme.service.ChatService.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // GET /api/chat/:requestId/messages
    @GetMapping("/{requestId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID requestId
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(chatService.getMessages(requestId, userId));
    }

    // POST /api/chat/:requestId/messages  (REST fallback)
    @PostMapping("/{requestId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
        @AuthenticationPrincipal UserDetails principal,
        @PathVariable UUID requestId,
        @RequestBody Map<String, String> body
    ) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(
            chatService.sendMessage(requestId, userId, body.get("message")));
    }

    // WebSocket handler: /app/chat/{requestId}
    // Client sends: STOMP SEND /app/chat/{requestId}
    // Server broadcasts to: /topic/chat/{requestId}
@MessageMapping("/chat/{requestId}")
public void handleWebSocketMessage(
    @DestinationVariable UUID requestId,
    @Payload Map<String, String> payload,
    java.security.Principal principal          // ← just remove @Header("simpUser")
) {
    UUID senderId = UUID.fromString(principal.getName());
    chatService.sendMessage(requestId, senderId, payload.get("message"));
}
}