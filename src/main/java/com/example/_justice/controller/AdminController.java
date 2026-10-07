package com.example._justice.controller;

import com.example._justice.dto.AdminLoginRequest;
import com.example._justice.dto.AdminLoginResponse;
import com.example._justice.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody AdminLoginRequest request) {

        boolean success = adminService.login(request);

        if (!success) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        return ResponseEntity.ok(
                new AdminLoginResponse(
                        "Login successful"
                )
        );
    }
}