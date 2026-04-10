package com.nearme.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * Spring Security's .cors(cors -> {}) looks for a CorsConfigurationSource bean.
     * Without this bean it falls back to a restrictive default → 401 on every
     * cross-origin request, even on permitAll() routes like /auth/send-otp.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setExposedHeaders(List.of("Authorization"));

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * CorsFilter wraps the same source so non-Security filters also respect CORS
     * (e.g. multipart upload endpoints, WebSocket handshake).
     */
    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter((UrlBasedCorsConfigurationSource) corsConfigurationSource());
    }
}