package com.nearme.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Polygon;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.UUID;

@Entity
@Table(name = "blocks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "block_id", updatable = false, nullable = false)
    private UUID blockId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private BlockCategory category;

    @Column(name = "geo_polygon", columnDefinition = "geometry(Polygon,4326)", nullable = false)
    private Polygon geoPolygon;

    @Column(name = "center_lat", nullable = false)
    private Double centerLat;

    @Column(name = "center_lng", nullable = false)
    private Double centerLng;

@Builder.Default
@Column(name = "heat_score", nullable = false)
private Integer heatScore = 0;

@Builder.Default
@Column(name = "live_user_count", nullable = false)
private Integer liveUserCount = 0;

@Builder.Default
@Column(name = "open_request_count", nullable = false)
private Integer openRequestCount = 0;

@Builder.Default
@Column(name = "heat_updated_at", nullable = false)
private Instant heatUpdatedAt = Instant.now();

@Builder.Default
@Enumerated(EnumType.STRING)
@Column(name = "status", nullable = false)
private BlockStatus status = BlockStatus.ACTIVE;

    @Column(name = "trial_expires_at")
    private Instant trialExpiresAt;

    @Column(name = "created_by_admin", nullable = false)
    private UUID createdByAdmin;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

  

    public enum BlockStatus { ACTIVE, INACTIVE, TRIAL }

    public String getHeatLevel() {
        if (heatScore >= 100) return "fire";
        if (heatScore >= 51)  return "hot";
        if (heatScore >= 21)  return "warm";
        if (heatScore >= 6)   return "mild";
        return "cold";
    }

  public enum BlockCategory { 
    CAMPUS, LOCALITY, SOCIETY, MARKET,VILLAGE;

    @com.fasterxml.jackson.annotation.JsonCreator
    public static BlockCategory fromString(String value) {
        if (value == null) return null;
        return BlockCategory.valueOf(value.toUpperCase());
    }
}
}