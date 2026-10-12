package com.example._justice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotBlank(message = "Case ID is required")
    private String caseId;

    @NotNull(message = "Amount is required")
    private Double amount;
}