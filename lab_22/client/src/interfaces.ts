export interface Meeting {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  attendees: string[];
  description?: string;
  createdAt: string;
}

export interface CreateMeetingPayload {
  title: string;
  date: string;
  durationMinutes: number;
  attendees: string[];
  description?: string;
}
