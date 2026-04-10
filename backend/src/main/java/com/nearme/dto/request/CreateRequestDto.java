package com.nearme.dto.request;

import com.nearme.model.Request;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CreateRequestDto {

    @NotNull
    private UUID blockId;

    @NotNull
    private Request.RequestType type;

    @NotBlank
    @Size(max = 150)
    private String title;

    @Size(max = 1000)
    private String description;

    private String imageUrl;

    @NotNull
    private Request.Visibility visibility;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @NotNull
    @Future
    private Instant expiryTime;

    private boolean anonymous = false;
}