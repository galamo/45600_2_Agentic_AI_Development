import type { FormEvent } from "react";

type ChatInputProps = {
  disabled: boolean;
  onSend: (message: string) => void;
};

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;

    onSend(value);
    input.value = "";
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        name="message"
        type="text"
        placeholder="Ask the voice agent a question…"
        autoComplete="off"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled}>
        Send
      </button>
    </form>
  );
}
