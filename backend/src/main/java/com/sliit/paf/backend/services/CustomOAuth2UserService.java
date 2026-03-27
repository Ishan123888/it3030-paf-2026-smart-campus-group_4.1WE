package com.sliit.paf.backend.services;

import com.sliit.paf.backend.models.User;
import com.sliit.paf.backend.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    // ADMIN ලෙස පත් කළ යුතු ඊමේල් ලිපිනය
    private static final String ADMIN_EMAIL = "ishandilhara57@gmail.com";

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String googleId = (String) attributes.get("sub");

        // 1. පරිශීලකයා දැනටමත් DB එකේ ඉන්නවාදැයි පරීක්ෂා කිරීම හෝ අලුතින් සෑදීම
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User(email, name, picture, googleId);
            
            // හැමෝටම ලැබෙන පොදු ROLE_USER එක
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");

            // ✅ ඔබගේ ඊමේල් එක නම් පමණක් ROLE_ADMIN එකතු කිරීම
            if (ADMIN_EMAIL.equalsIgnoreCase(email)) {
                roles.add("ROLE_ADMIN");
            }
            
            newUser.setRoles(roles);
            return userRepository.save(newUser);
        });

        // 2. දැනටමත් ඉන්න User කෙනෙක් නම්, ඔහුගේ තොරතුරු Update කිරීම (Profile updates)
        user.setLastLogin(LocalDateTime.now());
        user.setName(name);
        user.setPicture(picture);
        
        // පවතින User කෙනෙක් වුවත්, පසුව ADMIN_EMAIL එකට එකතු කළහොත් ADMIN බලතල ලැබීමට මෙතනත් පරීක්ෂා කළ හැක
        if (ADMIN_EMAIL.equalsIgnoreCase(email) && !user.getRoles().contains("ROLE_ADMIN")) {
            user.getRoles().add("ROLE_ADMIN");
        }
        
        userRepository.save(user);

        // 3. Spring Security Authorities සෑදීම
        Set<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());

        return new DefaultOAuth2User(authorities, attributes, "email");
    }
}