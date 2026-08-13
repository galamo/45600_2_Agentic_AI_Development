import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { InlineError, Spinner } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";

export function LoginPage() {
  const { login, accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, run } = useAsync();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Demo1234!");

  useEffect(() => {
    if (accessToken) {
      navigate("/", { replace: true });
    }
  }, [accessToken, navigate]);

  async function onSubmit() {
    const result = await run(() => login(email, password));
    if (result !== undefined) {
      const from = (location.state as { from?: Location } | null)?.from;
      navigate(from ? `${from.pathname}${from.search}` : "/", { replace: true });
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
          <div className="auth-icon">🔐</div>
          <h2>Secure Sign In</h2>
          <p className="auth-subtitle">
            Dummy user pre-filled: <code>demo@example.com</code> / <code>Demo1234!</code>
          </p>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="button" disabled={loading} onClick={onSubmit}>
            {loading ? "Authenticating…" : "Log in"}
            {loading && <Spinner />}
          </button>
          {error && <InlineError message={error} />}
          <p className="auth-footer">
            Need an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
