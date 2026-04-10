package com.nearme.service;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class TwilioService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhone;

    // Twilio Verify Service SID — create one in Twilio Console > Verify > Services
    @Value("${twilio.verify-service-sid:}")
    private String verifyServiceSid;

    private boolean enabled = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isBlank()
                && !accountSid.equals("DUMMY")) {
            Twilio.init(accountSid, authToken);
            enabled = true;
            log.info("Twilio initialized");
        } else {
            log.warn("Twilio not configured — OTPs will be logged to console (dev mode)");
        }
    }

    public void sendOtp(String phone) {
        if (!enabled) {
            // Dev mode — log OTP so you can test without Twilio
            log.info("DEV OTP for {}: 123456", phone);
            return;
        }
        Verification.creator(verifyServiceSid, phone, "sms").create();
        log.info("OTP sent to {}", phone);
    }

    public boolean verifyOtp(String phone, String code) {
        if (!enabled) {
            // Dev mode — accept 123456 as valid OTP
            return "123456".equals(code);
        }
        try {
            VerificationCheck check = VerificationCheck.creator(verifyServiceSid)
                .setTo(phone)
                .setCode(code)
                .create();
            return "approved".equalsIgnoreCase(check.getStatus());
        } catch (Exception e) {
            log.warn("OTP verification failed for {}: {}", phone, e.getMessage());
            return false;
        }
    }
}