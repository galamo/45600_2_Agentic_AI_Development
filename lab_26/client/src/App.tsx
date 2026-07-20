import "./App.css";
import { SearchSection } from "./components/SearchSection";
import { SettingsDropdown } from "./components/SettingsDropdown";
import { UploadSection } from "./components/UploadSection";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>Lab 26 — Image RAG Search (LangGraph)</h1>
          <SettingsDropdown />
        </div>
        <p className="subtitle">
          Same visual RAG as Lab 12, orchestrated with LangGraph: upload flows
          through an indexing graph and search flows through a retrieval +
          reranking graph powered by LangChain agents.
        </p>
      </header>

      <main className="layout">
        <UploadSection />
        <SearchSection />
      </main>
    </div>
  );
}
