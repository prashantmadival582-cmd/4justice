
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCustomerJson } from "../api/customerApi";

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await getCustomerJson("/api/customers/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const customer = data?.customer;

      if (
        !customer ||
        customer.id == null ||
        !customer.email
      ) {
        throw new Error(
          "The server did not return your customer account details."
        );
      }

      // Save the logged-in customer's details.
      localStorage.setItem("customerId", String(customer.id));
      localStorage.setItem(
        "customerName",
        customer.name || ""
      );
      localStorage.setItem(
        "customerEmail",
        customer.email
      );
      localStorage.setItem(
        "customerPhone",
        customer.phone || ""
      );

      // Redirect after successful login.
      navigate("/customer/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || "Unable to sign in. Please try again."
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

        <h1>Customer Login</h1>

        <p className="lawyer-auth-subtitle">
          Sign in to create and track your legal cases.
        </p>

        {error && (
          <div className="lawyer-auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="customer-login-email">
            Email Address
          </label>

          <input
            id="customer-login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="customer-login-password">
            Password
          </label>

          <input
            id="customer-login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="lawyer-auth-footer">
          Don't have an account?{" "}
          <Link to="/customer/register">
            Register here
          </Link>
        </p>
      </section>
    </main>
  );
}

