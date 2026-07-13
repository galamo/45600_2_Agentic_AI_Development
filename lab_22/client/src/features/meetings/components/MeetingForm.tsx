import { FormEvent, useState } from "react";
import type { CreateMeetingPayload } from "../../../interfaces";

interface MeetingFormProps {
  onSubmit: (payload: CreateMeetingPayload) => Promise<void>;
  submitting: boolean;
}

function toIsoDatetime(localValue: string): string {
  return new Date(localValue).toISOString();
}

function defaultDatetimeLocal(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 60 - (date.getMinutes() % 15));
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function MeetingForm({ onSubmit, submitting }: MeetingFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDatetimeLocal);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [attendees, setAttendees] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const attendeeList = attendees
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    await onSubmit({
      title: title.trim(),
      date: toIsoDatetime(date),
      durationMinutes,
      attendees: attendeeList,
      description: description.trim() || undefined,
    });

    setTitle("");
    setDate(defaultDatetimeLocal());
    setDurationMinutes(30);
    setAttendees("");
    setDescription("");
  };

  return (
    <form className="meeting-form" onSubmit={(e) => void handleSubmit(e)}>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Weekly sync"
          required
        />
      </label>

      <label>
        Date & time
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <label>
        Duration (minutes)
        <input
          type="number"
          min={5}
          max={480}
          step={5}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          required
        />
      </label>

      <label>
        Attendees
        <input
          type="text"
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          placeholder="alice@example.com, bob@example.com"
          required
        />
        <span className="hint">Comma-separated names or emails</span>
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Agenda, notes, or location"
          rows={3}
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? "Scheduling…" : "Schedule meeting"}
      </button>
    </form>
  );
}
