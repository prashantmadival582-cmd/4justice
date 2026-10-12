
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Home from "./pages/Home";
import AdminCases from "./pages/AdminCases";
import AdminLogin from "./pages/AdminLogin";
import CaseDetails from "./pages/CaseDetails";
import LawyerRegister from "./pages/LawyerRegister";
import LawyerLogin from "./pages/LawyerLogin";
import LawyerDashboard from "./pages/LawyerDashboard";

import CustomerRegister from "./pages/CustomerRegister";
import CustomerLogin from "./pages/CustomerLogin";
import StartCase from "./pages/StartCase";
import {
  CustomerCaseDetails,
  CustomerCases,
} from "./pages/CustomerCases";
import CustomerDocuments from "./pages/CustomerDocuments";
import CustomerUpdates from "./pages/CustomerUpdates";

import API_BASE_URL from "./api/api";
import {
  customerRequest,
  getCustomerJson,
} from "./api/customerApi";

import "./App.css";

// ===============================
// Admin Dashboard
// ===============================

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalCases: 0,
    pendingCases: 0,
    totalLawyers: 0,
    totalPayments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/dashboard`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <section className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Admin.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div>
            <span>Total Cases</span>
            <h2>{loading ? "..." : dashboardData.totalCases}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <span>Pending Cases</span>
            <h2>{loading ? "..." : dashboardData.pendingCases}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div>
            <span>Total Lawyers</span>
            <h2>{loading ? "..." : dashboardData.totalLawyers}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div>
            <span>Total Payments</span>
            <h2>{loading ? "..." : dashboardData.totalPayments}</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Recent Cases</h2>
            <p>Recently created customer cases.</p>
          </div>

          <NavLink to="/admin/cases" className="view-all">
            View All
          </NavLink>
        </div>

        <div className="recent-case-list">
          <p>Recent cases will be connected to the database next.</p>
        </div>
      </div>
    </section>
  );
}

// ===============================
// Admin Lawyers Page
// ===============================

function Lawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/lawyers`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to load lawyers.");
        }

        const data = await response.json();
        setLawyers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  return (
    <section className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Lawyer Management</h1>
          <p>View registered lawyers and their availability.</p>
        </div>
      </div>

      <div className="dashboard-card">
        {loading && <p>Loading lawyers...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && lawyers.length === 0 && (
          <p>No lawyers registered yet.</p>
        )}

        {!loading && !error && lawyers.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "12px" }}>
                    Name
                  </th>
                  <th style={{ textAlign: "left", padding: "12px" }}>
                    Email
                  </th>
                  <th style={{ textAlign: "left", padding: "12px" }}>
                    Specialization
                  </th>
                  <th style={{ textAlign: "left", padding: "12px" }}>
                    Phone
                  </th>
                  <th style={{ textAlign: "left", padding: "12px" }}>
                    Availability
                  </th>
                </tr>
              </thead>

              <tbody>
                {lawyers.map((lawyer) => (
                  <tr key={lawyer.id}>
                    <td style={{ padding: "12px" }}>{lawyer.name}</td>
                    <td style={{ padding: "12px" }}>{lawyer.email}</td>
                    <td style={{ padding: "12px" }}>
                      {lawyer.specialization}
                    </td>
                    <td style={{ padding: "12px" }}>{lawyer.phone}</td>
                    <td style={{ padding: "12px" }}>
                      {lawyer.availability || "UNKNOWN"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// ===============================
// Admin Documents Page
// ===============================

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchDocuments() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/documents`,
          { credentials: "include" }
        );

        if (!response.ok) {
          if (response.status === 403 || response.status === 401) {
            throw new Error(
              "Admin session required. Please log in as admin."
            );
          }

          throw new Error("Failed to load documents.");
        }

        const data = await response.json();

        if (active) {
          setDocuments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to connect to the backend."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchDocuments();

    return () => {
      active = false;
    };
  }, []);

  async function downloadDocument(documentId, fileName) {
    try {
      setDownloadingId(documentId);

      const response = await fetch(
        `${API_BASE_URL}/api/cases/documents/${documentId}/download`,
        { credentials: "include" }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "You are not authorized to download this document."
          );
        }

        throw new Error("Unable to download document.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      window.alert(err.message || "Download failed.");
    } finally {
      setDownloadingId(null);
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const query = searchTerm.trim().toLowerCase();

    return (
      String(doc.caseId || "").toLowerCase().includes(query) ||
      String(doc.fileName || "").toLowerCase().includes(query) ||
      String(doc.fileType || "").toLowerCase().includes(query) ||
      String(doc.id || "").includes(query)
    );
  });

  if (loading) {
    return (
      <section className="documents-page">
        <div className="documents-loading">Loading documents...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="documents-page">
        <div className="documents-header">
          <div>
            <span className="documents-eyebrow">CASE MANAGEMENT</span>
            <h1>Documents</h1>
            <p>Manage uploaded case documents.</p>
          </div>
        </div>

        <div className="documents-message documents-error">
          <h3>Unable to load documents</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="documents-page">
      <div className="documents-header">
        <div>
          <span className="documents-eyebrow">CASE MANAGEMENT</span>
          <h1>Documents</h1>
          <p>View and download documents uploaded for customer cases.</p>
        </div>

        <div className="documents-total">
          <span>Total Documents</span>
          <strong>{documents.length}</strong>
        </div>
      </div>

      <div className="documents-toolbar">
        <div className="documents-search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Search by case ID, file name or type..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search documents"
          />
        </div>

        <span className="documents-results">
          {filteredDocuments.length}{" "}
          {filteredDocuments.length === 1 ? "document" : "documents"}
        </span>
      </div>

      <div className="documents-card">
        {filteredDocuments.length === 0 ? (
          <div className="documents-message">
            <div className="documents-empty-icon">▤</div>

            <h3>
              {documents.length === 0
                ? "No documents yet"
                : "No matching documents"}
            </h3>

            <p>
              {documents.length === 0
                ? "Uploaded case documents will appear here."
                : "Try searching with a different case ID or file name."}
            </p>
          </div>
        ) : (
          <div className="documents-table-wrapper">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>DOCUMENT</th>
                  <th>CASE ID</th>
                  <th>DOCUMENT ID</th>
                  <th>FILE TYPE</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="document-file">
                        <div className="document-file-icon">FILE</div>

                        <div className="document-file-info">
                          <strong>
                            {doc.fileName || "Untitled document"}
                          </strong>
                          <span>Uploaded case file</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="document-case-id">
                        {doc.caseId || "—"}
                      </span>
                    </td>

                    <td>#{doc.id}</td>

                    <td>
                      <span className="document-type">
                        {doc.fileType || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="document-download-btn"
                        type="button"
                        disabled={downloadingId === doc.id}
                        onClick={() =>
                          downloadDocument(doc.id, doc.fileName)
                        }
                      >
                        {downloadingId === doc.id
                          ? "Downloading..."
                          : "↓ Download"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="documents-footer-note">
        <span aria-hidden="true">🔒</span>
        Case documents are intended for authorized users only.
      </p>
    </section>
  );
}

// ===============================
// Admin Payments Page
// ===============================

function Payments() {
  return (
    <section className="placeholder-page">
      <h1>Payments</h1>
      <p>Payment information will be available here.</p>
    </section>
  );
}

// ===============================
// Admin Layout
// ===============================

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚖</div>
          <div>
            <h2>4Justice</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span>▦</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/cases"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span>📁</span>
            Cases
          </NavLink>

          <NavLink
            to="/admin/lawyers"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span>⚖</span>
            Lawyers
          </NavLink>

          <NavLink
            to="/admin/documents"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span>📄</span>
            Documents
          </NavLink>

          <NavLink
            to="/admin/payments"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span>💳</span>
            Payments
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={() => {
              window.location.href = "/admin/login";
            }}
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h3>Admin Portal</h3>
            <span>4Justice Case Management System</span>
          </div>

          <div className="topbar-right">
            <button className="notification-button" type="button">
              🔔
            </button>

            <div className="topbar-admin">
              <div className="topbar-avatar">A</div>
              <div>
                <strong>Admin</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<AdminCases />} />
            <Route path="/cases/:caseId" element={<CaseDetails />} />
            <Route path="/lawyers" element={<Lawyers />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// ===============================
// Customer Dashboard
// ===============================

function CustomerDashboard() {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(
    localStorage.getItem("customerName") || "Customer"
  );

  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    getCustomerJson("/api/customers/me")
      .then((customer) => {
        if (!active) return;

        setCustomerName(customer.name || "Customer");

        localStorage.setItem("customerId", String(customer.id));
        localStorage.setItem("customerName", customer.name || "");
        localStorage.setItem("customerEmail", customer.email || "");
        localStorage.setItem("customerPhone", customer.phone || "");
      })
      .catch((error) => {
        if (!active) return;

        if (error.status === 401) {
          navigate("/customer/login", { replace: true });
          return;
        }

        console.error("Unable to verify customer session:", error);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await customerRequest("/api/customers/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Customer logout failed:", error);
    } finally {
      [
        "customerId",
        "customerName",
        "customerEmail",
        "customerPhone",
      ].forEach((key) => localStorage.removeItem(key));

      navigate("/customer/login", { replace: true });
    }
  };

  if (checkingSession) {
    return (
      <main className="customer-dashboard">
        <p className="customer-page-message">
          Loading your customer portal...
        </p>
      </main>
    );
  }

  return (
    <main className="customer-dashboard">
      <header className="customer-dashboard-header">
        <NavLink to="/" className="customer-dashboard-brand">
          <span aria-hidden="true">⚖️</span> 4Justice
        </NavLink>

        <div className="customer-header-actions">
          <span className="customer-header-label">
            Customer Portal
          </span>

          <button
            type="button"
            className="customer-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="customer-dashboard-content">
        <div className="customer-welcome">
          <span className="customer-dashboard-badge">
            YOUR LEGAL SPACE
          </span>

          <h1>Welcome, {customerName}</h1>

          <p>
            Manage your legal cases, documents, and progress
            from one convenient place.
          </p>

          <button
            type="button"
            className="customer-primary-action"
            onClick={() => navigate("/customer/start-case")}
          >
            + Start a New Case
          </button>
        </div>

        <div className="customer-overview-heading">
          <div>
            <h2>Your Workspace</h2>
            <p>
              Everything you need to manage your legal matters.
            </p>
          </div>
        </div>

        <div className="customer-dashboard-cards">
          <article className="customer-dashboard-card">
            <div className="customer-card-icon">📁</div>
            <h2>My Cases</h2>
            <p>
              View your submitted cases and follow their progress.
            </p>
            <button
              type="button"
              onClick={() => navigate("/customer/my-cases")}
            >
              View My Cases →
            </button>
          </article>

          <article className="customer-dashboard-card">
            <div className="customer-card-icon">➕</div>
            <h2>Start a Case</h2>
            <p>
              Submit a new legal matter to the 4Justice team.
            </p>
            <button
              type="button"
              onClick={() => navigate("/customer/start-case")}
            >
              Start My Case →
            </button>
          </article>

          <article className="customer-dashboard-card">
            <div className="customer-card-icon">📄</div>
            <h2>Documents</h2>
            <p>
              Access documents associated with your legal cases.
            </p>
            <button
              type="button"
              onClick={() => navigate("/customer/documents")}
            >
              View Documents →
            </button>
          </article>

          <article className="customer-dashboard-card">
            <div className="customer-card-icon">🔔</div>
            <h2>Case Updates</h2>
            <p>
              Stay informed about case progress and important updates.
            </p>
            <button
              type="button"
              onClick={() => navigate("/customer/updates")}
            >
              View Updates →
            </button>
          </article>
        </div>

        <div className="customer-payment-note">
          <span className="customer-payment-icon">💳</span>

          <div>
            <h2>Payments</h2>
            <p>
              Payment history and invoices will be available here
              in a future update.
            </p>
          </div>

          <span className="customer-coming-soon">
            Coming later
          </span>
        </div>

        <div className="customer-help-section">
          <div>
            <h2>Need assistance?</h2>
            <p>
              Contact the 4Justice team if you need help with
              your legal case.
            </p>
          </div>

          <NavLink to="/" className="customer-help-link">
            Visit Home →
          </NavLink>
        </div>
      </section>
    </main>
  );
}

// ===============================
// Main App
// ===============================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Lawyer */}
        <Route path="/lawyer/register" element={<LawyerRegister />} />
        <Route path="/lawyer/login" element={<LawyerLogin />} />
        <Route
          path="/lawyer/dashboard"
          element={<LawyerDashboard />}
        />

        {/* Customer */}
        <Route
          path="/customer/register"
          element={<CustomerRegister />}
        />
        <Route
          path="/customer/login"
          element={<CustomerLogin />}
        />
        <Route
          path="/customer/dashboard"
          element={<CustomerDashboard />}
        />
        <Route
          path="/customer/start-case"
          element={<StartCase />}
        />
        <Route
          path="/customer/my-cases"
          element={<CustomerCases />}
        />
        <Route
          path="/customer/my-cases/:caseId"
          element={<CustomerCaseDetails />}
        />
        <Route
          path="/customer/documents"
          element={<CustomerDocuments />}
        />
        <Route
          path="/customer/updates"
          element={<CustomerUpdates />}
        />

        {/* Redirect unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;