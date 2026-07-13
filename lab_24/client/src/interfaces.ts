export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  participants: string[];
  description?: string;
  createdAt: string;
}

export interface CreateMeetingPayload {
  title: string;
  date: string;
  time: string;
  duration?: number;
  participants?: string[];
  description?: string;
}
