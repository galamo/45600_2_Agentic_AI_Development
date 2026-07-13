import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  createMeeting,
  deleteMeeting,
  fetchMeetings,
  fetchRawJson,
} from "../../api/meetings";
import type { CreateMeetingPayload, Meeting } from "../../interfaces";
import { JsonViewer } from "./components/JsonViewer";
import { MeetingForm } from "./components/MeetingForm";
import { MeetingList } from "./components/MeetingList";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [rawJson, setRawJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [meetingsData, jsonData] = await Promise.all([
        fetchMeetings(),
        fetchRawJson(),
      ]);
      setMeetings(meetingsData);
      setRawJson(jsonData);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : err instanceof Error
            ? err.message
            : "Failed to load meetings";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (payload: CreateMeetingPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      await createMeeting(payload);
      await loadData();
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : err instanceof Error
            ? err.message
            : "Failed to create meeting";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteMeeting(id);
      await loadData();
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : err instanceof Error
            ? err.message
            : "Failed to delete meeting";
      setError(message);
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
          <h2>Upcoming meetings</h2>
          {loading ? (
            <p className="muted">Loading meetings…</p>
          ) : (
            <MeetingList meetings={meetings} onDelete={handleDelete} />
          )}
        </section>

        <section className="panel panel-wide">
          <h2>Server JSON (meetings.json)</h2>
          <p className="muted">
            Live contents of the JSON file stored on the server.
          </p>
          <JsonViewer rawJson={rawJson} loading={loading} />
        </section>
      </div>
    </div>
  );
}
