
package com.example._justice.controller;

import com.example._justice.dto.LawyerLoginRequest;
import com.example._justice.dto.LawyerRequest;
import com.example._justice.dto.LawyerResponse;
import com.example._justice.security.UserSession;
import com.example._justice.entity.Case;
import com.example._justice.entity.Lawyer;
import com.example._justice.service.CaseService;
import com.example._justice.service.LawyerService;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lawyers")
public class LawyerController {

    private final LawyerService lawyerService;
    private final CaseService caseService;

    public LawyerController(
            LawyerService lawyerService,
            CaseService caseService) {
        this.lawyerService = lawyerService;
        this.caseService = caseService;
    }

    // Register a lawyer
    @PostMapping("/register")
    public ResponseEntity<?> registerLawyer(
            @Valid @RequestBody LawyerRequest request) {
        try {
            Lawyer lawyer = lawyerService.addLawyer(request);
            return ResponseEntity.ok(LawyerResponse.from(lawyer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lawyer login
    @PostMapping("/login")
    public ResponseEntity<?> loginLawyer(
            @Valid @RequestBody LawyerLoginRequest request,
            HttpServletRequest servletRequest) {
        try {
            Lawyer lawyer = lawyerService.loginLawyer(
                    request.getEmail(),
                    request.getPassword());

            HttpSession existingSession =
                    servletRequest.getSession(false);

            if (existingSession != null) {
                existingSession.invalidate();
            }

            HttpSession session = servletRequest.getSession(true);

            UserSession.start(session, UserSession.LAWYER);
            session.setAttribute(
                    UserSession.LAWYER_ID,
                    lawyer.getId());

            session.setMaxInactiveInterval(30 * 60);

            return ResponseEntity.ok(LawyerResponse.from(lawyer));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lawyer logout
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.noContent().build();
    }

    // Get all lawyers
    // Keep this endpoint for the existing admin assignment workflow.
    @GetMapping
    public ResponseEntity<List<LawyerResponse>> getAllLawyers() {
        List<LawyerResponse> lawyers =
                lawyerService.getAllLawyers()
                        .stream()
                        .map(LawyerResponse::from)
                        .toList();

        return ResponseEntity.ok(lawyers);
    }

    // Get lawyer details
    @GetMapping("/{id}")
    public ResponseEntity<?> getLawyerById(
            @PathVariable Long id,
            HttpSession session) {

        String role = UserSession.getRole(session);
        Long loggedInLawyerId = getLoggedInLawyerId(session);

        // A lawyer can access only their own details.
        // Admin can access lawyer details for administration.
        if (UserSession.LAWYER.equals(role)
                && !id.equals(loggedInLawyerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message",
                            "You cannot access another lawyer's details."));
        }

        if (!UserSession.LAWYER.equals(role)
                && !UserSession.ADMIN.equals(role)) {
            return unauthorized();
        }

        Lawyer lawyer = lawyerService.getLawyerById(id);

        if (lawyer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(LawyerResponse.from(lawyer));
    }

    // Update lawyer details
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLawyer(
            @PathVariable Long id,
            @RequestBody LawyerRequest request,
            HttpSession session) {

        String role = UserSession.getRole(session);
        Long loggedInLawyerId = getLoggedInLawyerId(session);

        // Only admin can update lawyer profile details.
        if (!UserSession.ADMIN.equals(role)) {
            return unauthorized();
        }

        try {
            Lawyer lawyer = lawyerService.updateLawyer(id, request);

            if (lawyer == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(LawyerResponse.from(lawyer));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update the logged-in lawyer's availability
    @PutMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long id,
            @RequestParam String status,
            HttpSession session) {

        String role = UserSession.getRole(session);
        Long loggedInLawyerId = getLoggedInLawyerId(session);

        if (!UserSession.LAWYER.equals(role)
                || loggedInLawyerId == null) {
            return unauthorized();
        }

        // Prevent a lawyer from changing another lawyer's availability.
        if (!id.equals(loggedInLawyerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message",
                            "You can update only your own availability."));
        }

        try {
            Lawyer lawyer =
                    lawyerService.updateAvailability(id, status);

            if (lawyer == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(LawyerResponse.from(lawyer));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get only the cases assigned to the logged-in lawyer
    @GetMapping("/my-cases")
    public ResponseEntity<?> getMyCases(HttpSession session) {

        String role = UserSession.getRole(session);
        Long lawyerId = getLoggedInLawyerId(session);

        if (!UserSession.LAWYER.equals(role) || lawyerId == null) {
            return unauthorized();
        }

        List<Case> assignedCases =
                caseService.getCasesForLawyer(lawyerId);

        return ResponseEntity.ok(assignedCases);
    }

    // Update the status of a case assigned to the logged-in lawyer
    @PutMapping("/cases/{caseId}/status")
    public ResponseEntity<?> updateCaseStatus(
            @PathVariable String caseId,
            @RequestParam String status,
            HttpSession session) {

        String role = UserSession.getRole(session);
        Long lawyerId = getLoggedInLawyerId(session);

        if (!UserSession.LAWYER.equals(role) || lawyerId == null) {
            return unauthorized();
        }

        try {
            // Use the lawyer ID from the authenticated session,
            // never from a request parameter.
            Case updatedCase = caseService.updateCaseStatusByLawyer(
                    caseId,
                    lawyerId,
                    status);

            if (updatedCase == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(updatedCase);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Shared session helper
    private Long getLoggedInLawyerId(HttpSession session) {
        if (session == null) {
            return null;
        }

        Object id = session.getAttribute(UserSession.LAWYER_ID);

        if (id instanceof Long) {
            return (Long) id;
        }

        if (id instanceof Number) {
            return ((Number) id).longValue();
        }

        return null;
    }

    private ResponseEntity<Map<String, String>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message",
                        "Please log in with the appropriate account."));
    }
}
