import type { Meeting } from "../../../interfaces";

interface JsonViewerProps {
  meetings: Meeting[];
  loading: boolean;
}

export function JsonViewer({ meetings, loading }: JsonViewerProps) {
  if (loading) {
    return <p className="muted">Loading JSON…</p>;
  }

  const formatted = JSON.stringify(meetings, null, 2);

  return (
    <pre className="json-viewer" aria-label="Meetings API JSON">
      <code>{formatted}</code>
    </pre>
  );
}
