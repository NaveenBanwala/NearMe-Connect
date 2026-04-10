package com.nearme.dto.request;

import com.nearme.model.Block;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VoteRequestDto {

    @NotBlank
    private String suggestedName;

    @NotNull
    private Double userLat;

    @NotNull
    private Double userLng;

    @NotNull
    private Block.BlockCategory category;
}