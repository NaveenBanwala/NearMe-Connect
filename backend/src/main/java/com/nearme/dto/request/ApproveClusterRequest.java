package com.nearme.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ApproveClusterRequest {

    @NotNull
    private UUID clusterId;

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @NotNull
    private Double centerLat;

    @NotNull
    private Double centerLng;

    // Array of {lat, lng} points from BoundaryDrawer — nullable if suggested boundary used
    private List<BoundaryPoint> boundaryGeoJson;

    @Data
    public static class BoundaryPoint {
        private Double lat;
        private Double lng;
    }
}