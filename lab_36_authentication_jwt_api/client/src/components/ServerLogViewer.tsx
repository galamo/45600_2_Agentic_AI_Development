import { useEffect, useState } from "react";
import { apiFetchServerLogs } from "../api/authClient";

interface ServerEvent {
  type: string;
  message: string;
  at: string;
}

export function ServerLogViewer() {
  const [events, setEvents] = useState<ServerEvent[]>([]);

  useEffect(() => {
    const load = () => apiFetchServerLogs().then((res) => setEvents(res.events)).catch(() => undefined);
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="dot" />
        <h3>Server Log Viewer (dev-only)</h3>
      </div>
      <p>Polls the server's recent auth events so you can see both sides of the flow.</p>
      <ul className="log-list">
        {events.length === 0 && <li>No server events yet.</li>}
        {events.map((e, i) => (
          <li key={i}>
            <code>{e.at}</code>
            <span className="log-tag">{e.type}</span>
            {e.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
