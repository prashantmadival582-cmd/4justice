package com.example._justice.dto;

import com.example._justice.entity.Lawyer;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LawyerResponse {

private Long id;
private String name;
private String email;
private String specialization;
private String phone;
private String availability;

public static LawyerResponse from(Lawyer lawyer) {
    return new LawyerResponse(
            lawyer.getId(),
            lawyer.getName(),
            lawyer.getEmail(),
            lawyer.getSpecialization(),
            lawyer.getPhone(),
            lawyer.getAvailability()
    );
}

}
