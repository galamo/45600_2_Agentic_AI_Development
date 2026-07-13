import MeetingsPage from "./features/meetings";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Lab 22 — Meeting Scheduler</h1>
        <p className="subtitle">
          Schedule meetings in the UI; data is persisted to a JSON file on the
          server and shown below in real time.
        </p>
      </header>
      <main>
        <MeetingsPage />
      </main>
    </div>
  );
}
