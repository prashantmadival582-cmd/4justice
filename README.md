# 4Justice - Legal Case Management System

4Justice is a backend application for managing legal cases, customers, lawyers, and case documents.

## Technologies Used

- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- MySQL
- Spring Security
- Maven
- Postman

## Current Features

### Admin
- Admin login
- View all cases
- Search case using Case ID
- Update case status

### Case Management
- Customer can submit a case
- Automatically generates a unique Case ID
- View case details
- Update case status

### Document Management
- Upload case documents
- View documents
- Download documents
- Documents are stored using Case ID

## API Endpoints

### Admin Login


POST /Submit Case
POST /api/cases
Get All Cases
GET /api/admin/cases
Get Case
GET /api/admin/cases/{caseId}
Update Case Status
PUT /api/admin/cases/{caseId}/status
Upload Document
POST /api/cases/{caseId}/documents
View Documents
GET /api/cases/{caseId}/documents
Download Document
GET /api/cases/documents/{documentId}/download
Database

MySQL database:

4justice_db

Main tables:

admins
cases
case_documents
How to Run
Start MySQL.
Configure MySQL username and password in application.properties.
Run the Spring Boot application.
The application runs on:
http://localhost:8081
Testing

All current APIs have been tested using Postman.


Prashant S Madival

GitHub: https://github.com/prashantmadival582-c
