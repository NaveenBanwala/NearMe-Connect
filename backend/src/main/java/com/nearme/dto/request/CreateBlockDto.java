package com.nearme.dto.request;

import com.nearme.model.Block;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateBlockDto {

    @NotNull
    private UUID clusterId;         // the approved vote cluster

    @NotBlank
    private String name;

    @NotNull
    private Block.BlockCategory category;

    @NotNull
    private String boundaryGeoJson; // GeoJSON polygon string from admin boundary drawer

    @NotNull
    private Double centerLat;

    @Nullable
private UUID sourceClusterId;

    @NotNull
    private Double centerLng;

    private String adminNotes;
}