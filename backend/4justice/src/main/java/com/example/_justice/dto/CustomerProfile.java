package com.example._justice.dto;

import com.example._justice.entity.Customer;

public record CustomerProfile(
        Long id,
        String name,
        String email,
        String phone) {

    public static CustomerProfile from(Customer customer) {
        return new CustomerProfile(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone());
    }
}
