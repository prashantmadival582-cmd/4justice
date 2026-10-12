package com.example._justice.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._justice.repository.CaseRepository;
import com.example._justice.repository.LawyerRepository;
import com.example._justice.repository.PaymentRepository;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final CaseRepository caseRepository;
    private final LawyerRepository lawyerRepository;
    private final PaymentRepository paymentRepository;

    public DashboardController(
            CaseRepository caseRepository,
            LawyerRepository lawyerRepository,
            PaymentRepository paymentRepository) {

        this.caseRepository = caseRepository;
        this.lawyerRepository = lawyerRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardData() {

        long totalCases = caseRepository.count();

        long pendingCases =
                caseRepository.countByStatus("PENDING");

        long totalLawyers =
                lawyerRepository.count();

        long totalPayments =
                paymentRepository.count();

        Map<String, Object> dashboardData =
                new HashMap<>();

        dashboardData.put("totalCases", totalCases);
        dashboardData.put("pendingCases", pendingCases);
        dashboardData.put("totalLawyers", totalLawyers);
        dashboardData.put("totalPayments", totalPayments);

        return ResponseEntity.ok(dashboardData);
    }
}