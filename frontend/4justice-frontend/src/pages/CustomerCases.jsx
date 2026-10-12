import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  customerRequest,
  downloadCustomerDocument,
  getCustomerJson,
  isCustomerAuthError,
} from "../api/customerApi";

const formatStatus = (status = "UNKNOWN") =>
  status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );

const statusClass = (status = "") => {
  const normalized = status.toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
  if (normalized.includes("review")) return "under-review";
  if (normalized.includes("progress")) return "in-progress";
  if (normalized.includes("complete")) return "completed";
  if (normalized.includes("submit") || normalized.includes("pending")) return "pending";
  return normalized;
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export function CustomerCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getCustomerJson("/api/cases/mine")
      .then((data) => {
        if (active) setCases(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (!active) return;
        if (isCustomerAuthError(requestError)) {
          navigate("/customer/login", { replace: true });
          return;
        }
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="customer-dashboard customer-cases-page">
      <CustomerPageHeader title="My Cases" />
      <section className="customer-dashboard-content">
        <div className="customer-page-heading">
          <div>
            <span className="customer-dashboard-badge">CASE OVERVIEW</span>
            <h1>Your Cases</h1>
            <p>Track the status and details of the cases you have submitted.</p>
          </div>
          <Link className="customer-primary-action" to="/customer/start-case">
            + Start a New Case
          </Link>
        </div>

        {loading && <p className="customer-page-message">Loading your cases...</p>}
        {error && <p className="customer-page-error" role="alert">{error}</p>}
        {!loading && !error && cases.length === 0 && (
          <div className="customer-empty-state">
            <span aria-hidden="true">📁</span>
            <h2>No cases yet</h2>
            <p>Your submitted cases will appear here with their latest status.</p>
            <Link className="customer-primary-action" to="/customer/start-case">
              Start your first case
            </Link>
          </div>
        )}
        {!loading && !error && cases.length > 0 && (
          <div className="customer-case-list">
            {cases.map((customerCase) => (
              <article className="customer-case-card" key={customerCase.caseId}>
                <div className="customer-case-card-top">
                  <div>
                    <span className="customer-case-label">CASE ID</span>
                    <strong className="customer-case-id">{customerCase.caseId}</strong>
                  </div>
                  <span className={`case-status ${statusClass(customerCase.status)}`}>
                    {formatStatus(customerCase.status)}
                  </span>
                </div>
                <h2>{customerCase.caseType}</h2>
                <p className="customer-case-description">{customerCase.description}</p>
                <div className="customer-case-card-bottom">
                  <span>Submitted {formatDate(customerCase.submittedAt)}</span>
                  <Link to={`/customer/my-cases/${encodeURIComponent(customerCase.caseId)}`}>
                    View case details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export function CustomerCaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [customerCase, setCustomerCase] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadedCaseId, setLoadedCaseId] = useState("");
  const loading = loadedCaseId !== caseId;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCase = async () => {
    const [caseInfo, caseDocuments] = await Promise.all([
      getCustomerJson(`/api/cases/mine/${encodeURIComponent(caseId)}`),
      getCustomerJson(
        `/api/customers/me/cases/${encodeURIComponent(caseId)}/documents`
      ),
    ]);
    setCustomerCase(caseInfo);
    setDocuments(Array.isArray(caseDocuments) ? caseDocuments : []);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      getCustomerJson(`/api/cases/mine/${encodeURIComponent(caseId)}`),
      getCustomerJson(
        `/api/customers/me/cases/${encodeURIComponent(caseId)}/documents`
      ),
    ])
      .then(([caseInfo, caseDocuments]) => {
        if (!active) return;
      setError("");
      setCustomerCase(caseInfo);
        setDocuments(Array.isArray(caseDocuments) ? caseDocuments : []);
      })
      .catch((requestError) => {
        if (!active) return;
        if (isCustomerAuthError(requestError)) {
          navigate("/customer/login", { replace: true });
          return;
        }
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoadedCaseId(caseId);
      });

    return () => {
      active = false;
    };
  }, [caseId, navigate]);

  const handleUpload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.caseDocument.files[0];
    if (!file) {
      setError("Select a document to upload.");
      return;
    }

    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ]);
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx", "png", "jpg", "jpeg"].includes(extension)) {
      setError("Upload a PDF, DOC, DOCX, PNG, JPG, or JPEG file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or less.");
      return;
    }
    if (file.type && !allowedTypes.has(file.type)) {
      setError("The selected file type is not supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await customerRequest(
        `/api/customers/me/cases/${encodeURIComponent(caseId)}/documents`,
        { method: "POST", body: formData }
      );
      form.reset();
      await loadCase();
      setNotice("Document uploaded successfully.");
    } catch (requestError) {
      if (isCustomerAuthError(requestError)) {
        navigate("/customer/login", { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (document) => {
    setBusy(true);
    setError("");
    try {
      const blob = await downloadCustomerDocument(document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      if (isCustomerAuthError(requestError)) {
        navigate("/customer/login", { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="customer-dashboard customer-cases-page">
      <CustomerPageHeader title="Case Details" />
      <section className="customer-dashboard-content">
        <Link className="customer-back-link" to="/customer/my-cases">
          ← Back to My Cases
        </Link>
        {loading && <p className="customer-page-message">Loading case details...</p>}
        {error && <p className="customer-page-error" role="alert">{error}</p>}
        {!loading && customerCase && (
          <div className="customer-detail-layout">
            <article className="customer-case-detail-card">
              <div className="customer-case-card-top">
                <div>
                  <span className="customer-case-label">CASE ID</span>
                  <strong className="customer-case-id">{customerCase.caseId}</strong>
                </div>
                <span className={`case-status ${customerCase.status?.toLowerCase().replaceAll("_", "-") || ""}`}>
                  {formatStatus(customerCase.status)}
                </span>
              </div>
              <h1>{customerCase.caseType}</h1>
              <p className="customer-case-date">
                Submitted {formatDate(customerCase.submittedAt)}
              </p>
              <div className="customer-case-description-panel">
                <h2>Case description</h2>
                <p>{customerCase.description}</p>
              </div>
              {customerCase.lawyerName && (
                <p className="customer-case-lawyer">
                  Assigned lawyer: <strong>{customerCase.lawyerName}</strong>
                </p>
              )}
            </article>

            <section className="customer-documents-card">
              <div className="customer-subsection-heading">
                <div>
                  <h2>Case documents</h2>
                  <p>PDF, DOC, DOCX, PNG or JPG up to 10 MB.</p>
                </div>
              </div>
              {documents.length === 0 ? (
                <p className="customer-page-message">No documents uploaded yet.</p>
              ) : (
                <ul className="customer-document-list">
                  {documents.map((document) => (
                    <li key={document.id}>
                      <span aria-hidden="true">📄</span>
                      <span className="customer-document-name">{document.fileName}</span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDownload(document)}
                      >
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <form className="customer-upload-form" onSubmit={handleUpload}>
                <label htmlFor="case-document">Add a document</label>
                <input
                  id="case-document"
                  name="caseDocument"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  disabled={busy}
                />
                <button type="submit" disabled={busy}>
                  {busy ? "Working..." : "Upload document"}
                </button>
              </form>
              {notice && <p className="customer-page-success" role="status">{notice}</p>}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export function CustomerPageHeader({ title }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await customerRequest("/api/customers/logout", { method: "POST" });
    } catch (error) {
      console.error("Customer logout failed:", error);
    } finally {
      ["customerId", "customerName", "customerEmail", "customerPhone"].forEach(
        (key) => localStorage.removeItem(key)
      );
      navigate("/customer/login", { replace: true });
    }
  };

  return (
    <header className="customer-dashboard-header">
      <Link to="/customer/dashboard" className="customer-dashboard-brand">
        <span aria-hidden="true">⚖️</span> 4Justice
      </Link>
      <div className="customer-header-actions">
        <span className="customer-header-label">{title}</span>
        <button
          type="button"
          className="customer-logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
