import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ModelLoadProgress,
  TranscriptionPhase,
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from "../interfaces";
import { decodeAudioFile } from "../utils/decodeAudio";

export function useTranscriber() {
  const workerRef = useRef<Worker | null>(null);
  const modelReadyRef = useRef(false);
  const [phase, setPhase] = useState<TranscriptionPhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState<ModelLoadProgress | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../transcription.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const message = event.data;

      switch (message.type) {
        case "ready":
          modelReadyRef.current = true;
          setModelProgress(null);
          setPhase((current) => (current === "loading-model" ? "idle" : current));
          break;
        case "progress":
          setModelProgress(message.payload);
          break;
        case "result":
          setTranscript(message.payload.text.trim());
          setPhase("done");
          break;
        case "error":
          setError(message.payload.message);
          setPhase("error");
          break;
      }
    };

    worker.onerror = () => {
      setError("Transcription worker failed unexpectedly");
      setPhase("error");
    };

    setPhase("loading-model");
    worker.postMessage({ type: "init" } satisfies WorkerInboundMessage);

    return () => {
      worker.terminate();
      workerRef.current = null;
      modelReadyRef.current = false;
    };
  }, []);

  const transcribe = useCallback(async (file: File) => {
    const worker = workerRef.current;
    if (!worker) return;

    setError(null);
    setTranscript("");

    if (!modelReadyRef.current) {
      setPhase("loading-model");
    }

    try {
      setPhase("decoding");
      const audio = await decodeAudioFile(file);

      setPhase("transcribing");
      worker.postMessage({ type: "transcribe", payload: { audio } } satisfies WorkerInboundMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decode audio file");
      setPhase("error");
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
    setPhase(modelReadyRef.current ? "idle" : "loading-model");
  }, []);

  const isBusy = phase === "loading-model" || phase === "decoding" || phase === "transcribing";

  return {
    phase,
    transcript,
    error,
    modelProgress,
    isBusy,
    transcribe,
    reset,
  };
}
