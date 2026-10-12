
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/api";

function AdminCases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyers, setSelectedLawyers] = useState({});
  const [assigningCase, setAssigningCase] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCases();
    fetchLawyers();
  }, []);

  // Fetch all cases using the admin session.
  const fetchCases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/cases`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Admin access denied. Please log in again."
            : `Failed to fetch cases (${response.status}).`
        );
      }

      const data = await response.json();
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Cases error:", err);
      setError(err.message || "Unable to load cases from the server.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch lawyers using the current session.
  const fetchLawyers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lawyers`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch lawyers (${response.status}).`
        );
      }

      const data = await response.json();
      setLawyers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lawyers error:", err);
      setMessage(
        err.message || "Unable to load lawyers. Please refresh the page."
      );
      setMessageType("error");
    }
  };

  // Only available lawyers can be assigned.
  const availableLawyers = lawyers.filter(
    (lawyer) =>
      lawyer.availability?.toUpperCase() === "AVAILABLE"
  );

  // Assign an available lawyer to a case.
  const handleAssignLawyer = async (item) => {
    const lawyerId = selectedLawyers[item.caseId];

    if (!lawyerId) {
      setMessage("Please select a lawyer first.");
      setMessageType("error");
      return;
    }

    try {
      setAssigningCase(item.caseId);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/cases/${encodeURIComponent(
          item.caseId
        )}/assign-lawyer/${encodeURIComponent(lawyerId)}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || `Failed to assign lawyer (${response.status}).`
        );
      }

      setMessage(`Lawyer assigned successfully to ${item.caseId}.`);
      setMessageType("success");

      await fetchCases();
      await fetchLawyers();

      setSelectedLawyers((previous) => ({
        ...previous,
        [item.caseId]: "",
      }));
    } catch (err) {
      console.error("Assign lawyer error:", err);
      setMessage(err.message || "Unable to assign lawyer.");
      setMessageType("error");
    } finally {
      setAssigningCase("");
    }
  };

  // Search cases by case ID, customer, case type, status, or lawyer.
  const filteredCases = cases.filter((item) => {
    const value = search.toLowerCase().trim();

    return (
      item.caseId?.toLowerCase().includes(value) ||
      item.customerName?.toLowerCase().includes(value) ||
      item.caseType?.toLowerCase().includes(value) ||
      item.status?.toLowerCase().includes(value) ||
      item.lawyer?.name?.toLowerCase().includes(value)
    );
  });

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

  return (
    <section className="cases-page">
      <div className="cases-page-header">
        <div>
          <h1>Cases</h1>
          <p>Manage cases and assign available lawyers.</p>
        </div>

        <div className="case-summary">
          <span>Total Cases</span>
          <strong>{cases.length}</strong>
        </div>
      </div>

      {message && (
        <div
          role={messageType === "error" ? "alert" : "status"}
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            background:
              messageType === "success" ? "#e8f7ed" : "#fff0f0",
            color:
              messageType === "success" ? "#176534" : "#a12626",
          }}
        >
          {message}
        </div>
      )}

      <div className="cases-card">
        <div className="cases-toolbar">
          <div className="cases-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search by case ID, customer, lawyer or case type..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="filter-button"
            onClick={() => {
              fetchCases();
              fetchLawyers();
            }}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {loading && (
          <div className="no-cases" role="status">
            Loading cases...
          </div>
        )}

        {error && !loading && (
          <div className="no-cases" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="view-case-button"
              onClick={fetchCases}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="cases-table-wrapper">
            <table className="cases-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Customer</th>
                  <th>Case Type</th>
                  <th>Assigned Lawyer</th>
                  <th>Status</th>
                  <th>Assign Lawyer</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCases.length > 0 ? (
                  filteredCases.map((item) => (
                    <tr key={item.caseId}>
                      <td>
                        <span className="admin-case-id">
                          {item.caseId}
                        </span>
                      </td>

                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {item.customerName
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <strong>
                              {item.customerName || "Unknown customer"}
                            </strong>
                            <span>{item.customerEmail || "No email"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="case-type">
                          {item.caseType || "Not specified"}
                        </span>
                      </td>

                      <td>
                        <span className="lawyer-name">
                          {item.lawyer?.name || "Not Assigned"}
                        </span>
                      </td>

                      <td>
                        <span className={getStatusClass(item.status)}>
                          {formatStatus(item.status)}
                        </span>
                      </td>

                      <td>
                        {item.lawyer ? (
                          <span>Already assigned</span>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              minWidth: "170px",
                            }}
                          >
                            <select
                              aria-label={`Select lawyer for ${item.caseId}`}
                              value={selectedLawyers[item.caseId] || ""}
                              onChange={(event) =>
                                setSelectedLawyers((previous) => ({
                                  ...previous,
                                  [item.caseId]: event.target.value,
                                }))
                              }
                              disabled={assigningCase === item.caseId}
                              style={{
                                padding: "9px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                maxWidth: "220px",
                              }}
                            >
                              <option value="">
                                Select available lawyer
                              </option>

                              {availableLawyers.map((lawyer) => (
                                <option
                                  key={lawyer.id}
                                  value={lawyer.id}
                                >
                                  {lawyer.name}
                                  {lawyer.specialization
                                    ? ` — ${lawyer.specialization}`
                                    : ""}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="view-case-button"
                              disabled={
                                !selectedLawyers[item.caseId] ||
                                assigningCase === item.caseId
                              }
                              onClick={() => handleAssignLawyer(item)}
                            >
                              {assigningCase === item.caseId
                                ? "Assigning..."
                                : "Assign"}
                            </button>

                            {availableLawyers.length === 0 && (
                              <small>No available lawyers</small>
                            )}
                          </div>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="view-case-button"
                          onClick={() =>
                            navigate(
                              `/admin/cases/${encodeURIComponent(
                                item.caseId
                              )}`
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="no-cases">
                        {search
                          ? "No cases match your search."
                          : "No cases found."}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminCases;
