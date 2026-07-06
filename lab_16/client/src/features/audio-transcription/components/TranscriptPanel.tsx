import type { TranscriptPanelProps } from "../interfaces";

export default function TranscriptPanel({
  transcript,
  phase,
  onCopy,
  copied,
}: TranscriptPanelProps) {
  const isEmpty = !transcript && phase !== "transcribing";

  return (
    <section className="transcript-panel" aria-live="polite">
      <div className="transcript-panel__header">
        <h2 className="transcript-panel__title">Transcript</h2>
        {transcript && (
          <button type="button" className="transcript-panel__copy" onClick={onCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>

      <div className={`transcript-panel__body${isEmpty ? " transcript-panel__body--empty" : ""}`}>
        {phase === "transcribing" && (
          <div className="transcript-panel__loading">
            <span className="transcript-panel__spinner" aria-hidden="true" />
            <span>Transcribing audio…</span>
          </div>
        )}

        {isEmpty && (
          <p className="transcript-panel__placeholder">
            Your transcript will appear here after you upload and transcribe an audio file.
          </p>
        )}

        {transcript && <p className="transcript-panel__text">{transcript}</p>}
      </div>
    </section>
  );
}
