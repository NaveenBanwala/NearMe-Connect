package com.nearme.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-key}")
    private String serviceAccountKey;

    @Value("${firebase.database-url}")
    private String databaseUrl;

    @PostConstruct
    public void initFirebase() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) return;

            InputStream serviceAccount;

            // Try classpath first, then file path
            serviceAccount = getClass().getClassLoader()
                .getResourceAsStream(serviceAccountKey);

            if (serviceAccount == null) {
                serviceAccount = new FileInputStream(serviceAccountKey);
            }

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setDatabaseUrl(databaseUrl)
                .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase initialized successfully");

        } catch (IOException e) {
            log.warn("Firebase initialization failed: {}. FCM notifications disabled.", e.getMessage());
        }
    }
}