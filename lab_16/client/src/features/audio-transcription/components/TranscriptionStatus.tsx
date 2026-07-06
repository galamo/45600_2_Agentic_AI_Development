import type { TranscriptionStatusProps } from "../interfaces";

const PHASE_LABELS: Record<TranscriptionStatusProps["phase"], string> = {
  idle: "Ready",
  "loading-model": "Loading AI model",
  decoding: "Decoding audio",
  transcribing: "Transcribing",
  done: "Complete",
  error: "Error",
};

export default function TranscriptionStatus({
  phase,
  modelProgress,
  error,
}: TranscriptionStatusProps) {
  const showProgress = phase === "loading-model" && modelProgress;

  return (
    <div className="transcription-status" role="status">
      <div className="transcription-status__badge" data-phase={phase}>
        {phase !== "idle" && phase !== "done" && phase !== "error" && (
          <span className="transcription-status__spinner" aria-hidden="true" />
        )}
        <span>{PHASE_LABELS[phase]}</span>
      </div>

      {showProgress && (
        <div className="transcription-status__progress">
          <div className="transcription-status__progress-bar">
            <div
              className="transcription-status__progress-fill"
              style={{ width: modelProgress.percent !== null ? `${modelProgress.percent}%` : "30%" }}
            />
          </div>
          <p className="transcription-status__progress-label">
            {modelProgress.percent !== null
              ? `${modelProgress.percent}% — ${modelProgress.status}`
              : modelProgress.status}
          </p>
        </div>
      )}

      {error && <p className="transcription-status__error">{error}</p>}

      {phase === "idle" && (
        <p className="transcription-status__hint">
          Transcription runs entirely in your browser — your audio never leaves this device.
        </p>
      )}
    </div>
  );
}
