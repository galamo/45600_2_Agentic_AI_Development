import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { createMeeting, deleteMeeting, fetchMeetings } from "../../api/meetings";
import type { CreateMeetingPayload, Meeting } from "../../interfaces";
import { JsonViewer } from "./components/JsonViewer";
import { MeetingForm } from "./components/MeetingForm";
import { MeetingList } from "./components/MeetingList";

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (data && typeof data === "object" && "error" in data) {
      return String(data.error);
    }
    if (err.message) {
      return err.message;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadMeetings = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load meetings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const handleCreate = async (payload: CreateMeetingPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      await createMeeting(payload);
      await loadMeetings();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create meeting"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteMeeting(id);
      await loadMeetings();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete meeting"));
    }
  };

  return (
    <div className="meetings-page">
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="layout">
        <section className="panel">
          <h2>Schedule a meeting</h2>
          <MeetingForm onSubmit={handleCreate} submitting={submitting} />
        </section>

        <section className="panel">
          <h2>Scheduled meetings</h2>
          {loading ? (
            <p className="muted">Loading meetings…</p>
          ) : (
            <MeetingList meetings={meetings} onDelete={handleDelete} />
          )}
        </section>

        <section className="panel panel-wide">
          <h2>Meetings JSON</h2>
          <p className="muted">
            Live response from <code>GET /api/meetings</code> — updates when
            meetings are created or deleted.
          </p>
          <JsonViewer meetings={meetings} loading={loading} />
        </section>
      </div>
    </div>
  );
}
