import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetchDashboard } from "../api/authClient";
import { AuthEventLog } from "../components/AuthEventLog";
import { InlineError, Modal, Spinner } from "../components/Feedback";
import { JwtInspectorPanel } from "../components/JwtInspectorPanel";
import { ServerLogViewer } from "../components/ServerLogViewer";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";

export function DashboardPage() {
  const { accessToken, user, events, logout, refreshSession, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const { loading, error, run } = useAsync();
  const [items, setItems] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    run(() => apiFetchDashboard(accessToken)).then((res) => {
      if (res) setItems(res.items);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (sessionExpired) {
      const timer = setTimeout(() => {
        clearSessionExpired();
        navigate("/login");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired, clearSessionExpired, navigate]);

  async function onLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">🛡️</span>
          JWT Auth Lab
        </div>
      </header>
      <div className="dashboard-shell">
        <div className="dash-header">
          <div>
            <span className="badge">🔒 Protected route</span>
            <h2>Security Dashboard</h2>
            <p className="user-line">
              Authenticated as <strong>{user?.email}</strong>
            </p>
          </div>
          <div className="dash-actions">
            <button className="btn btn-secondary" onClick={() => refreshSession()}>
              🔄 Force refresh token
            </button>
            <button className="btn btn-danger" onClick={onLogout}>
              ⏏ Logout
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="dot" />
            <h3>Dummy protected data {loading && <Spinner />}</h3>
          </div>
          {error && <InlineError message={error} />}
          <ul className="data-list">
            {items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>

        {accessToken && <JwtInspectorPanel accessToken={accessToken} />}
        <AuthEventLog events={events} />
        <ServerLogViewer />

        {sessionExpired && (
          <Modal title="Session expired" onClose={() => { clearSessionExpired(); navigate("/login"); }}>
            <p>Your session has expired and the refresh attempt failed. Redirecting to login…</p>
          </Modal>
        )}
      </div>
    </div>
  );
}
