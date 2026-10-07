package com.example._justice.service;

import com.example._justice.dto.AdminLoginRequest;
import com.example._justice.entity.Admin;
import com.example._justice.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder) {

        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean login(AdminLoginRequest request) {

        Admin admin = adminRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        if (admin == null) {
            return false;
        }

        return passwordEncoder.matches(
                request.getPassword(),
                admin.getPassword()
        );
    }
}