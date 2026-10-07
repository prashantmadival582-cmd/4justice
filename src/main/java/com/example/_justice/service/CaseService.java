package com.example._justice.service;

import com.example._justice.dto.CustomerCaseRequest;
import com.example._justice.entity.Case;
import com.example._justice.repository.CaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CaseService {

    private final CaseRepository caseRepository;

    public CaseService(CaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    // Customer submits a new case
    public Case submitCase(CustomerCaseRequest request) {

        Case newCase = new Case();

        newCase.setCustomerName(request.getCustomerName());
        newCase.setCustomerEmail(request.getCustomerEmail());
        newCase.setCaseType(request.getCaseType());
        newCase.setDescription(request.getDescription());

        // Generate unique Case ID
        newCase.setCaseId(
                "CASE-" + System.currentTimeMillis()
        );

        // Initial status
        newCase.setStatus("PENDING");

        return caseRepository.save(newCase);
    }

    // Admin can view all cases
    public List<Case> getAllCases() {
        return caseRepository.findAll();
    }

    // Admin can search by Case ID
    public Case getCaseByCaseId(String caseId) {
        return caseRepository
                .findByCaseId(caseId)
                .orElse(null);
    }

    // Admin can update case status
    public Case updateCaseStatus(
            String caseId,
            String status) {

        Case existingCase = caseRepository
                .findByCaseId(caseId)
                .orElse(null);

        if (existingCase == null) {
            return null;
        }

        existingCase.setStatus(status);

        return caseRepository.save(existingCase);
    }
}