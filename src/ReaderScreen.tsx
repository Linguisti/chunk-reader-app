import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import SentenceFrame from "./components/SentenceFrame";
import ControlsBar from "./components/ControlsBar";
import FullPassageView from "./components/FullPassageView";
import type { Passage } from "./passageData";
import { loadPassage } from "./passageData";
import Popup from "./components/Popup";

export type ReaderMode = "chunk" | "full";

type Props = {
  passageId: string;
  mode: ReaderMode;
  onBack: () => void;
  rightSlot?: React.ReactNode;
  selectedSentences: number[]; // sentence_id list chosen in full view
  onUpdateSelection: (ids: number[]) => void;
  onChangeMode: (mode: ReaderMode) => void;
};

export default function ReaderScreen({
  passageId,
  mode,
  onBack,
  rightSlot,
  selectedSentences,
  onUpdateSelection,
  onChangeMode,
}: Props) {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(-1);
  const [showKoForChunkIndex, setShowKoForChunkIndex] = useState<number | null>(null);
  const [showEndPopup, setShowEndPopup] = useState(false);

  const filteredSentences = useMemo(() => {
    if (!passage) return [];
    return mode === "chunk" && selectedSentences.length
      ? passage.sentences.filter((s) => selectedSentences.includes(s.sentence_id))
      : passage.sentences;
  }, [passage, mode, selectedSentences]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const loaded = await loadPassage(passageId);
        if (canceled) return;
        setPassage(loaded);
        setSentenceIndex(0);
        setChunkIndex(-1);
        setShowKoForChunkIndex(null);
      } catch (e: any) {
        if (canceled) return;
        setLoadError(e?.message ?? "Failed to load data");
        setPassage(null);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [passageId]);

  const header = useMemo(() => {
    if (!passage) return { title: "Loading...", sub: "" };
    const total = mode === "chunk" ? filteredSentences.length : passage.sentences.length;
    const progress = `Sentence ${Math.min(sentenceIndex + 1, total)} / ${total}`;
    return {
      title: passage.title,
      sub: mode === "chunk" ? progress : "전체 보기",
    };
  }, [passage, sentenceIndex, mode, filteredSentences.length]);

  const chunkEnabled = selectedSentences.length > 0;

  useEffect(() => {
    if (sentenceIndex >= filteredSentences.length) {
      setSentenceIndex(0);
      setChunkIndex(-1);
      setShowKoForChunkIndex(null);
    }
  }, [filteredSentences.length, sentenceIndex]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={onBack}>
            ← 목록으로
          </button>
          {rightSlot ? <div style={styles.right}>{rightSlot}</div> : null}
        </div>
        <div style={styles.header}>
          <div style={styles.title}>Loading…</div>
        </div>
      </div>
    );
  }

  if (loadError || !passage) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={onBack}>
            ← 목록으로
          </button>
          {rightSlot ? <div style={styles.right}>{rightSlot}</div> : null}
        </div>
        <div style={styles.header}>
          <div style={styles.title}>Data Load Error</div>
          <div style={styles.sub}>{loadError ?? "Unknown error"}</div>
        </div>
      </div>
    );
  }

  const safePassage = passage as Passage;

  // If chunk mode has no selected sentences, fall back to full list (but UI should disable entry)
  const currentSentence = filteredSentences[sentenceIndex] ?? filteredSentences[0];
  const lastChunkIndex = currentSentence ? currentSentence.chunks.length - 1 : 0;

  const canNext = true; // always allow to surface end popup at final chunk
  const canPrev = chunkIndex > 0 || (chunkIndex === 0 && sentenceIndex > 0);

  function onTapReveal() {
    if (mode !== "chunk") return;
    if (chunkIndex < 0) return;
    setShowKoForChunkIndex(chunkIndex);
  }

  function onNextSentence() {
    if (!canNext) return;
    if (chunkIndex < 0) {
      setChunkIndex(0);
      setShowKoForChunkIndex(null);
      return;
    }

    if (chunkIndex < lastChunkIndex) {
      setChunkIndex((i) => i + 1);
      setShowKoForChunkIndex(null);
      return;
    }

    // reached end of sentence list
    if (sentenceIndex >= filteredSentences.length - 1) {
      setShowEndPopup(true);
      return;
    }

    setSentenceIndex((i) => {
      const nextSentence = Math.min(filteredSentences.length - 1, i + 1);
      setChunkIndex(0);
      setShowKoForChunkIndex(null);
      return nextSentence;
    });
  }

  function onPrevChunk() {
    if (!canPrev) return;
    if (chunkIndex > 0) {
      setChunkIndex((i) => i - 1);
      setShowKoForChunkIndex(null);
      return;
    }

    if (chunkIndex === 0 && sentenceIndex > 0) {
      setSentenceIndex((i) => {
        const newIndex = Math.max(0, i - 1);
        const prevSentence = filteredSentences[newIndex];
        setChunkIndex(prevSentence.chunks.length - 1);
        setShowKoForChunkIndex(null);
        return newIndex;
      });
    }
  }

  function handleSentenceToggle(id: number) {
    if (mode !== "full") return;
    if (selectedSentences.includes(id)) {
      onUpdateSelection(selectedSentences.filter((s) => s !== id));
      return;
    }
    onUpdateSelection([...selectedSentences, id]);
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>
          ← 모드 선택으로
        </button>
        {rightSlot ? <div style={styles.right}>{rightSlot}</div> : null}
      </div>

      <div style={styles.header}>
        <div style={styles.title}>{header.title}</div>
        <div style={styles.sub}>{header.sub}</div>
      </div>

      {mode === "chunk" ? (
        <>
          <SentenceFrame
            chunks={currentSentence.chunks}
            revealedUntil={chunkIndex}
            showKoForIndex={showKoForChunkIndex}
            onTap={onTapReveal}
          />

          <ControlsBar
            canPrev={canPrev}
            canNext={canNext}
            onPrev={onPrevChunk}
            onNext={onNextSentence}
          />
        </>
      ) : (
        <>
          <FullPassageView
            passage={safePassage}
            selectedSentenceIds={selectedSentences}
            onToggle={handleSentenceToggle}
          />
          <div style={styles.fullActions}>
            <button
              style={{
                ...styles.primaryBtn,
                ...(chunkEnabled ? {} : styles.btnDisabled),
              }}
              disabled={!chunkEnabled}
              onClick={() => chunkEnabled && onChangeMode("chunk")}
            >
              선택한 문장만 청크 읽기
            </button>
            {!chunkEnabled ? (
              <div style={styles.helper}>전체 읽기에서 문장을 선택하면 활성화됩니다.</div>
            ) : null}
          </div>
        </>
      )}

      <Popup
        open={showEndPopup}
        title="모든 선택 문장을 확인했어요"
        actions={[
          {
            label: "처음으로",
            onClick: () => {
              setSentenceIndex(0);
              setChunkIndex(0);
              setShowKoForChunkIndex(null);
              setShowEndPopup(false);
            },
          },
          {
            label: "전체 읽기로 가기",
            onClick: () => {
              setShowEndPopup(false);
              onChangeMode("full");
            },
          },
        ]}
        onClose={() => setShowEndPopup(false)}
      />
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "16px 16px 28px",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 },
  right: { display: "flex", alignItems: "center", gap: 8 },
  backBtn: {
    border: "1px solid var(--btn-border, rgba(0,0,0,0.12))",
    background: "var(--btn-bg, #fff)",
    color: "var(--btn-text, inherit)",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
  },
  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 700 },
  sub: { fontSize: 13, opacity: 0.7, marginTop: 4 },
  fullActions: { marginTop: 12, display: "flex", flexDirection: "column", gap: 6 },
  primaryBtn: {
    border: "1px solid var(--btn-border, rgba(0,0,0,0.12))",
    background: "var(--btn-bg, #fff)",
    color: "var(--btn-text, inherit)",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  btnDisabled: { opacity: 0.45, cursor: "not-allowed" },
  helper: { fontSize: 13, opacity: 0.65 },
};
