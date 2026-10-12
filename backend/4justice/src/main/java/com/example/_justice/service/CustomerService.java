
package com.example._justice.service;

import com.example._justice.dto.CustomerLoginRequest;
import com.example._justice.dto.CustomerRegistrationRequest;
import com.example._justice.entity.Customer;
import com.example._justice.repository.CustomerRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder) {

        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Customer Registration
    public Customer registerCustomer(
            CustomerRegistrationRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (customerRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException(
                    "Email is already registered");
        }

        Customer customer = new Customer();

        customer.setName(request.getName());
        customer.setEmail(email);
        customer.setPhone(request.getPhone());

        // Store encrypted password
        customer.setPassword(
                passwordEncoder.encode(request.getPassword()));

        return customerRepository.save(customer);
    }

    // Customer Login
    public Optional<Customer> authenticate(
            CustomerLoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        Customer customer = customerRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        if (customer == null) {
            return Optional.empty();
        }

        return passwordEncoder.matches(request.getPassword(), customer.getPassword())
                ? Optional.of(customer)
                : Optional.empty();
    }

    public Optional<Customer> findById(Long customerId) {
        return customerRepository.findById(customerId);
    }
}
