package com.example._justice.controller;

import com.example._justice.dto.PaymentRequest;
import com.example._justice.entity.Payment;
import com.example._justice.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @Valid @RequestBody PaymentRequest request) {

        try {
            Payment payment =
                    paymentService.createPayment(request);

            return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}