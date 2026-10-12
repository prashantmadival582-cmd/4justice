package com.example._justice.repository;

import com.example._justice.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface CaseRepository extends JpaRepository<Case, Long> {

    Optional<Case> findByCaseId(String caseId);
    Optional<Case> findByCaseIdAndCustomer_Id(String caseId, Long customerId);
    List<Case> findByCustomer_IdOrderBySubmittedAtDesc(Long customerId);
    long countByStatus(String status);
}