import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  downloadCustomerDocument,
  getCustomerJson,
  isCustomerAuthError,
} from "../api/customerApi";
import { CustomerPageHeader } from "./CustomerCases";

export default function CustomerDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getCustomerJson("/api/customers/me/documents")
      .then((data) => {
        if (active) setDocuments(Array.isArray(data) ? data : []);
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

  const handleDownload = async (document) => {
    setError("");
    try {
      const blob = await downloadCustomerDocument(document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      if (isCustomerAuthError(downloadError)) {
        navigate("/customer/login", { replace: true });
        return;
      }
      setError(downloadError.message);
    }
  };

  return (
    <main className="customer-dashboard customer-cases-page">
      <CustomerPageHeader title="My Documents" />
      <section className="customer-dashboard-content">
        <div className="customer-page-heading">
          <div>
            <span className="customer-dashboard-badge">YOUR FILES</span>
            <h1>My Documents</h1>
            <p>Documents attached to your submitted cases.</p>
          </div>
        </div>
        {loading && <p className="customer-page-message">Loading your documents...</p>}
        {error && <p className="customer-page-error" role="alert">{error}</p>}
        {!loading && !error && documents.length === 0 && (
          <div className="customer-empty-state">
            <span aria-hidden="true">📄</span>
            <h2>No documents yet</h2>
            <p>When you upload a file to one of your cases, it will appear here.</p>
          </div>
        )}
        {!loading && documents.length > 0 && (
          <div className="customer-documents-card">
            <ul className="customer-document-list">
              {documents.map((document) => (
                <li key={document.id}>
                  <span aria-hidden="true">📄</span>
                  <div className="customer-document-name">
                    <strong>{document.fileName}</strong>
                    <span>Case {document.caseId}</span>
                  </div>
                  <button type="button" onClick={() => handleDownload(document)}>
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
