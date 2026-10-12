
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCustomerJson } from "../api/customerApi";

export default function CustomerRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await getCustomerJson("/api/customers/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        }),
      });
      localStorage.setItem("customerName", data.name || formData.name.trim());
      localStorage.setItem("customerEmail", data.email || formData.email.trim());
      localStorage.setItem("customerPhone", data.phone || formData.phone.trim());
      setError("");
      navigate("/customer/login");
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server."
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

        <h1>Customer Registration</h1>

        <p className="lawyer-auth-subtitle">
          Create an account to start and track your legal cases.
        </p>

        {error && (
          <div className="lawyer-auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="customer-name">Full Name</label>
          <input
            id="customer-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="customer-email">Email Address</label>
          <input
            id="customer-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="customer-phone">Phone Number</label>
          <input
            id="customer-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label htmlFor="customer-password">Password</label>
          <input
            id="customer-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="lawyer-auth-footer">
          Already have an account?{" "}
          <Link to="/customer/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}