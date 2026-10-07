package com.example._justice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "case_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String caseId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private String filePath;
}