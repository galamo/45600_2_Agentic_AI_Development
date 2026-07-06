import { useCallback, useState } from "react";
import { useAudit } from "../../contexts/AuditContext";
import { useAuth } from "../../contexts/AuthContext";
import AudioUploadZone, { validateAudioFile } from "./components/AudioUploadZone";
import TranscriptPanel from "./components/TranscriptPanel";
import TranscriptionStatus from "./components/TranscriptionStatus";
import { useTranscriber } from "./hooks/useTranscriber";
import type { SelectedAudioFile } from "./interfaces";
import { getAudioDuration } from "./utils/decodeAudio";
import "./audio-transcription.css";

export default function AudioTranscriptionPage() {
  const { phase, transcript, error, modelProgress, isBusy, transcribe, reset } = useTranscriber();
  const { logAction } = useAudit();
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<SelectedAudioFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateAudioFile(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError(null);
    const durationSeconds = await getAudioDuration(file);
    setSelectedFile({
      file,
      name: file.name,
      sizeBytes: file.size,
      durationSeconds,
    });
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, "upload_audio", file.name);
    }
    reset();
  }, [reset, currentUser, logAction]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
    reset();
  }, [reset]);

  const handleTranscribe = useCallback(async () => {
    if (!selectedFile) return;
    await transcribe(selectedFile.file);
  }, [selectedFile, transcribe]);

  const handleCopy = useCallback(async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [transcript]);

  const displayError = fileError ?? (phase === "error" ? error : null);

  return (
    <div className="audio-transcription-page">
      <header className="audio-transcription-page__header">
        <div className="audio-transcription-page__header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
          </svg>
        </div>
        <div>
          <h1 className="audio-transcription-page__title">Audio Transcription</h1>
          <p className="audio-transcription-page__subtitle">
            Upload an audio file and get an AI-powered transcript — processed locally in your browser.
          </p>
        </div>
      </header>

      <div className="audio-transcription-page__grid">
        <div className="audio-transcription-page__upload-section">
          <AudioUploadZone
            selectedFile={selectedFile}
            disabled={isBusy}
            error={fileError}
            onFileSelect={handleFileSelect}
            onClear={handleClear}
          />

          <TranscriptionStatus
            phase={phase}
            modelProgress={modelProgress}
            error={displayError}
          />

          <button
            type="button"
            className="audio-transcription-page__submit"
            disabled={!selectedFile || isBusy}
            onClick={handleTranscribe}
          >
            {phase === "transcribing" ? "Transcribing…" : "Transcribe Audio"}
          </button>
        </div>

        <TranscriptPanel
          transcript={transcript}
          phase={phase}
          onCopy={handleCopy}
          copied={copied}
        />
      </div>
    </div>
  );
}
