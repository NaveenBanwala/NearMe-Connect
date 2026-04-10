package com.nearme.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "location_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LocationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "cluster_id", updatable = false, nullable = false)
    private UUID clusterId;

    @Column(name = "suggested_name", nullable = false, length = 200)
    private String suggestedName;

    @Column(name = "geo_lat", nullable = false)
    private Double geoLat;

    @Column(name = "geo_lng", nullable = false)
    private Double geoLng;

    @Column(name = "geo_point", columnDefinition = "geometry(Point,4326)", nullable = false)
    private Point geoPoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Block.BlockCategory category;

    @Column(name = "vote_count", nullable = false)
    private Integer voteCount = 1;

    @Column(name = "unique_voter_count", nullable = false)
    private Integer uniqueVoterCount = 1;

    @Column(name = "threshold_required", nullable = false)
    private Integer thresholdRequired = 50;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ClusterStatus status = ClusterStatus.PENDING;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum ClusterStatus { PENDING, APPROVED, REJECTED }

    public double getProgressPct() {
        return Math.round((voteCount.doubleValue() / thresholdRequired) * 100.0 * 10.0) / 10.0;
    }

    public boolean isThresholdReached() {
        return voteCount >= thresholdRequired;
    }
}