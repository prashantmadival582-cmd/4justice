package com.example._justice.dto;

import com.example._justice.entity.Case;
import java.time.LocalDateTime;

public record CustomerCaseResponse(
        String caseId,
        String caseType,
        String description,
        String status,
        LocalDateTime submittedAt,
        String lawyerName) {

    public static CustomerCaseResponse from(Case customerCase) {
        return new CustomerCaseResponse(
                customerCase.getCaseId(),
                customerCase.getCaseType(),
                customerCase.getDescription(),
                customerCase.getStatus(),
                customerCase.getSubmittedAt(),
                customerCase.getLawyer() == null
                        ? null
                        : customerCase.getLawyer().getName());
    }
}
