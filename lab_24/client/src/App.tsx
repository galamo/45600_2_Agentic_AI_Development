import MeetingsPage from "./features/meetings";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Lab 24 — Meeting Scheduler</h1>
        <p className="subtitle">
          Schedule meetings, manage the list, and inspect the live API JSON
          returned from the backend.
        </p>
      </header>
      <main>
        <MeetingsPage />
      </main>
    </div>
  );
}
