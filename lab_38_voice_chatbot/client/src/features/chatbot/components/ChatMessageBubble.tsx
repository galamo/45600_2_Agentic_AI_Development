import type { ChatMessage } from "../../../interfaces";

type ChatMessageProps = {
  message: ChatMessage;
  onReplay?: () => void;
};

export function ChatMessageBubble({ message, onReplay }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <article className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      <div className="message-meta">{isUser ? "You" : "Agent"}</div>

      {message.isLoading && <p className="message-loading">Thinking and generating voice…</p>}

      {message.error && <p className="message-error">{message.error}</p>}

      {!message.isLoading && !message.error && message.text && (
        <p className="message-text">{message.text}</p>
      )}

      {!message.isLoading && message.audioBase64 && message.mimeType && onReplay && (
        <button type="button" className="replay-btn" onClick={onReplay}>
          Replay voice
        </button>
      )}
    </article>
  );
}
