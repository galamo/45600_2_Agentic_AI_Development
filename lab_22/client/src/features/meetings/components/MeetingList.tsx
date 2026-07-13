import type { Meeting } from "../../../interfaces";

interface MeetingListProps {
  meetings: Meeting[];
  onDelete: (id: string) => Promise<void>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
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
            {formatDate(meeting.date)} · {meeting.durationMinutes} min
          </p>
          <p className="meeting-attendees">
            <strong>Attendees:</strong> {meeting.attendees.join(", ")}
          </p>
          {meeting.description && (
            <p className="meeting-description">{meeting.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
