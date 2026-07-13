import axios from "axios";
import type { CreateMeetingPayload, Meeting } from "../interfaces";

const api = axios.create({ baseURL: "/api" });

export async function fetchMeetings(): Promise<Meeting[]> {
  const { data } = await api.get<{ data: Meeting[] }>("/meetings");
  return data.data;
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
  const { data } = await api.post<{ data: Meeting }>("/meetings", payload);
  return data.data;
}

export async function deleteMeeting(id: string): Promise<void> {
  await api.delete(`/meetings/${id}`);
}

export async function fetchRawJson(): Promise<string> {
  const { data } = await api.get<string>("/meetings/raw", {
    responseType: "text",
    transformResponse: [(value) => value],
  });
  return data;
}
