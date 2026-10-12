package com.example._justice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerCaseRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Enter a valid email")
    private String customerEmail;

    @NotBlank(message = "Case type is required")
    private String caseType;

    @NotBlank(message = "Case description is required")
    private String description;
}