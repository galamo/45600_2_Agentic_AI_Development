export function Spinner() {
  return <span className="spinner" aria-label="Loading" />;
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="alert alert-error" role="alert">
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

export function InlineSuccess({ message }: { message: string }) {
  return (
    <div className="alert alert-success" role="status">
      <span>✅</span>
      <span>{message}</span>
    </div>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>⏱ {title}</h3>
        <div>{children}</div>
        <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: 16 }}>
          Close
        </button>
      </div>
    </div>
  );
}
