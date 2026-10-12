
package com.example._justice.controller;

import com.example._justice.dto.AdminLoginRequest;
import com.example._justice.security.UserSession;
import com.example._justice.service.AdminService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

   
@PostMapping("/login")
public ResponseEntity<?> login(
        @RequestBody AdminLoginRequest request,
        HttpSession session) {

    boolean authenticated = adminService.login(request);

    if (!authenticated) {
        return ResponseEntity.status(401)
                .body(Map.of(
                        "message", "Invalid email or password."
                ));
    }

    session.setAttribute(UserSession.ROLE, UserSession.ADMIN);
    session.setMaxInactiveInterval(30 * 60);

    System.out.println("========== ADMIN LOGIN DEBUG ==========");
    System.out.println("Login session ID: " + session.getId());
    System.out.println("Login session role: " + UserSession.getRole(session));

    return ResponseEntity.ok(
            Map.of("message", "Admin login successful.")
    );
} 
}

