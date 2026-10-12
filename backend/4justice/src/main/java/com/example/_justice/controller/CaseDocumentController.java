
package com.example._justice.controller;

import com.example._justice.dto.CustomerDocumentResponse;
import com.example._justice.entity.Case;
import com.example._justice.entity.CaseDocument;
import com.example._justice.security.CustomerSession;
import com.example._justice.security.UserSession;
import com.example._justice.service.CaseDocumentService;
import com.example._justice.service.CaseService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class CaseDocumentController {

    private final CaseDocumentService caseDocumentService;
    private final CaseService caseService;

    public CaseDocumentController(
            CaseDocumentService caseDocumentService,
            CaseService caseService) {
        this.caseDocumentService = caseDocumentService;
        this.caseService = caseService;
    }

    // Upload a document
    @PostMapping("/{caseId}/documents")
    public ResponseEntity<?> uploadDocument(
            @PathVariable String caseId,
            @RequestParam("file") MultipartFile file,
            HttpSession session) {

        if (!canAccessCase(caseId, session)) {
            return ResponseEntity.notFound().build();
        }

        try {
            CaseDocument document =
                    caseDocumentService.uploadDocument(caseId, file);

            return ResponseEntity.ok(
                    CustomerDocumentResponse.from(document));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "File upload failed."));
        }
    }

    // Get documents for a case
    @GetMapping("/{caseId}/documents")
    public ResponseEntity<?> getDocuments(
            @PathVariable String caseId,
            HttpSession session) {

        if (!canAccessCase(caseId, session)) {
            return ResponseEntity.notFound().build();
        }

        List<CustomerDocumentResponse> documents =
                caseDocumentService.getDocumentsByCaseId(caseId)
                        .stream()
                        .map(CustomerDocumentResponse::from)
                        .toList();

        return ResponseEntity.ok(documents);
    }

    // Download a document
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<?> downloadDocument(
            @PathVariable Long documentId,
            HttpSession session) {

        try {
            CaseDocument document =
                    caseDocumentService.getDocumentById(documentId);

            if (document == null
                    || !canAccessCase(document.getCaseId(), session)) {
                return ResponseEntity.notFound().build();
            }

            byte[] file =
                    caseDocumentService.downloadDocument(documentId);

            if (file == null) {
                return ResponseEntity.notFound().build();
            }

            String safeFileName = document.getFileName()
                    .replace("\"", "")
                    .replace("\r", "")
                    .replace("\n", "");

            MediaType mediaType;

            try {
                mediaType = MediaType.parseMediaType(
                        document.getFileType());
            } catch (Exception e) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + safeFileName + "\"")
                    .contentType(mediaType)
                    .body(file);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "File download failed."));
        }
    }

    // Check whether the current user can access this case
    private boolean canAccessCase(
            String caseId,
            HttpSession session) {

        String role = UserSession.getRole(session);

        Case customerCase = caseService.getCaseByCaseId(caseId);

        if (customerCase == null) {
            return false;
        }

        // Admin can access any existing case
        if (UserSession.ADMIN.equals(role)) {
            return true;
        }

        // Customer can access their own case
        Long customerId = CustomerSession.getCustomerId(session);

        if (customerId != null
                && customerCase.getCustomer() != null
                && customerId.equals(
                        customerCase.getCustomer().getId())) {
            return true;
        }

        // Lawyer can access their assigned cases
        Long lawyerId = UserSession.getLawyerId(session);

        return UserSession.LAWYER.equals(role)
                && lawyerId != null
                && customerCase.getLawyer() != null
                && lawyerId.equals(
                        customerCase.getLawyer().getId());
    }
}