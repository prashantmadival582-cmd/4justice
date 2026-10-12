package com.example._justice.controller;

import com.example._justice.dto.CustomerLoginRequest;
import com.example._justice.dto.CustomerLoginResponse;
import com.example._justice.dto.CustomerProfile;
import com.example._justice.dto.CustomerRegistrationRequest;
import com.example._justice.entity.Customer;
import com.example._justice.security.CustomerSession;
import com.example._justice.service.CustomerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(
            @Valid @RequestBody CustomerRegistrationRequest request) {
        try {
            Customer customer = customerService.registerCustomer(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CustomerProfile.from(customer));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(
            @Valid @RequestBody CustomerLoginRequest request,
            HttpServletRequest servletRequest) {
        Optional<Customer> authenticatedCustomer =
                customerService.authenticate(request);

        if (authenticatedCustomer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password."));
        }

        HttpSession existingSession = servletRequest.getSession(false);
        if (existingSession != null) {
            existingSession.invalidate();
        }

        HttpSession session = servletRequest.getSession(true);
        session.setAttribute(
                CustomerSession.CUSTOMER_ID,
                authenticatedCustomer.get().getId());

        return ResponseEntity.ok(new CustomerLoginResponse(
                "Login successful",
                CustomerProfile.from(authenticatedCustomer.get())));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentCustomer(HttpSession session) {
        Long customerId = CustomerSession.getCustomerId(session);
        if (customerId == null) {
            return unauthorized();
        }

        return customerService.findById(customerId)
                .<ResponseEntity<?>>map(customer ->
                        ResponseEntity.ok(CustomerProfile.from(customer)))
                .orElseGet(CustomerController::unauthorized);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    private static ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please sign in to continue."));
    }
}
