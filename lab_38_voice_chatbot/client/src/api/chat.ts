import axios from "axios";
import type { ChatResponse } from "../interfaces";

const api = axios.create({ baseURL: "/api" });

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", { message });
  return data;
}
