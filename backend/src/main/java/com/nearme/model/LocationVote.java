package com.nearme.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "location_votes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "cluster_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LocationVote {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "vote_id", updatable = false, nullable = false)
    private UUID voteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cluster_id", nullable = false)
    private LocationRequest cluster;

    @Column(name = "user_lat", nullable = false)
    private Double userLat;

    @Column(name = "user_lng", nullable = false)
    private Double userLng;

@org.hibernate.annotations.CreationTimestamp
@Column(name = "voted_at", nullable = false, updatable = false)
private Instant votedAt;
}