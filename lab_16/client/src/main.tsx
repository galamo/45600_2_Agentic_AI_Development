import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuditProvider } from "./contexts/AuditContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuditProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AuditProvider>
  </StrictMode>,
);
