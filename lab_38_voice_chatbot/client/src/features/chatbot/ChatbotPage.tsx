import { useEffect, useRef } from "react";
import { ChatInput } from "./components/ChatInput";
import { ChatMessageBubble } from "./components/ChatMessageBubble";
import { useVoiceChat } from "./hooks/useVoiceChat";

export function ChatbotPage() {
  const { messages, isSending, sendMessage, replayAudio } = useVoiceChat();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chatbot">
      <header className="chatbot-header">
        <h1>Voice Chatbot</h1>
        <p>
          Ask a question — the LangGraph agent answers via OpenRouter, then ElevenLabs
          speaks the reply in your browser.
        </p>
      </header>

      <div className="chatbot-messages" ref={listRef}>
        {messages.length === 0 && (
          <p className="chatbot-empty">
            Try: &quot;What is LangGraph?&quot; or &quot;Tell me a fun fact about space.&quot;
          </p>
        )}

        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            onReplay={
              message.audioBase64 && message.mimeType
                ? () => replayAudio(message.audioBase64!, message.mimeType!)
                : undefined
            }
          />
        ))}
      </div>

      <ChatInput disabled={isSending} onSend={sendMessage} />
    </div>
  );
}
