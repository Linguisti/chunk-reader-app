import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReaderScreen, { type ReaderMode } from "./ReaderScreen";
import PassageListScreen from "./components/PassageListScreen";
import ModeSelectScreen from "./components/ModeSelectScreen";
import { type IndexRow, loadIndex } from "./passageData";

type View = "list" | "mode" | "read";
type ThemeKey = "white" | "black" | "pink" | "sky" | "green";

const themes: Record<ThemeKey, { bg: string; text: string }> = {
  white: { bg: "#f7f8fa", text: "#111" },
  black: { bg: "#0f1115", text: "#f5f7fb" },
  pink: { bg: "#ffe6f1", text: "#351220" },
  sky: { bg: "#e5f4ff", text: "#153041" },
  green: { bg: "#e9f7ef", text: "#123022" },
};

const buttonPalette: Record<
  ThemeKey,
  { btnBg: string; btnText: string; btnBorder: string; cardBg: string; cardBorder: string }
> = {
  white: {
    btnBg: "#ffffff",
    btnText: "#111",
    btnBorder: "rgba(0,0,0,0.15)",
    cardBg: "#ffffff",
    cardBorder: "rgba(0,0,0,0.12)",
  },
  black: {
    btnBg: "#1a1d24",
    btnText: "#f5f7fb",
    btnBorder: "rgba(255,255,255,0.25)",
    cardBg: "#1a1d24",
    cardBorder: "rgba(255,255,255,0.2)",
  },
  pink: {
    btnBg: "#ffd6e8",
    btnText: "#30101f",
    btnBorder: "rgba(0,0,0,0.12)",
    cardBg: "#ffeaf5",
    cardBorder: "rgba(0,0,0,0.1)",
  },
  sky: {
    btnBg: "#d6edff",
    btnText: "#112535",
    btnBorder: "rgba(0,0,0,0.12)",
    cardBg: "#e9f5ff",
    cardBorder: "rgba(0,0,0,0.1)",
  },
  green: {
    btnBg: "#d9f0e3",
    btnText: "#123022",
    btnBorder: "rgba(0,0,0,0.12)",
    cardBg: "#e9f7ef",
    cardBorder: "rgba(0,0,0,0.1)",
  },
};

export default function App() {
  const [view, setView] = useState<View>("list");
  const [indexRows, setIndexRows] = useState<IndexRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ReaderMode | null>(null);
  const [themeKey, setThemeKey] = useState<ThemeKey>("white");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSentences, setSelectedSentences] = useState<number[]>([]); // sentence_id list needing help

  const theme = useMemo(() => themes[themeKey], [themeKey]);

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

  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    const palette = buttonPalette[themeKey];
    document.documentElement.style.setProperty("--btn-bg", palette.btnBg);
    document.documentElement.style.setProperty("--btn-text", palette.btnText);
    document.documentElement.style.setProperty("--btn-border", palette.btnBorder);
    document.documentElement.style.setProperty("--card-bg", palette.cardBg);
    document.documentElement.style.setProperty("--card-border", palette.cardBorder);
  }, [theme]);

  function handleSelectPassage(id: string) {
    setSelectedPassageId(id);
    setSelectedMode(null);
    setSelectedSentences([]);
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

  const settingsSlot = (
    <SettingsMenu
      open={settingsOpen}
      themeKey={themeKey}
      onToggle={() => setSettingsOpen((v) => !v)}
      onSelectTheme={(key) => {
        setThemeKey(key);
        setSettingsOpen(false);
      }}
    />
  );

  return (
    <div style={{ ...styles.shell, backgroundColor: theme.bg, color: theme.text }}>
      {view === "list" ? (
        <PassageListScreen
          passages={indexRows}
          loading={loading}
          error={loadError}
          onSelect={handleSelectPassage}
          rightSlot={settingsSlot}
        />
      ) : null}

      {view === "mode" && selectedPassageId ? (
        <ModeSelectScreen
          title={selectedPassageTitle}
          onBack={handleBackToList}
          onSelectMode={handleSelectMode}
          rightSlot={settingsSlot}
          chunkEnabled={selectedSentences.length > 0}
        />
      ) : null}

      {view === "read" && selectedPassageId && selectedMode ? (
        <ReaderScreen
          passageId={selectedPassageId}
          mode={selectedMode}
          onBack={handleBackFromReader}
          rightSlot={settingsSlot}
          selectedSentences={selectedSentences}
          onUpdateSelection={setSelectedSentences}
          onChangeMode={(mode) => {
            setSelectedMode(mode);
            setView("read");
          }}
        />
      ) : null}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: { width: "100%", minHeight: "100vh", position: "relative" },
};

function labelForTheme(key: ThemeKey): string {
  switch (key) {
    case "white":
      return "화이트";
    case "black":
      return "블랙";
    case "pink":
      return "핑크";
    case "sky":
      return "스카이";
    case "green":
      return "그린";
    default:
      return key;
  }
}

type SettingsMenuProps = {
  open: boolean;
  themeKey: ThemeKey;
  onToggle: () => void;
  onSelectTheme: (key: ThemeKey) => void;
};

function SettingsMenu({ open, themeKey, onToggle, onSelectTheme }: SettingsMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onToggle();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onToggle]);

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <button
        style={{
          border: "1px solid var(--btn-border)",
          background: "var(--btn-bg)",
          color: "var(--btn-text)",
          borderRadius: 999,
          padding: "10px 12px",
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
        onClick={onToggle}
        aria-label="설정 열기"
      >
        ⚙
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            border: "1px solid var(--card-border)",
            background: "var(--card-bg)",
            color: "inherit",
            borderRadius: 12,
            padding: 12,
            minWidth: 180,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            zIndex: 20,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>테마</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.keys(themes).map((key) => {
              const tKey = key as ThemeKey;
              const isActive = tKey === themeKey;
              return (
                <button
                  key={tKey}
                  style={{
                    borderRadius: 10,
                    padding: "10px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    backgroundColor: themes[tKey].bg,
                    color: themes[tKey].text,
                    border: isActive ? `2px solid ${themes[tKey].text}` : "1px solid rgba(0,0,0,0.1)",
                  }}
                  onClick={() => onSelectTheme(tKey)}
                >
                  {labelForTheme(tKey)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
