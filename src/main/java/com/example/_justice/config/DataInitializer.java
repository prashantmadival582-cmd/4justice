package com.example._justice.config;

import com.example._justice.entity.Admin;
import com.example._justice.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createAdmin(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (adminRepository.findByEmail("admin@gmail.com").isEmpty()) {

                Admin admin = Admin.builder()
                        .name("Admin")
                        .email("admin@gmail.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role("ADMIN")
                        .build();

                adminRepository.save(admin);

                System.out.println("Admin created successfully!");
            }
        };
    }
}