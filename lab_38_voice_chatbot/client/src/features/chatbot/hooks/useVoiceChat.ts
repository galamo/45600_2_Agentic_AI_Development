import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { sendChatMessage } from "../../../api/chat";
import type { ChatMessage } from "../../../interfaces";

function createId(): string {
  return crypto.randomUUID();
}

function playAudio(audioBase64: string, mimeType: string): HTMLAudioElement {
  const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
  void audio.play();
  return audio;
}

export function useVoiceChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const replayAudio = useCallback((audioBase64: string, mimeType: string) => {
    audioRef.current?.pause();
    audioRef.current = playAudio(audioBase64, mimeType);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: trimmed,
    };

    const pendingId = createId();
    const pendingMessage: ChatMessage = {
      id: pendingId,
      role: "assistant",
      text: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setIsSending(true);

    try {
      const response = await sendChatMessage(trimmed);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingId
            ? {
                id: pendingId,
                role: "assistant",
                text: response.answer,
                audioBase64: response.audioBase64,
                mimeType: response.mimeType,
              }
            : msg
        )
      );

      audioRef.current?.pause();
      audioRef.current = playAudio(response.audioBase64, response.mimeType);
    } catch (err) {
      const errorMessage =
        axiosErrorMessage(err) ?? "Failed to get a response from the agent.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingId
            ? {
                id: pendingId,
                role: "assistant",
                text: "",
                error: errorMessage,
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  return { messages, isSending, sendMessage, replayAudio };
}

function axiosErrorMessage(err: unknown): string | undefined {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? err.message;
  }
  return undefined;
}
