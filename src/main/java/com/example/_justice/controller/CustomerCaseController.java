package com.example._justice.controller;

import com.example._justice.dto.CustomerCaseRequest;
import com.example._justice.entity.Case;
import com.example._justice.service.CaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cases")
public class CustomerCaseController {

    private final CaseService caseService;

    public CustomerCaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @PostMapping
    public ResponseEntity<Case> submitCase(
            @Valid @RequestBody CustomerCaseRequest request) {

        Case savedCase = caseService.submitCase(request);

        return ResponseEntity.ok(savedCase);
    }
}