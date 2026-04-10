package com.nearme.config;

import com.nearme.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * IMPORTANT: server.servlet.context-path=/api is set in application.properties.
 * Spring Security evaluates paths WITHOUT the context-path prefix.
 * So /api/auth/send-otp is seen here as /auth/send-otp.
 * Never add /api prefix to matchers in this class.
 *
 * @Order(1) ensures this chain is evaluated before Spring Boot's
 * auto-configured default SecurityFilterChain (which requires auth for everything).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Order(1)
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Claim all requests — prevents the default chain from intercepting
            .securityMatcher("/**")
            .csrf(AbstractHttpConfigurer::disable)
            // Delegate CORS to CorsConfigurationSource bean in CorsConfig
            .cors(cors -> {})
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── OPTIONS preflight — must be first ───────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Auth endpoints — public, no token needed ─────────────────
                .requestMatchers(HttpMethod.POST, "/auth/send-otp").permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/verify-otp").permitAll()

                // ── Actuator ─────────────────────────────────────────────────
                .requestMatchers("/actuator/**").permitAll()

                // ── WebSocket handshake ──────────────────────────────────────
                .requestMatchers("/ws/**").permitAll()

                // ── Public read-only endpoints ───────────────────────────────
                .requestMatchers(HttpMethod.GET, "/blocks/nearby").permitAll()
                .requestMatchers(HttpMethod.GET, "/blocks/nearby/campus").permitAll()
                .requestMatchers(HttpMethod.GET, "/blocks/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/blocks/*/heat").permitAll()
                .requestMatchers(HttpMethod.GET, "/blocks/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/heat/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/users/*").permitAll()

                // ── Admin ────────────────────────────────────────────────────
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // ── Everything else needs a valid JWT ────────────────────────
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}