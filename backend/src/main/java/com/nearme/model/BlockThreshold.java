package com.nearme.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "block_thresholds")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlockThreshold {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Block.BlockCategory category;

    @Column(name = "threshold", nullable = false)
    private int threshold;

    @Column(name = "description", length = 300)
    private String description;
}