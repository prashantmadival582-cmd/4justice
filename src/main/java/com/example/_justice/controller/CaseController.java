package com.example._justice.controller;

import com.example._justice.entity.Case;
import com.example._justice.service.CaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cases")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    // View all cases
    @GetMapping
    public ResponseEntity<List<Case>> getAllCases() {

        return ResponseEntity.ok(
                caseService.getAllCases()
        );
    }

    // Search case by Case ID
    @GetMapping("/{caseId}")
    public ResponseEntity<?> getCaseByCaseId(
            @PathVariable String caseId) {

        Case caseData =
                caseService.getCaseByCaseId(caseId);

        if (caseData == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(caseData);
    }

    // Update case status
    @PutMapping("/{caseId}/status")
    public ResponseEntity<?> updateCaseStatus(
            @PathVariable String caseId,
            @RequestParam String status) {

        Case updatedCase =
                caseService.updateCaseStatus(
                        caseId,
                        status
                );

        if (updatedCase == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(updatedCase);
    }
}