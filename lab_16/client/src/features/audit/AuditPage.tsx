import { useAudit } from "../../contexts/AuditContext";
import AuditTable from "./components/AuditTable";
import "./audit.css";

export default function AuditPage() {
  const { entries } = useAudit();

  return (
    <div className="audit-page">
      <header className="audit-page__header">
        <h1 className="audit-page__title">Audit Log</h1>
        <p className="audit-page__subtitle">
          Track user activity across the application — logins, logouts, and audio uploads.
        </p>
      </header>

      <AuditTable entries={entries} />
    </div>
  );
}
