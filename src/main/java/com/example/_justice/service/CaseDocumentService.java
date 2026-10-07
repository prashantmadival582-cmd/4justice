package com.example._justice.service;

import com.example._justice.entity.CaseDocument;
import com.example._justice.repository.CaseDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class CaseDocumentService {

    private final CaseDocumentRepository caseDocumentRepository;

    private final String uploadDirectory = "uploads/cases/";

    public CaseDocumentService(
            CaseDocumentRepository caseDocumentRepository) {

        this.caseDocumentRepository = caseDocumentRepository;
    }

    public CaseDocument uploadDocument(
            String caseId,
            MultipartFile file) throws IOException {

        // Create upload folder if it does not exist
        Path uploadPath = Paths.get(uploadDirectory);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Create unique file name
        String fileName =
                System.currentTimeMillis() + "_" + file.getOriginalFilename();

        // Save file
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(
                file.getInputStream(),
                filePath
        );

        // Save document information in database
        CaseDocument document = new CaseDocument();

        document.setCaseId(caseId);
        document.setFileName(file.getOriginalFilename());
        document.setFileType(file.getContentType());
        document.setFilePath(filePath.toString());

        return caseDocumentRepository.save(document);
    }

    public List<CaseDocument> getDocumentsByCaseId(
            String caseId) {

        return caseDocumentRepository
                .findByCaseId(caseId);
    }


    public byte[] downloadDocument(Long documentId) throws IOException {

    CaseDocument document = caseDocumentRepository
            .findById(documentId)
            .orElse(null);

    if (document == null) {
        return null;
    }

    Path filePath = Paths.get(document.getFilePath());

    if (!Files.exists(filePath)) {
        return null;
    }

    return Files.readAllBytes(filePath);
}


public CaseDocument getDocumentById(Long documentId) {

    return caseDocumentRepository
            .findById(documentId)
            .orElse(null);
}
}