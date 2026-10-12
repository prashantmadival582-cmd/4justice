
package com.example._justice.controller;

import com.example._justice.dto.CustomerDocumentResponse;
import com.example._justice.security.UserSession;
import com.example._justice.service.CaseDocumentService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/documents")
public class AdminDocumentController {

    private final CaseDocumentService caseDocumentService;

    public AdminDocumentController(
            CaseDocumentService caseDocumentService) {
        this.caseDocumentService = caseDocumentService;
    }

    @GetMapping
    public ResponseEntity<?> getAllDocuments(HttpSession session) {

        String role = UserSession.getRole(session);

        System.out.println("========== ADMIN DOCUMENT DEBUG ==========");
        System.out.println("Documents session ID: " + session.getId());
        System.out.println("Documents session role: " + role);

        if (!UserSession.ADMIN.equals(role)) {
            System.out.println("Result: Admin access denied");

            return ResponseEntity.status(403).body(
                    Map.of(
                            "message", "Admin session required.",
                            "currentRole",
                            role == null ? "NO_SESSION_ROLE" : role
                    )
            );
        }

        System.out.println("Result: Admin access granted");

        List<CustomerDocumentResponse> documents =
                caseDocumentService.getAllDocuments()
                        .stream()
                        .map(CustomerDocumentResponse::from)
                        .toList();

        return ResponseEntity.ok(documents);
    }
}