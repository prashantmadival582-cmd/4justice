
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/api";

export default function LawyerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lawyers/login`,
        {
          method: "POST",

          // IMPORTANT: Receive and retain the backend session cookie.
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || "Invalid email or password."
        );
      }

      // Support either a direct lawyer response or a nested response.
      const lawyer = data?.lawyer ?? data;
      const lawyerId = lawyer?.id;

      if (lawyerId == null) {
        throw new Error(
          "Login succeeded, but the lawyer ID was not returned by the server."
        );
      }

      // Store display information only; the backend session
      // remains responsible for authentication.
      localStorage.setItem(
        "loggedInLawyer",
        JSON.stringify({
          id: lawyerId,
          name: lawyer.name || "",
          email: lawyer.email || formData.email,
        })
      );

      // Navigate only after the login request succeeds.
      navigate("/lawyer/dashboard", { replace: true });
    } catch (err) {
      console.error("Lawyer login error:", err);

      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lawyer-auth-page">
      <section className="lawyer-auth-card">
        <Link to="/" className="lawyer-auth-brand">
          4Justice
        </Link>

        <h1>Lawyer Login</h1>

        <p className="lawyer-auth-subtitle">
          Sign in to manage your assigned cases.
        </p>

        {error && (
          <div className="lawyer-auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="lawyer-auth-footer">
          Don't have an account?{" "}
          <Link to="/lawyer/register">Register here</Link>
        </p>
      </section>
    </main>
  );
}
