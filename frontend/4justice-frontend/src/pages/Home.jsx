import { NavLink } from "react-router-dom";

function Home() {
return ( <div className="home-page"> <nav className="home-navbar"> <NavLink to="/" className="home-logo">
⚖️ <span>4Justice</span> </NavLink>


    <div className="home-nav-actions">
      <NavLink
        to="/customer/login"
        className="lawyer-login-link"
      >
        Customer Login
      </NavLink>

      <NavLink
        to="/lawyer/login"
        className="lawyer-login-link"
      >
        Lawyer Login
      </NavLink>

      <NavLink
        to="/admin/login"
        className="admin-login-link"
      >
        Admin Login
      </NavLink>
    </div>
  </nav>

  <main className="home-content">
    <div className="home-text">
      <span className="home-badge">
        Legal Case Management System
      </span>

      <h1>
        Justice Made
        <br />
        <span>Simple & Accessible</span>
      </h1>

      <p>
        4Justice helps customers, lawyers and administrators
        manage legal cases, documents, payments and case status
        in one secure platform.
      </p>

      <div className="home-buttons">
        <NavLink
          to="/customer/register"
          className="primary-home-button"
        >
          Register as Customer
        </NavLink>

        <NavLink
          to="/lawyer/register"
          className="secondary-home-button"
        >
          Lawyer Registration
        </NavLink>
      </div>

      <p className="home-register-note">
        Already registered as a customer?{" "}
        <NavLink to="/customer/login">
          Sign in here
        </NavLink>
      </p>

      <p className="home-register-note">
        Already a lawyer?{" "}
        <NavLink to="/lawyer/login">
          Sign in here
        </NavLink>
      </p>
    </div>

    <div className="home-visual">
      <div className="justice-icon">⚖️</div>

      <h2>4Justice</h2>

      <p>Secure • Transparent • Simple</p>
    </div>
  </main>
</div>

);
}

export default Home;
