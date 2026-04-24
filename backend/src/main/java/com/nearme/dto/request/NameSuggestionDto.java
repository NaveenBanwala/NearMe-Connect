package com.nearme.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ============================================================
// NameSuggestionDto.java
// Request body for POST /api/clusters/:id/suggest-name
// Sent by a user inside an active cluster to suggest a name
// ============================================================

@Getter
@Setter
@NoArgsConstructor
public class NameSuggestionDto {

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String suggestedName;
}