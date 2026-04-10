package com.nearme.security;

import com.nearme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    



    @Override
public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
    var user = userRepository.findById(UUID.fromString(userId))
        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

    // Determine role — admin first, then student, then local
    String role;
    if (user.isAdmin())           role = "ROLE_ADMIN";
    else if (user.isStudentVerified()) role = "ROLE_STUDENT";
    else                               role = "ROLE_LOCAL";

    return new org.springframework.security.core.userdetails.User(
        user.getUserId().toString(),
        "",
        List.of(new SimpleGrantedAuthority(role))
    );
}
}

