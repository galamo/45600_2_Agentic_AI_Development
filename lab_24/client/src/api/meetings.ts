import axios from "axios";
import type { CreateMeetingPayload, Meeting } from "../interfaces";

const api = axios.create({ baseURL: "/api" });

export async function fetchMeetings(): Promise<Meeting[]> {
  const { data } = await api.get<Meeting[]>("/meetings");
  return data;
}

export async function fetchMeeting(id: string): Promise<Meeting> {
  const { data } = await api.get<Meeting>(`/meetings/${id}`);
  return data;
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
  const { data } = await api.post<Meeting>("/meetings", payload);
  return data;
}

export async function deleteMeeting(id: string): Promise<void> {
  await api.delete(`/meetings/${id}`);
}
