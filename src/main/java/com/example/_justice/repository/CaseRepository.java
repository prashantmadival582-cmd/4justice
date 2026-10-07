package com.example._justice.repository;

import com.example._justice.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CaseRepository extends JpaRepository<Case, Long> {

    Optional<Case> findByCaseId(String caseId);
}