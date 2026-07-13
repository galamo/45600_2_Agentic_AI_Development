import type { Meeting } from "../../../interfaces";

interface MeetingListProps {
  meetings: Meeting[];
  onDelete: (id: string) => Promise<void>;
}

function formatDateTime(date: string, time: string): string {
  const value = new Date(`${date}T${time}`);
  if (Number.isNaN(value.getTime())) {
    return `${date} ${time}`;
  }
  return value.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function MeetingList({ meetings, onDelete }: MeetingListProps) {
  if (meetings.length === 0) {
    return <p className="muted">No meetings scheduled yet.</p>;
  }

  return (
    <ul className="meeting-list">
      {meetings.map((meeting) => (
        <li key={meeting.id} className="meeting-card">
          <div className="meeting-card-header">
            <h3>{meeting.title}</h3>
            <button
              type="button"
              className="btn-danger"
              onClick={() => void onDelete(meeting.id)}
              aria-label={`Delete ${meeting.title}`}
            >
              Delete
            </button>
          </div>
          <p className="meeting-meta">
            {formatDateTime(meeting.date, meeting.time)} · {meeting.duration} min
          </p>
          {meeting.participants.length > 0 && (
            <p className="meeting-participants">
              <strong>Participants:</strong> {meeting.participants.join(", ")}
            </p>
          )}
          {meeting.description && (
            <p className="meeting-description">{meeting.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
