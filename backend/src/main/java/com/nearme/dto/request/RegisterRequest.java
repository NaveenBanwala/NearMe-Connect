package com.nearme.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Pattern(regexp = "^\\+?[1-9]\\d{6,14}$", message = "Invalid phone number")
    private String phone;

    @NotBlank
    private String code;        // OTP code from Twilio / Firebase

    private String name;        // optional on first verify, required on profile update
    private String fcmToken;    // Firebase Cloud Messaging token
}