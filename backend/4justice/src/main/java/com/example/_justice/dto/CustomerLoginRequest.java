package com.example._justice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerLoginRequest {

    @NotBlank(message = "Customer email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Customer password is required")
    private String password;
}