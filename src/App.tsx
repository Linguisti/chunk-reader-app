import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import ReaderScreen, { type ReaderMode } from "./ReaderScreen";
import PassageListScreen from "./components/PassageListScreen";
import ModeSelectScreen from "./components/ModeSelectScreen";
import { type IndexRow, loadIndex } from "./passageData";

type View = "list" | "mode" | "read";

export default function App() {
  const [view, setView] = useState<View>("list");
  const [indexRows, setIndexRows] = useState<IndexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ReaderMode | null>(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const rows = await loadIndex();
        if (canceled) return;
        setIndexRows(rows);
      } catch (e: any) {
        if (canceled) return;
        setLoadError(e?.message ?? "Failed to load passages");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  function handleSelectPassage(id: string) {
    setSelectedPassageId(id);
    setSelectedMode(null);
    setView("mode");
  }

  function handleSelectMode(mode: ReaderMode) {
    setSelectedMode(mode);
    setView("read");
  }

  function handleBackToList() {
    setView("list");
    setSelectedPassageId(null);
    setSelectedMode(null);
  }

  function handleBackFromReader() {
    setView("mode");
    setSelectedMode(null);
  }

  const selectedPassageTitle = indexRows.find((r) => r.id === selectedPassageId)?.title ?? "";

  return (
    <div style={styles.shell}>
      {view === "list" ? (
        <PassageListScreen
          passages={indexRows}
          loading={loading}
          error={loadError}
          onSelect={handleSelectPassage}
        />
      ) : null}

      {view === "mode" && selectedPassageId ? (
        <ModeSelectScreen title={selectedPassageTitle} onBack={handleBackToList} onSelectMode={handleSelectMode} />
      ) : null}

      {view === "read" && selectedPassageId && selectedMode ? (
        <ReaderScreen passageId={selectedPassageId} mode={selectedMode} onBack={handleBackFromReader} />
      ) : null}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: { width: "100%" },
};
