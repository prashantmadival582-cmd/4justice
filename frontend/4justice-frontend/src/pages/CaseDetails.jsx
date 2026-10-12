
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../api/api";

function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  // Case details
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Case documents
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [downloadingDocumentId, setDownloadingDocumentId] =
    useState(null);
  const [viewingDocumentId, setViewingDocumentId] = useState(null);

  // Lawyer assignment
  const [lawyers, setLawyers] = useState([]);
  const [lawyersLoading, setLawyersLoading] = useState(true);
  const [lawyersError, setLawyersError] = useState("");
  const [selectedLawyerId, setSelectedLawyerId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState("");

  const statuses = [
    "PENDING",
    "IN_PROGRESS",
    "UNDER_REVIEW",
    "COMPLETED",
  ];

  // Load case information, documents, and lawyers
  useEffect(() => {
    if (!caseId) return;

    fetchCaseDetails();
    fetchDocuments();
    fetchLawyers();
  }, [caseId]);

  // Fetch case details
  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/cases/${encodeURIComponent(caseId)}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(`Failed to load case (${response.status})`);
      }

      const data = await response.json();

      setCaseData(data);
      setSelectedStatus(data.status || "PENDING");
    } catch (err) {
      console.error("Case details error:", err);
      setError(err.message || "Unable to load case details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents belonging to this case
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError("");

      const response = await fetch(
        `${API_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/documents`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch documents (${response.status})`
        );
      }

      const data = await response.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Documents error:", err);
      setDocumentsError(
        err.message || "Unable to load documents. Please try again."
      );
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Fetch registered lawyers
  const fetchLawyers = async () => {
    try {
      setLawyersLoading(true);
      setLawyersError("");

      const response = await fetch(
        `${API_BASE_URL}/api/lawyers`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(`Failed to load lawyers (${response.status})`);
      }

      const data = await response.json();
      setLawyers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lawyer loading error:", err);
      setLawyersError(
        err.message || "Unable to load lawyers. Please try again."
      );
    } finally {
      setLawyersLoading(false);
    }
  };

  // Update case status
  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/cases/${encodeURIComponent(caseId)}/status?status=${encodeURIComponent(selectedStatus)}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Failed to update status (${response.status})`
        );
      }

      const updatedCase = await response.json();

      setCaseData(updatedCase);
      setSelectedStatus(updatedCase.status || selectedStatus);
      setMessage("Case status updated successfully.");
    } catch (err) {
      console.error("Status update error:", err);
      setMessage(
        err.message || "Unable to update status. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Assign an available lawyer
  const handleAssignLawyer = async (e) => {
    e.preventDefault();

    if (!selectedLawyerId) {
      setAssignmentMessage("Please select a lawyer first.");
      return;
    }

    try {
      setAssigning(true);
      setAssignmentMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/cases/${encodeURIComponent(caseId)}/assign-lawyer/${encodeURIComponent(selectedLawyerId)}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Failed to assign lawyer (${response.status})`
        );
      }

      setAssignmentMessage("Lawyer assigned successfully.");
      setSelectedLawyerId("");

      await fetchCaseDetails();
      await fetchLawyers();
    } catch (err) {
      console.error("Lawyer assignment error:", err);
      setAssignmentMessage(
        err.message || "Unable to assign lawyer. Please try again."
      );
    } finally {
      setAssigning(false);
    }
  };

  // Download a case document
  const handleDownload = async (documentId, fileName) => {
    try {
      setDownloadingDocumentId(documentId);
      setDocumentsError("");

      const response = await fetch(
        `${API_BASE_URL}/api/cases/documents/${encodeURIComponent(documentId)}/download`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The downloaded file is empty.");
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = fileName || "case-document";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (err) {
      console.error("Download error:", err);
      setDocumentsError(
        err.message || "Unable to download this document."
      );
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  // View a case document in a new tab
  const handleViewDocument = async (documentId) => {
    // Open the tab immediately to reduce the chance of popup blocking.
    const newTab = window.open("about:blank", "_blank");

    if (!newTab) {
      setDocumentsError(
        "Your browser blocked the new tab. Please allow pop-ups and try again."
      );
      return;
    }

    try {
      setViewingDocumentId(documentId);
      setDocumentsError("");

      const response = await fetch(
        `${API_BASE_URL}/api/cases/documents/${encodeURIComponent(documentId)}/download`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(`Unable to open document (${response.status})`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The document is empty.");
      }

      // Use the response content type when available.
      const contentType =
        response.headers.get("content-type") || blob.type;

      const viewableBlob = new Blob([blob], {
        type: contentType || "application/octet-stream",
      });

      const documentUrl = window.URL.createObjectURL(viewableBlob);

      newTab.location.href = documentUrl;

      // Keep the URL alive while the document is open.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(documentUrl);
      }, 5 * 60 * 1000);
    } catch (err) {
      console.error("View document error:", err);
      newTab.close();

      setDocumentsError(
        err.message || "Unable to view this document."
      );
    } finally {
      setViewingDocumentId(null);
    }
  };

  // Status badge styling
  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "case-status pending";
      case "IN_PROGRESS":
        return "case-status progress";
      case "UNDER_REVIEW":
        return "case-status review";
      case "COMPLETED":
        return "case-status completed";
      default:
        return "case-status";
    }
  };

  const formatStatus = (status) =>
    status?.replaceAll("_", " ") || "Unknown";

  // Only AVAILABLE lawyers can be assigned
  const availableLawyers = lawyers.filter(
    (lawyer) =>
      lawyer.availability?.toUpperCase() === "AVAILABLE"
  );

  // Loading screen
  if (loading) {
    return (
      <section className="case-details-page">
        <div className="case-details-loading">
          Loading case details...
        </div>
      </section>
    );
  }

  // Error screen
  if (error || !caseData) {
    return (
      <section className="case-details-page">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/admin/cases")}
        >
          ← Back to Cases
        </button>

        <div className="case-details-error" role="alert">
          {error || "Case not found."}

          <button
            type="button"
            className="view-case-button"
            onClick={fetchCaseDetails}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="case-details-page">
      {/* Page Header */}
      <div className="case-details-header">
        <div>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/admin/cases")}
          >
            ← Back to Cases
          </button>

          <h1>Case Details</h1>
          <p>View and manage this customer case.</p>
        </div>

        <div className="case-details-id">
          <span>Case ID</span>
          <strong>{caseData.caseId}</strong>
        </div>
      </div>

      {/* Current Status */}
      <div className="case-details-status-card">
        <div>
          <span className="details-label">Current Status</span>
          <span className={getStatusClass(caseData.status)}>
            {formatStatus(caseData.status)}
          </span>
        </div>
      </div>

      {/* Update Status */}
      <div className="details-card">
        <div className="details-card-header">
          <h2>Update Case Status</h2>
        </div>

        <form onSubmit={handleStatusUpdate}>
          <div className="login-field">
            <label htmlFor="case-status">Select New Status</label>

            <select
              id="case-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setMessage("");
              }}
              disabled={saving}
              required
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <p role="status" className="status-update-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={saving || selectedStatus === caseData.status}
          >
            {saving ? "Saving..." : "Save Status"}
          </button>
        </form>
      </div>

      {/* Customer Information */}
      <div className="details-card">
        <div className="details-card-header">
          <h2>Customer Information</h2>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span>Name</span>
            <strong>{caseData.customerName || "Not provided"}</strong>
          </div>

          <div className="detail-item">
            <span>Email</span>
            <strong>{caseData.customerEmail || "Not provided"}</strong>
          </div>
        </div>
      </div>

      {/* Case Information */}
      <div className="details-card">
        <div className="details-card-header">
          <h2>Case Information</h2>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span>Case Type</span>
            <strong>{caseData.caseType || "Not specified"}</strong>
          </div>

          <div className="detail-item">
            <span>Assigned Lawyer</span>
            <strong>{caseData.lawyer?.name || "Not Assigned"}</strong>
          </div>
        </div>

        <div className="case-description">
          <span>Description</span>
          <p>{caseData.description || "No description provided."}</p>
        </div>
      </div>

      {/* Assign Lawyer */}
      <div className="details-card">
        <div className="details-card-header">
          <h2>Assign Lawyer</h2>
          <span>{availableLawyers.length} available</span>
        </div>

        {caseData.lawyer && (
          <p>
            Currently assigned to:{" "}
            <strong>{caseData.lawyer.name}</strong>
          </p>
        )}

        {lawyersLoading && <p>Loading available lawyers...</p>}

        {!lawyersLoading && lawyersError && (
          <div>
            <p role="alert">{lawyersError}</p>

            <button
              type="button"
              className="view-case-button"
              onClick={fetchLawyers}
            >
              Retry
            </button>
          </div>
        )}

        {!lawyersLoading && !lawyersError && (
          <form onSubmit={handleAssignLawyer}>
            <div className="login-field">
              <label htmlFor="assign-lawyer">
                Select an Available Lawyer
              </label>

              <select
                id="assign-lawyer"
                value={selectedLawyerId}
                onChange={(e) => {
                  setSelectedLawyerId(e.target.value);
                  setAssignmentMessage("");
                }}
                disabled={availableLawyers.length === 0 || assigning}
                required
              >
                <option value="">Choose a lawyer</option>

                {availableLawyers.map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name} —{" "}
                    {lawyer.specialization || "General"}
                  </option>
                ))}
              </select>
            </div>

            {availableLawyers.length === 0 && (
              <p>No available lawyers at the moment.</p>
            )}

            {assignmentMessage && (
              <p role="status" className="status-update-message">
                {assignmentMessage}
              </p>
            )}

            <button
              type="submit"
              className="admin-login-button"
              disabled={assigning || availableLawyers.length === 0}
            >
              {assigning ? "Assigning..." : "Assign Lawyer"}
            </button>
          </form>
        )}
      </div>

      {/* Case Documents */}
      <div className="details-card">
        <div className="details-card-header">
          <h2>Case Documents</h2>
          <span>{documents.length} file(s)</span>
        </div>

        {documentsLoading && <p>Loading documents...</p>}

        {!documentsLoading && documentsError && (
          <div>
            <p role="alert">{documentsError}</p>

            <button
              type="button"
              className="view-case-button"
              onClick={fetchDocuments}
            >
              Retry Loading Documents
            </button>
          </div>
        )}

        {!documentsLoading &&
          !documentsError &&
          documents.length === 0 && (
            <p>No documents have been uploaded for this case.</p>
          )}

        {!documentsLoading &&
          !documentsError &&
          documents.length > 0 && (
            <div className="case-documents-list">
              {documents.map((document) => (
                <div className="case-document-item" key={document.id}>
                  <div className="case-document-info">
                    <span className="case-document-icon">📄</span>

                    <div>
                      <strong>
                        {document.fileName || "Unnamed document"}
                      </strong>
                      <span>{document.fileType || "File"}</span>
                    </div>
                  </div>

                  <div className="case-document-actions">
                    <button
                      type="button"
                      className="view-case-button"
                      disabled={
                        downloadingDocumentId === document.id ||
                        viewingDocumentId === document.id
                      }
                      onClick={() => handleViewDocument(document.id)}
                    >
                      {viewingDocumentId === document.id
                        ? "Opening..."
                        : "View Document"}
                    </button>

                    <button
                      type="button"
                      className="view-case-button"
                      disabled={
                        downloadingDocumentId === document.id ||
                        viewingDocumentId === document.id
                      }
                      onClick={() =>
                        handleDownload(document.id, document.fileName)
                      }
                    >
                      {downloadingDocumentId === document.id
                        ? "Downloading..."
                        : "Download"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}

export default CaseDetails;