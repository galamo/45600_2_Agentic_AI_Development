// USED_SKILL_(axios-http-enforcer)
// USED_SKILL_(react-axios-http)
import axios from "axios";

export type StoryRequest = {
  subject: string;
  generateImage?: boolean;
  systemPrompt?: string;
};

export type StoryResponse = {
  success: boolean;
  story?: string;
  imagePath?: string | null;
  imageUrl?: string | null;
  modelId?: string;
  error?: string;
};

export const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

export async function createStory(payload: StoryRequest): Promise<StoryResponse> {
  const { data } = await api.post<StoryResponse>("/api/story", payload);
  return data;
}

export async function checkHealth(): Promise<{ status: string }> {
  const { data } = await api.get<{ status: string }>("/api/health");
  return data;
}
