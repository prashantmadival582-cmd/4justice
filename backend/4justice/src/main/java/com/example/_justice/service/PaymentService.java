package com.example._justice.service;

import com.example._justice.dto.PaymentRequest;
import com.example._justice.entity.Case;
import com.example._justice.entity.Payment;
import com.example._justice.repository.CaseRepository;
import com.example._justice.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CaseRepository caseRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            CaseRepository caseRepository) {

        this.paymentRepository = paymentRepository;
        this.caseRepository = caseRepository;
    }

    public Payment createPayment(PaymentRequest request) {

        Case existingCase = caseRepository
                .findByCaseId(request.getCaseId())
                .orElseThrow(() ->
                        new RuntimeException("Case not found"));

        if (paymentRepository
                .findByCaseId(request.getCaseId())
                .isPresent()) {

            throw new RuntimeException(
                    "Payment already created for this case"
            );
        }

        Payment payment = new Payment();

        payment.setPaymentId(
                "PAY-" + UUID.randomUUID()
        );

        payment.setCaseId(existingCase.getCaseId());

        payment.setCustomerEmail(
                existingCase.getCustomerEmail()
        );

        payment.setAmount(request.getAmount());

        payment.setStatus("PENDING");

        return paymentRepository.save(payment);
    }
}