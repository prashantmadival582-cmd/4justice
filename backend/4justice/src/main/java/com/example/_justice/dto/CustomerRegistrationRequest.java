package com.example._justice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomerRegistrationRequest {

    @NotBlank(message = "Customer name is required")
    private String name;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Customer phone is required")
    private String phone;

    @NotBlank(message = "Customer password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}