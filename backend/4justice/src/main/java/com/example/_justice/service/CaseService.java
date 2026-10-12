package com.example._justice.service;

import com.example._justice.dto.CustomerCaseRequest;
import com.example._justice.entity.Case;
import com.example._justice.entity.Lawyer;
import com.example._justice.repository.CaseRepository;
import com.example._justice.repository.LawyerRepository;
import org.springframework.stereotype.Service;

import com.example._justice.repository.CustomerRepository;

    import com.example._justice.entity.Customer;

import java.util.List;
import java.util.Optional;

@Service
public class CaseService {

    private final CaseRepository caseRepository;
    private final LawyerRepository lawyerRepository;

    private final CustomerRepository customerRepository;

   public CaseService(
        CaseRepository caseRepository,
        LawyerRepository lawyerRepository,
        CustomerRepository customerRepository) {

    this.caseRepository = caseRepository;
    this.lawyerRepository = lawyerRepository;
    this.customerRepository = customerRepository;
}

    // Customer submits a new case
    
// Customer submits a new case

// Customer submits a new case

public Case submitCase(CustomerCaseRequest request, Long customerId) {
    Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("Customer account not found."));

    Case newCase = new Case();
    newCase.setCustomerName(customer.getName());
    newCase.setCustomerEmail(customer.getEmail());
    newCase.setCaseType(request.getCaseType());
    newCase.setDescription(request.getDescription());
    newCase.setCaseId(generateCaseId());
    newCase.setStatus("PENDING");
    newCase.setCustomer(customer);

    return caseRepository.save(newCase);
}

private String generateCaseId() {
    String caseId;
    do {
        caseId = "CASE-" + java.util.UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    } while (caseRepository.findByCaseId(caseId).isPresent());
    return caseId;
}

public List<Case> getCasesForCustomer(Long customerId) {
    return caseRepository.findByCustomer_IdOrderBySubmittedAtDesc(customerId);
}

public Optional<Case> getCaseForCustomer(String caseId, Long customerId) {
    return caseRepository.findByCaseIdAndCustomer_Id(caseId, customerId);
}

    // Admin can view all cases
    public List<Case> getAllCases() {
        return caseRepository.findAll();
    }

    // Admin can search by Case ID
    public Case getCaseByCaseId(String caseId) {
        return caseRepository
                .findByCaseId(caseId)
                .orElse(null);
    }

    // Admin can update case status
    public Case updateCaseStatus(
            String caseId,
            String status) {

        Case existingCase = caseRepository
                .findByCaseId(caseId)
                .orElse(null);

        if (existingCase == null) {
            return null;
        }

        existingCase.setStatus(status);

        return caseRepository.save(existingCase);
    }

 // Admin assigns Lawyer to Case
public Case assignLawyer(
        String caseId,
        Long lawyerId) {

    // Find Case
    Case existingCase = caseRepository
            .findByCaseId(caseId)
            .orElse(null);

    if (existingCase == null) {
        return null;
    }

    // Find Lawyer
    Lawyer lawyer = lawyerRepository
            .findById(lawyerId)
            .orElse(null);

    if (lawyer == null) {
        return null;
    }

    // Check Lawyer Availability
    if (!"AVAILABLE".equalsIgnoreCase(
            lawyer.getAvailability())) {

        throw new RuntimeException(
                "Lawyer is currently busy"
        );
    }

    // Assign Lawyer to Case
    existingCase.setLawyer(lawyer);

    // Make Lawyer BUSY
    lawyer.setAvailability("BUSY");
    lawyerRepository.save(lawyer);

    // Save updated Case
    return caseRepository.save(existingCase);
}

// Lawyer updates assigned Case status
public Case updateCaseStatusByLawyer(
        String caseId,
        Long lawyerId,
        String status) {

    // Find Case
    Case existingCase = caseRepository
            .findByCaseId(caseId)
            .orElse(null);

    if (existingCase == null) {
        return null;
    }

    // Check assigned Lawyer
    Lawyer assignedLawyer = existingCase.getLawyer();

    if (assignedLawyer == null) {
        throw new RuntimeException(
                "No lawyer is assigned to this case"
        );
    }

    // Check whether this lawyer is assigned to the case
    if (!assignedLawyer.getId().equals(lawyerId)) {
        throw new RuntimeException(
                "This lawyer is not assigned to this case"
        );
    }

    // Update Case status
    existingCase.setStatus(status);

    return caseRepository.save(existingCase);
}

// Get cases assigned to a specific lawyer
public List<Case> getCasesForLawyer(Long lawyerId) {
    return caseRepository.findAll()
            .stream()
            .filter(item -> item.getLawyer() != null
                    && lawyerId.equals(item.getLawyer().getId()))
            .toList();
}

}