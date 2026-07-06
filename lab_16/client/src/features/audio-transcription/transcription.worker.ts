import { env, pipeline } from "@huggingface/transformers";
import type { WorkerInboundMessage, WorkerOutboundMessage } from "./interfaces";

env.allowLocalModels = false;
env.useBrowserCache = true;

type TranscriberPipeline = Awaited<
  ReturnType<typeof pipeline<"automatic-speech-recognition">>
>;

let transcriber: TranscriberPipeline | null = null;

function post(message: WorkerOutboundMessage) {
  self.postMessage(message);
}

self.onmessage = async (event: MessageEvent<WorkerInboundMessage>) => {
  const message = event.data;

  if (message.type === "init") {
    try {
      transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny", {
        progress_callback: (progress) => {
          if (progress.status === "progress" && progress.total) {
            post({
              type: "progress",
              payload: {
                status: progress.file ?? "Downloading model",
                percent: Math.round((progress.loaded / progress.total) * 100),
              },
            });
          } else {
            post({
              type: "progress",
              payload: {
                status: progress.status,
                percent: null,
              },
            });
          }
        },
      });
      post({ type: "ready" });
    } catch (error) {
      post({
        type: "error",
        payload: {
          message: error instanceof Error ? error.message : "Failed to load transcription model",
        },
      });
    }
    return;
  }

  if (message.type === "transcribe") {
    if (!transcriber) {
      post({ type: "error", payload: { message: "Transcription model is not ready yet" } });
      return;
    }

    try {
      const result = await transcriber(message.payload.audio);
      const text = typeof result === "object" && result !== null && "text" in result
        ? String(result.text)
        : "";
      post({ type: "result", payload: { text } });
    } catch (error) {
      post({
        type: "error",
        payload: {
          message: error instanceof Error ? error.message : "Transcription failed",
        },
      });
    }
  }
};
