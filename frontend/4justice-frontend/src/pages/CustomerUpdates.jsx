import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCustomerJson, isCustomerAuthError } from "../api/customerApi";
import { CustomerPageHeader } from "./CustomerCases";

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

export default function CustomerUpdates() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
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
  }, [navigate, refreshKey]);

  return (
    <main className="customer-dashboard customer-cases-page">
      <CustomerPageHeader title="Case Updates" />
      <section className="customer-dashboard-content">
        <div className="customer-page-heading">
          <div>
            <span className="customer-dashboard-badge">LATEST ACTIVITY</span>
            <h1>Case Updates</h1>
            <p>Check the latest status for each of your cases.</p>
          </div>
          <button
            type="button"
            className="customer-logout-button"
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            Refresh
          </button>
        </div>
        {loading && <p className="customer-page-message">Loading your updates...</p>}
        {error && <p className="customer-page-error" role="alert">{error}</p>}
        {!loading && !error && cases.length === 0 && (
          <div className="customer-empty-state">
            <span aria-hidden="true">🔔</span>
            <h2>No updates yet</h2>
            <p>Updates will appear after you submit a case.</p>
          </div>
        )}
        {!loading && cases.length > 0 && (
          <div className="customer-case-list">
            {cases.map((customerCase) => (
              <article className="customer-update-card" key={customerCase.caseId}>
                <div className="customer-update-icon" aria-hidden="true">🔔</div>
                <div>
                  <span className={`case-status ${statusClass(customerCase.status)}`}>
                    {formatStatus(customerCase.status)}
                  </span>
                  <h2>{customerCase.caseType}</h2>
                  <p>Case {customerCase.caseId} has status: {formatStatus(customerCase.status)}.</p>
                  <Link to={`/customer/my-cases/${encodeURIComponent(customerCase.caseId)}`}>
                    View case →
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
