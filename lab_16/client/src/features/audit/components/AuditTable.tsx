import type { AuditTableProps } from "../interfaces";
import { ACTION_LABELS } from "../interfaces";

function formatTimestamp(date: Date) {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AuditTable({ entries }: AuditTableProps) {
  if (entries.length === 0) {
    return (
      <div className="audit-table__empty">
        <p>No audit entries yet.</p>
        <p className="audit-table__empty-hint">
          Log in, log out, or upload audio to see activity recorded here.
        </p>
      </div>
    );
  }

  return (
    <div className="audit-table__wrapper">
      <table className="audit-table">
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Action</th>
            <th scope="col">Details</th>
            <th scope="col">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>
                <span className="audit-table__user">{entry.userName}</span>
                <span className="audit-table__user-id">ID {entry.userId}</span>
              </td>
              <td>
                <span className={`audit-table__badge audit-table__badge--${entry.action}`}>
                  {ACTION_LABELS[entry.action]}
                </span>
              </td>
              <td className="audit-table__details">{entry.details ?? "—"}</td>
              <td className="audit-table__timestamp">{formatTimestamp(entry.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
