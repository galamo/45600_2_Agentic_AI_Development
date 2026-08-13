import { AuthEvent } from "../context/AuthContext";

export function AuthEventLog({ events }: { events: AuthEvent[] }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="dot" />
        <h3>Auth Event Timeline (client-side)</h3>
      </div>
      <ul className="log-list">
        {events.length === 0 && <li>No events yet.</li>}
        {events.map((e, i) => (
          <li key={i}>
            <code>{e.at}</code>
            {e.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
