interface JsonViewerProps {
  rawJson: string;
  loading: boolean;
}

export function JsonViewer({ rawJson, loading }: JsonViewerProps) {
  if (loading) {
    return <p className="muted">Loading JSON…</p>;
  }

  let formatted = rawJson;
  try {
    formatted = JSON.stringify(JSON.parse(rawJson), null, 2);
  } catch {
    // keep raw string if parse fails
  }

  return (
    <pre className="json-viewer" aria-label="meetings.json contents">
      <code>{formatted}</code>
    </pre>
  );
}
