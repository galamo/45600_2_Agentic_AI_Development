import { useRef, useState, type DragEvent } from "react";
import {
  ACCEPTED_AUDIO_TYPES,
  MAX_AUDIO_FILE_SIZE_BYTES,
  type AudioUploadZoneProps,
} from "../interfaces";
import { formatDuration, formatFileSize } from "../utils/decodeAudio";

const ACCEPT_ATTRIBUTE = [...ACCEPTED_AUDIO_TYPES, "audio/*"].join(",");

export default function AudioUploadZone({
  selectedFile,
  disabled,
  error,
  onFileSelect,
  onClear,
}: AudioUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSelect = (file: File | undefined) => {
    if (!file) return;
    onFileSelect(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    validateAndSelect(event.dataTransfer.files[0]);
  };

  if (selectedFile) {
    return (
      <div className="audio-upload audio-upload--selected">
        <div className="audio-upload__file-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="audio-upload__file-details">
          <p className="audio-upload__file-name">{selectedFile.name}</p>
          <p className="audio-upload__file-meta">
            {formatFileSize(selectedFile.sizeBytes)}
            {selectedFile.durationSeconds !== null && (
              <> · {formatDuration(selectedFile.durationSeconds)}</>
            )}
          </p>
        </div>
        <button
          type="button"
          className="audio-upload__clear"
          onClick={onClear}
          disabled={disabled}
          aria-label="Remove selected file"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="audio-upload">
      <div
        className={`audio-upload__dropzone${isDragging ? " audio-upload__dropzone--active" : ""}${error ? " audio-upload__dropzone--error" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !disabled) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload audio file"
      >
        <div className="audio-upload__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
            <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
        </div>
        <p className="audio-upload__title">Drop your audio file here</p>
        <p className="audio-upload__hint">or click to browse · MP3, WAV, OGG, M4A · max 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          className="audio-upload__input"
          disabled={disabled}
          onChange={(event) => validateAndSelect(event.target.files?.[0])}
        />
      </div>
      {error && <p className="audio-upload__error">{error}</p>}
    </div>
  );
}

export function validateAudioFile(file: File): string | null {
  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return `File is too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`;
  }

  const isAudio =
    file.type.startsWith("audio/") ||
    ACCEPTED_AUDIO_TYPES.includes(file.type as (typeof ACCEPTED_AUDIO_TYPES)[number]);

  if (!isAudio) {
    return "Please select a valid audio file (MP3, WAV, OGG, M4A, etc.).";
  }

  return null;
}
