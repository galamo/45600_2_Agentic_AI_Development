import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InlineError, InlineSuccess, Spinner } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { loading, error, successMessage, run } = useAsync();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await run(() => signup(email, password), "Account created — redirecting to login…");
    if (result !== undefined) {
      setTimeout(() => navigate("/login"), 1200);
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">🛡️</span>
          JWT Auth Lab
        </div>
      </header>
      <div className="auth-center">
        <div className="auth-card">
          <div className="auth-icon">🧬</div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Passwords are hashed server-side and never stored in plain text.</p>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                placeholder="Min 8 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
              {loading && <Spinner />}
            </button>
          </form>
          {error && <InlineError message={error} />}
          {successMessage && <InlineSuccess message={successMessage} />}
          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
