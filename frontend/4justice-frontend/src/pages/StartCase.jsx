import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  customerRequest,
  getCustomerJson,
  isCustomerAuthError,
} from "../api/customerApi";

export default function StartCase() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    caseType: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [createdCase, setCreatedCase] = useState(null);

  useEffect(() => {
    let active = true;
    getCustomerJson("/api/customers/me")
      .then((customer) => {
        if (!active) return;
        setFormData((current) => ({
          ...current,
          customerName: customer.name || "",
          customerEmail: customer.email || "",
        }));
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        if (isCustomerAuthError(requestError)) {
          navigate("/customer/login", { replace: true });
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCreatedCase(null);
    setLoading(true);
    try {
      const response = await customerRequest("/api/cases", {
        method: "POST",
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          caseType: formData.caseType,
          description: formData.description,
        }),
      });
      setCreatedCase(await response.json());
    } catch (requestError) {
      setError(requestError.message || "Unable to submit your case.");
      if (isCustomerAuthError(requestError)) {
        navigate("/customer/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  if (createdCase) {
    return (
      <main className="start-case-page">
        <section className="start-case-card case-success">
          <div className="case-success-icon" aria-hidden="true">✓</div>
          <h1>Case Submitted Successfully!</h1>
          <p>Your legal case has been submitted for review.</p>
          <div className="created-case-details">
            <span>Case ID</span>
            <strong>{createdCase.caseId}</strong>
            <span>Current Status</span>
            <strong>{createdCase.status || "SUBMITTED"}</strong>
          </div>
          <button type="button" onClick={() => navigate("/customer/my-cases")}>
            View My Cases
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="start-case-page">
      <section className="start-case-card">
        <Link to="/customer/dashboard" className="start-case-brand">
          ⚖️ 4Justice
        </Link>
        <h1>Start a New Case</h1>
        <p className="start-case-subtitle">
          Provide your details and explain the legal assistance you need.
        </p>
        {error && <div className="start-case-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="customerName">Full Name</label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            autoComplete="name"
            value={formData.customerName}
            onChange={handleChange}
            readOnly
            required
          />
          <label htmlFor="customerEmail">Registered Email</label>
          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            autoComplete="email"
            value={formData.customerEmail}
            onChange={handleChange}
            readOnly
            required
          />
          <label htmlFor="caseType">Case Type</label>
          <select
            id="caseType"
            name="caseType"
            value={formData.caseType}
            onChange={handleChange}
            required
          >
            <option value="">Select a case type</option>
            <option value="Family Law">Family Law</option>
            <option value="Property Dispute">Property Dispute</option>
            <option value="Criminal Law">Criminal Law</option>
            <option value="Employment Law">Employment Law</option>
            <option value="Business Law">Business Law</option>
            <option value="Consumer Complaint">Consumer Complaint</option>
            <option value="Other">Other</option>
          </select>
          <label htmlFor="description">Case Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Briefly explain your legal issue..."
            value={formData.description}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading || checkingSession}>
            {checkingSession
              ? "Checking your session..."
              : loading
                ? "Submitting Case..."
                : "Submit Case"}
          </button>
        </form>
        <p className="start-case-footer">
          <Link to="/customer/dashboard">← Back to Dashboard</Link>
        </p>
      </section>
    </main>
  );
}
