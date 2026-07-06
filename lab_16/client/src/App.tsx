import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import CompaniesPage from "./pages/CompaniesPage";
import AudioTranscriptionPage from "./features/audio-transcription";
import AuditPage from "./features/audit";
import { DEMO_USERS, useAuth } from "./contexts/AuthContext";
import "./features/audio-transcription/audio-transcription.css";
import "./app.css";

function AppNav() {
  const { currentUser, login, logout } = useAuth();

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <span className="app-nav__brand">Lab 16</span>

      <div className="app-nav__links">
        <NavLink
          to="/companies"
          className={({ isActive }) =>
            `app-nav__link${isActive ? " app-nav__link--active" : ""}`
          }
        >
          Companies
        </NavLink>
        <NavLink
          to="/audio"
          className={({ isActive }) =>
            `app-nav__link${isActive ? " app-nav__link--active" : ""}`
          }
        >
          Audio Transcription
        </NavLink>
        <NavLink
          to="/audit"
          className={({ isActive }) =>
            `app-nav__link${isActive ? " app-nav__link--active" : ""}`
          }
        >
          Audit
        </NavLink>
      </div>

      <div className="app-nav__auth">
        {currentUser ? (
          <>
            <span className="app-nav__user-label">{currentUser.name}</span>
            <button type="button" className="app-nav__auth-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <select
              className="app-nav__select"
              defaultValue=""
              onChange={(e) => {
                const user = DEMO_USERS.find((u) => u.id === Number(e.target.value));
                if (user) login(user);
              }}
              aria-label="Select user to log in"
            >
              <option value="" disabled>
                Log in as…
              </option>
              {DEMO_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppNav />

        <Routes>
          <Route
            path="/companies"
            element={
              <main className="app-main app-main--companies">
                <CompaniesPage />
              </main>
            }
          />
          <Route
            path="/audio"
            element={
              <main className="app-main">
                <AudioTranscriptionPage />
              </main>
            }
          />
          <Route
            path="/audit"
            element={
              <main className="app-main">
                <AuditPage />
              </main>
            }
          />
          <Route path="*" element={<Navigate to="/audio" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
