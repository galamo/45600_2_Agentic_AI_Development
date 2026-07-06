export const MAX_AUDIO_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  "audio/x-flac",
] as const;

export type TranscriptionPhase =
  | "idle"
  | "loading-model"
  | "decoding"
  | "transcribing"
  | "done"
  | "error";

export interface SelectedAudioFile {
  file: File;
  name: string;
  sizeBytes: number;
  durationSeconds: number | null;
}

export interface ModelLoadProgress {
  status: string;
  percent: number | null;
}

export interface AudioUploadZoneProps {
  selectedFile: SelectedAudioFile | null;
  disabled: boolean;
  error: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export interface TranscriptPanelProps {
  transcript: string;
  phase: TranscriptionPhase;
  onCopy: () => void;
  copied: boolean;
}

export interface TranscriptionStatusProps {
  phase: TranscriptionPhase;
  modelProgress: ModelLoadProgress | null;
  error: string | null;
}

export type WorkerInboundMessage =
  | { type: "init" }
  | { type: "transcribe"; payload: { audio: Float32Array } };

export type WorkerOutboundMessage =
  | { type: "ready" }
  | { type: "progress"; payload: { status: string; percent: number | null } }
  | { type: "result"; payload: { text: string } }
  | { type: "error"; payload: { message: string } };
