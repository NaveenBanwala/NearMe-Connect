package com.nearme.repository;

import com.nearme.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findAllByRequestRequestIdOrderBySentAtAsc(UUID requestId);

    @Modifying  // ← THIS is the missing annotation
@Query("UPDATE ChatMessage m SET m.read = true WHERE m.request.requestId = :requestId AND m.sender.userId != :userId AND m.read = false")
void markAllReadForUser(@Param("requestId") UUID requestId, @Param("userId") UUID userId);

    long countByRequestRequestIdAndReadFalseAndSenderUserIdNot(UUID requestId, UUID userId);
}