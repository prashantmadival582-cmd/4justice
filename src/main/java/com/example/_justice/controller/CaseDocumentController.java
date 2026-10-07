package com.example._justice.controller;



import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.example._justice.entity.CaseDocument;
import com.example._justice.service.CaseDocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
public class CaseDocumentController {

    private final CaseDocumentService caseDocumentService;

    public CaseDocumentController(
            CaseDocumentService caseDocumentService) {

        this.caseDocumentService = caseDocumentService;
    }

    // Upload document for a case
    @PostMapping("/{caseId}/documents")
    public ResponseEntity<?> uploadDocument(
            @PathVariable String caseId,
            @RequestParam("file") MultipartFile file) {

        try {

            if (file.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Please select a file");
            }

            CaseDocument document =
                    caseDocumentService.uploadDocument(
                            caseId,
                            file
                    );

            return ResponseEntity.ok(document);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body("File upload failed");
        }
    }

    // Get all documents for a case
    @GetMapping("/{caseId}/documents")
    public ResponseEntity<List<CaseDocument>> getDocuments(
            @PathVariable String caseId) {

        return ResponseEntity.ok(
                caseDocumentService
                        .getDocumentsByCaseId(caseId)
        );
    }


    // Download document
@GetMapping("/documents/{documentId}/download")
public ResponseEntity<?> downloadDocument(
        @PathVariable Long documentId) {

    try {

        CaseDocument document =
                caseDocumentService.getDocumentById(documentId);

        if (document == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        byte[] file =
                caseDocumentService.downloadDocument(documentId);

        if (file == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                document.getFileName() + "\""
                )
                .contentType(
                        MediaType.parseMediaType(
                                document.getFileType()
                        )
                )
                .body(file);

    } catch (IOException e) {

        return ResponseEntity
                .internalServerError()
                .body("File download failed");
    }
}
}