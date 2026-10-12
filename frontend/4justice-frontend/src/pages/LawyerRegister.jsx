import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api/api";

export default function LawyerRegister() {
const navigate = useNavigate();

const [formData, setFormData] = useState({
name: "",
email: "",
password: "",
specialization: "",
phone: "",
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
  const response = await fetch(
    `${API_BASE_URL}/api/lawyers/register`,
    {
      method: "POST",
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
        : data?.message || "Registration failed. Please try again."
    );
  }

  alert("Registration successful! Please log in.");
  navigate("/lawyer/login");
} catch (err) {
  setError(
    err.message || "Unable to connect to the server. Please try again."
  );
} finally {
  setLoading(false);
}


};

return ( <main className="lawyer-auth-page"> <section className="lawyer-auth-card"> <Link to="/" className="lawyer-auth-brand">
4Justice </Link>


    <h1>Lawyer Registration</h1>
    <p className="lawyer-auth-subtitle">
      Create your lawyer account to get started.
    </p>

    {error && (
      <div className="lawyer-auth-error" role="alert">
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Full Name</label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Enter your full name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="email">Email Address</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        minLength={8}
        value={formData.password}
        onChange={handleChange}
        required
      />

      <label htmlFor="specialization">Specialization</label>
      <input
        id="specialization"
        name="specialization"
        type="text"
        placeholder="e.g. Civil Law"
        value={formData.specialization}
        onChange={handleChange}
        required
      />

      <label htmlFor="phone">Phone Number</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>

    <p className="lawyer-auth-footer">
      Already registered? <Link to="/lawyer/login">Log in</Link>
    </p>
  </section>
</main>

);
}
