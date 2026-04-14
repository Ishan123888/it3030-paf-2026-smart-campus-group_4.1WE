package com.sliit.paf.backend;

import com.sliit.paf.backend.models.User;
import com.sliit.paf.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class BackendApplication {

    private static final Logger log = LoggerFactory.getLogger(BackendApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    ApplicationRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            log.info("🚀 Checking admin user...");
            var existing = userRepository.findByEmail("admin@smartcampus.com");

            if (existing.isEmpty()) {
                User admin = new User();
                admin.setName("System Administrator");
                admin.setEmail("admin@smartcampus.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRoles(new HashSet<>(Set.of("ROLE_ADMIN", "ROLE_USER")));
                admin.setProvider("local");
                admin.setCreatedAt(LocalDateTime.now());
                admin.setLastLogin(LocalDateTime.now());
                admin.setActive(true);
                userRepository.save(admin);
                log.info("✅ Admin created — admin@smartcampus.com / admin123");
            } else {
                User admin = existing.get();
                boolean updated = false;

                if (admin.getPassword() == null || admin.getPassword().isBlank()) {
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    updated = true;
                    log.info("✅ Admin password was missing — reset to admin123");
                }

                if (admin.getRoles() == null || !admin.getRoles().contains("ROLE_ADMIN")) {
                    Set<String> roles = new HashSet<>(admin.getRoles() != null ? admin.getRoles() : Set.of());
                    roles.add("ROLE_ADMIN");
                    roles.add("ROLE_USER");
                    admin.setRoles(roles);
                    updated = true;
                    log.info("✅ Admin roles fixed");
                }

                if (updated) userRepository.save(admin);
                else log.info("ℹ️  Admin already configured correctly");
            }
        };
    }
}
