package com.nearme.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "acceptances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Acceptance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "acceptance_id", updatable = false, nullable = false)
    private UUID acceptanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_user_id", nullable = false)
    private User acceptedUser;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) // This is the "magic" line for Postgres enums
    @Column(name = "status", nullable = false)
    private AcceptanceStatus status = AcceptanceStatus.ACTIVE;

    @Column(name = "accepted_at", nullable = false)
    private Instant acceptedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum AcceptanceStatus { PENDING, ACTIVE, COMPLETED, CANCELLED }
}