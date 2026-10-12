package com.example._justice.dto;

public record CustomerLoginResponse(
        String message,
        CustomerProfile customer) {
}