package com.example._justice.dto;

import com.example._justice.entity.CaseDocument;

public record CustomerDocumentResponse(
        Long id,
        String caseId,
        String fileName,
        String fileType) {

    public static CustomerDocumentResponse from(
            CaseDocument document) {

        return new CustomerDocumentResponse(
                document.getId(),
                document.getCaseId(),
                document.getFileName(),
                document.getFileType()
        );
    }
}