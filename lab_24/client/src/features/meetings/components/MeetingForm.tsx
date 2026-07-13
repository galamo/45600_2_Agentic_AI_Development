import { FormEvent, useState } from "react";
import type { CreateMeetingPayload } from "../../../interfaces";

interface MeetingFormProps {
  onSubmit: (payload: CreateMeetingPayload) => Promise<void>;
  submitting: boolean;
}

function defaultDate(): string {
  const date = new Date();
  return date.toISOString().slice(0, 10);
}

function defaultTime(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 60 - (date.getMinutes() % 15));
  date.setSeconds(0, 0);
  return date.toTimeString().slice(0, 5);
}

export function MeetingForm({ onSubmit, submitting }: MeetingFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [duration, setDuration] = useState(60);
  const [participants, setParticipants] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const participantList = participants
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    await onSubmit({
      title: title.trim(),
      date,
      time,
      duration,
      participants: participantList,
      description: description.trim() || undefined,
    });

    setTitle("");
    setDate(defaultDate());
    setTime(defaultTime());
    setDuration(60);
    setParticipants("");
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

      <div className="form-row">
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label>
          Time
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </label>
      </div>

      <label>
        Duration (minutes)
        <input
          type="number"
          min={5}
          max={480}
          step={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
        />
      </label>

      <label>
        Participants
        <input
          type="text"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="alice@example.com, bob@example.com"
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
