package com.nearme.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;

import com.nearme.model.Request.RequestType;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;



@Entity
@Table(name = "requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "request_id", updatable = false, nullable = false)
    private UUID requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "block_id", nullable = true)
private Block block;

    @Enumerated(EnumType.STRING)
@JdbcTypeCode(SqlTypes.NAMED_ENUM)
@Column(name = "type", columnDefinition = "request_type", nullable = false)
private RequestType type;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
@JdbcTypeCode(SqlTypes.NAMED_ENUM)
@Column(name = "visibility", columnDefinition = "request_visibility", nullable = false)
private Visibility visibility = Visibility.STUDENTS_ONLY;

    // @Column(name = "latitude", nullable = false)
    // private Double latitude;

    // @Column(name = "longitude", nullable = false)
    // private Double longitude;

    // @Column(name = "geo_point", columnDefinition = "geometry(Point,4326)", nullable = false)
    // private Point geoPoint;
    @Column(name = "latitude")
private Double latitude;

@Column(name = "longitude")
private Double longitude;

@Column(name = "geo_point", columnDefinition = "geometry(Point,4326)")
private Point geoPoint;

    @Column(name = "expiry_time", nullable = false)
    private Instant expiryTime;

 @Enumerated(EnumType.STRING)
@JdbcTypeCode(SqlTypes.NAMED_ENUM)
@Column(name = "status", columnDefinition = "request_status", nullable = false)
private RequestStatus status = RequestStatus.OPEN;

    @Column(name = "is_anonymous", nullable = false)
    private boolean anonymous = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "cluster_id", nullable = true)
private ActivityCluster cluster;


    public enum RequestType { HELP, TALK, PLAY, FREE }

    public enum Visibility { STUDENTS_ONLY, PUBLIC }

    public enum RequestStatus { OPEN, ACCEPTED, CLOSED, EXPIRED }
}