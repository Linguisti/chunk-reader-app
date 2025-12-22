import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import SentenceFrame from "./components/SentenceFrame";
import ControlsBar from "./components/ControlsBar";
import FullPassageView from "./components/FullPassageView";
import type { Passage } from "./passageData";
import { loadPassage } from "./passageData";

export type ReaderMode = "chunk" | "full";

type Props = {
  passageId: string;
  mode: ReaderMode;
  onBack: () => void;
  rightSlot?: React.ReactNode;
};

export default function ReaderScreen({ passageId, mode, onBack, rightSlot }: Props) {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(-1);
  const [showKoForChunkIndex, setShowKoForChunkIndex] = useState<number | null>(null);

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
    const progress = `Sentence ${sentenceIndex + 1} / ${passage.sentences.length}`;
    return {
      title: passage.title,
      sub: mode === "chunk" ? progress : "전체 보기",
    };
  }, [passage, sentenceIndex, mode]);

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

  const currentSentence = safePassage.sentences[sentenceIndex];
  const lastChunkIndex = currentSentence.chunks.length - 1;

  const isSentenceComplete = chunkIndex >= lastChunkIndex;
  const canNext =
    chunkIndex < 0 ||
    (chunkIndex >= 0 && chunkIndex < lastChunkIndex) ||
    (isSentenceComplete && sentenceIndex < safePassage.sentences.length - 1);
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

    setSentenceIndex((i) => {
      const nextSentence = Math.min(safePassage.sentences.length - 1, i + 1);
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
        const prevSentence = safePassage.sentences[newIndex];
        setChunkIndex(prevSentence.chunks.length - 1);
        setShowKoForChunkIndex(null);
        return newIndex;
      });
    }
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
        <FullPassageView passage={safePassage} />
      )}
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
};
