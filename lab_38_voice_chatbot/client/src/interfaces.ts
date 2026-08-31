export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  audioBase64?: string;
  mimeType?: "audio/mpeg";
  isLoading?: boolean;
  error?: string;
};

export type ChatResponse = {
  answer: string;
  audioBase64: string;
  mimeType: "audio/mpeg";
};
