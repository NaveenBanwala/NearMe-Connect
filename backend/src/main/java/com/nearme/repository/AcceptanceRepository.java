package com.nearme.repository;

import com.nearme.model.Acceptance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AcceptanceRepository extends JpaRepository<Acceptance, UUID> {

    Optional<Acceptance> findByRequestRequestIdAndAcceptedUserUserId(UUID requestId, UUID userId);

    boolean existsByRequestRequestIdAndAcceptedUserUserId(UUID requestId, UUID userId);

    List<Acceptance> findAllByRequestRequestId(UUID requestId);

    List<Acceptance> findAllByAcceptedUserUserId(UUID userId);
}