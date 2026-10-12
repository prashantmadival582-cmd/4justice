
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8081";

function LawyerDashboard() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState("BUSY");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [documentsByCase, setDocumentsByCase] = useState({});
  const [expandedCase, setExpandedCase] = useState(null);
  const [documentLoadingCase, setDocumentLoadingCase] = useState(null);
  const [documentErrors, setDocumentErrors] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [updatingCaseId, setUpdatingCaseId] = useState(null);

  let lawyer = null;

  try {
    const storedLawyer = localStorage.getItem("loggedInLawyer");
    lawyer = storedLawyer ? JSON.parse(storedLawyer) : null;
  } catch {
    localStorage.removeItem("loggedInLawyer");
  }

  const lawyerId = lawyer?.id;

  useEffect(() => {
    if (!lawyerId) {
      navigate("/lawyer/login");
      return;
    }

    const fetchLawyerData = async () => {
      try {
        setLoading(true);
        setError("");

        const lawyerResponse = await fetch(
          `${API_BASE_URL}/api/lawyers/${lawyerId}`,
          { credentials: "include" }
        );

        if (!lawyerResponse.ok) {
          throw new Error(
            lawyerResponse.status === 401
              ? "Your session has expired. Please log in again."
              : "Unable to fetch lawyer details."
          );
        }

        const lawyerData = await lawyerResponse.json();
        setAvailability(lawyerData.availability || "BUSY");

        // Fetch only cases assigned to the authenticated lawyer.
        const casesResponse = await fetch(
          `${API_BASE_URL}/api/lawyers/my-cases`,
          { credentials: "include" }
        );

        if (!casesResponse.ok) {
          throw new Error(
            casesResponse.status === 401
              ? "Your lawyer session is not valid. Please log in again."
              : "Unable to fetch assigned cases."
          );
        }

        const assignedCases = await casesResponse.json();
        setCases(Array.isArray(assignedCases) ? assignedCases : []);
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerData();
  }, [lawyerId, navigate]);

  const updateAvailability = async (status) => {
    try {
      setAvailabilityLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/lawyers/${lawyerId}/availability?status=${encodeURIComponent(status)}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.text()) || "Failed to update availability."
        );
      }

      const updatedLawyer = await response.json();
      setAvailability(updatedLawyer.availability || status);
    } catch (err) {
      alert(err.message || "Unable to update availability.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const updateStatus = async (caseId, status) => {
    try {
      setUpdatingCaseId(caseId);

      const response = await fetch(
        `${API_BASE_URL}/api/lawyers/cases/${encodeURIComponent(caseId)}/status?status=${encodeURIComponent(status)}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.text()) || "Failed to update case status."
        );
      }

      const updatedCase = await response.json();

      setCases((previousCases) =>
        previousCases.map((item) =>
          item.caseId === caseId
            ? { ...item, status: updatedCase.status || status }
            : item
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update case status.");
    } finally {
      setUpdatingCaseId(null);
    }
  };

  const fetchCaseDocuments = async (caseId) => {
    try {
      setDocumentLoadingCase(caseId);

      setDocumentErrors((previous) => ({
        ...previous,
        [caseId]: "",
      }));

      const response = await fetch(
        `${API_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/documents`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Documents are unavailable or you do not have access to this case."
            : `Unable to load documents (${response.status}).`
        );
      }

      const data = await response.json();

      setDocumentsByCase((previous) => ({
        ...previous,
        [caseId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      setDocumentErrors((previous) => ({
        ...previous,
        [caseId]: err.message || "Unable to load documents.",
      }));
    } finally {
      setDocumentLoadingCase(null);
    }
  };

  const toggleDocuments = async (caseId) => {
    if (expandedCase === caseId) {
      setExpandedCase(null);
      return;
    }

    setExpandedCase(caseId);

    if (!Object.prototype.hasOwnProperty.call(documentsByCase, caseId)) {
      await fetchCaseDocuments(caseId);
    }
  };

  const getDocumentBlob = async (documentId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/cases/documents/${encodeURIComponent(documentId)}/download`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error(`Document request failed (${response.status}).`);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error("The document is empty.");
    }

    return blob;
  };

  const handleDownload = async (document) => {
    try {
      setDownloadingId(document.id);

      const blob = await getDocumentBlob(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = documentElementLink(url, document.fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert(err.message || "Unable to download the document.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewDocument = async (document) => {
    const newTab = window.open("about:blank", "_blank");

    if (!newTab) {
      alert("Your browser blocked the new tab. Allow pop-ups and try again.");
      return;
    }

    try {
      setViewingId(document.id);

      const blob = await getDocumentBlob(document.id);
      const url = window.URL.createObjectURL(blob);

      newTab.location.href = url;

      // Keep the URL available while the document is being viewed.
      window.setTimeout(() => window.URL.revokeObjectURL(url), 5 * 60 * 1000);
    } catch (err) {
      newTab.close();
      alert(err.message || "Unable to view the document.");
    } finally {
      setViewingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/lawyers/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("loggedInLawyer");
      navigate("/lawyer/login");
    }
  };

  const totalCases = cases.length;

  const activeCases = cases.filter((item) =>
    ["IN_PROGRESS", "UNDER_REVIEW", "PENDING"].includes(item.status)
  ).length;

  const completedCases = cases.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  const formatStatus = (status) =>
    status?.replaceAll("_", " ") || "Unknown";

  const getStatusClass = (status) =>
    `case-status ${status?.toLowerCase().replaceAll("_", "-") || ""}`;

  return (
    <main className="lawyer-dashboard">
      <header className="lawyer-dashboard-header">
        <div className="lawyer-dashboard-title-area">
          <div className="lawyer-header-badge">Lawyer Workspace</div>
          <h1>Lawyer Dashboard</h1>

          <p className="lawyer-dashboard-welcome">
            {lawyer?.name || lawyer?.email || "Counsel"}
          </p>

          <p className="lawyer-dashboard-subtitle">
            Manage your assigned cases, review customer documents, and update
            case progress.
          </p>
        </div>

        <div className="lawyer-dashboard-actions">
          <button
            type="button"
            className="lawyer-dashboard-secondary"
            onClick={() => navigate("/")}
          >
            ← Home
          </button>

          <button
            type="button"
            className="lawyer-dashboard-logout"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>

      <section className="lawyer-stats-grid">
        <div className="lawyer-stat-card">
          <div className="lawyer-stat-icon total">📂</div>
          <div className="lawyer-stat-details">
            <span className="lawyer-stat-label">Assigned Cases</span>
            <span className="lawyer-stat-val">
              {loading ? "-" : totalCases}
            </span>
          </div>
        </div>

        <div className="lawyer-stat-card">
          <div className="lawyer-stat-icon active">⚖️</div>
          <div className="lawyer-stat-details">
            <span className="lawyer-stat-label">Active / In Progress</span>
            <span className="lawyer-stat-val">
              {loading ? "-" : activeCases}
            </span>
          </div>
        </div>

        <div className="lawyer-stat-card">
          <div className="lawyer-stat-icon completed">✅</div>
          <div className="lawyer-stat-details">
            <span className="lawyer-stat-label">Resolved Cases</span>
            <span className="lawyer-stat-val">
              {loading ? "-" : completedCases}
            </span>
          </div>
        </div>

        <div className="lawyer-stat-card availability-stat">
          <div className="lawyer-stat-icon status-icon">
            <span
              className={`lawyer-pulse-dot ${availability?.toLowerCase()}`}
            />
          </div>

          <div className="lawyer-stat-details">
            <span className="lawyer-stat-label">Current Status</span>
            <span
              className={`lawyer-stat-val status-text ${availability?.toLowerCase()}`}
            >
              {availability === "AVAILABLE"
                ? "Available for Cases"
                : "Busy"}
            </span>
          </div>
        </div>
      </section>

      <section className="lawyer-availability-card">
        <div className="lawyer-card-lead">
          <div className="lawyer-card-icon">⚡</div>
          <div>
            <h2>Availability Status</h2>
            <p>Choose whether you can accept new case allocations.</p>
          </div>
        </div>

        <div className="lawyer-availability-control">
          <label htmlFor="availability">Accepting Cases</label>

          <div className="lawyer-select-wrapper">
            <select
              id="availability"
              value={availability}
              onChange={(event) => updateAvailability(event.target.value)}
              disabled={availabilityLoading || loading}
              className={`lawyer-status-select ${availability?.toLowerCase()}`}
            >
              <option value="AVAILABLE">🟢 Available</option>
              <option value="BUSY">🔴 Busy</option>
            </select>
          </div>

          {availabilityLoading && (
            <span className="lawyer-dashboard-updating">
              <span className="lawyer-spinner" /> Saving...
            </span>
          )}
        </div>
      </section>

      <section className="lawyer-cases-card">
        <div className="lawyer-cases-header">
          <div>
            <h2>Assigned Cases &amp; Matters</h2>
            <p>
              Review case details, access documents, and update case progress.
            </p>
          </div>

          <div className="lawyer-cases-count-badge">
            {cases.length} {cases.length === 1 ? "case" : "cases"}
          </div>
        </div>

        {loading && (
          <p className="lawyer-dashboard-message" role="status">
            Loading assigned cases...
          </p>
        )}

        {error && (
          <div className="lawyer-dashboard-message lawyer-dashboard-error">
            <p role="alert">{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload Dashboard
            </button>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <p className="lawyer-dashboard-message">
            No cases are currently assigned to you.
          </p>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="lawyer-cases-table-wrapper">
            <table className="lawyer-cases-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Customer</th>
                  <th>Case Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th>Documents</th>
                </tr>
              </thead>

              <tbody>
                {cases.map((item) => (
                  <tr key={item.caseId}>
                    <td className="lawyer-case-id">{item.caseId}</td>
                    <td>{item.customerName || "Not provided"}</td>
                    <td>{item.caseType || "Not specified"}</td>
                    <td className="lawyer-case-description">
                      {item.description || "No description"}
                    </td>

                    <td>
                      <span className={getStatusClass(item.status)}>
                        {formatStatus(item.status)}
                      </span>
                    </td>

                    <td>
                      <select
                        value={item.status || "PENDING"}
                        disabled={updatingCaseId === item.caseId}
                        onChange={(event) =>
                          updateStatus(item.caseId, event.target.value)
                        }
                        aria-label={`Update status for case ${item.caseId}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>

                      {updatingCaseId === item.caseId && (
                        <small>Saving...</small>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="view-case-button"
                        onClick={() => toggleDocuments(item.caseId)}
                        disabled={documentLoadingCase === item.caseId}
                      >
                        {documentLoadingCase === item.caseId
                          ? "Loading..."
                          : expandedCase === item.caseId
                            ? "Hide Documents"
                            : "View Documents"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {expandedCase && (
          <section className="details-card lawyer-case-documents">
            <div className="details-card-header">
              <h2>Case Documents</h2>
              <strong>{expandedCase}</strong>
            </div>

            {documentLoadingCase === expandedCase && (
              <p>Loading documents...</p>
            )}

            {documentErrors[expandedCase] && (
              <div role="alert">
                <p>{documentErrors[expandedCase]}</p>
                <button
                  type="button"
                  className="view-case-button"
                  onClick={() => fetchCaseDocuments(expandedCase)}
                >
                  Retry
                </button>
              </div>
            )}

            {!documentLoadingCase &&
              !documentErrors[expandedCase] &&
              (documentsByCase[expandedCase] || []).length === 0 && (
                <p>No documents have been uploaded for this case.</p>
              )}

            {!documentLoadingCase &&
              !documentErrors[expandedCase] &&
              (documentsByCase[expandedCase] || []).map((document) => (
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
                        downloadingId === document.id ||
                        viewingId === document.id
                      }
                      onClick={() => handleViewDocument(document)}
                    >
                      {viewingId === document.id
                        ? "Opening..."
                        : "View Document"}
                    </button>

                    <button
                      type="button"
                      className="view-case-button"
                      disabled={
                        downloadingId === document.id ||
                        viewingId === document.id
                      }
                      onClick={() => handleDownload(document)}
                    >
                      {downloadingId === document.id
                        ? "Downloading..."
                        : "Download"}
                    </button>
                  </div>
                </div>
              ))}
          </section>
        )}
      </section>
    </main>
  );
}

// Create a download link for a document.
function documentElementLink(url, fileName) {
  const link = window.document.createElement("a");
  link.href = url;
  link.download = fileName || "case-document";
  return link;
}

export default LawyerDashboard;
