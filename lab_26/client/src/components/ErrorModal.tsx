type ErrorModalProps = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export function ErrorModal({
  open,
  title = "Something Went Wrong",
  message,
  onClose,
}: ErrorModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="error-modal-title">{title}</h2>
        <p id="error-modal-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
