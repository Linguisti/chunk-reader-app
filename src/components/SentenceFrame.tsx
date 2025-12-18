import React from "react";
import ChunkItem from "./ChunkItem";

type Chunk = { en: string; ko: string };

type Props = {
  chunks: Chunk[];
  revealedUntil: number; // -1 ~ last
  showKoForIndex: number | null;
  onTap: () => void;
};

export default function SentenceFrame({
  chunks,
  revealedUntil,
  showKoForIndex,
  onTap,
}: Props) {
  const visibleChunks = revealedUntil >= 0 ? chunks.slice(0, revealedUntil + 1) : [];

  return (
    <div style={styles.outer}>
      <div
        style={styles.frame}
        onClick={onTap}
        role="button"
        aria-label="Reveal next chunk"
      >
        {visibleChunks.length === 0 ? (
          <div style={styles.placeholder}>Tap anywhere to reveal the next chunk.</div>
        ) : (
          <div style={styles.list}>
            {visibleChunks.map((c, i) => (
              <ChunkItem key={i} en={c.en} ko={c.ko} showKo={showKoForIndex === i} />
            ))}
          </div>
        )}

        <div style={styles.hint}>Tap to reveal next chunk</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // 좌우 중앙 정렬만 담당
  outer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },

  // 문장 프레임: 가로만 중앙, 세로는 위에서 아래로 자연스럽게
  frame: {
    width: "100%",
    maxWidth: 640,
    margin: "0 auto",

    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 16,
    padding: 16,

    // 너무 커서 비어보이면 거슬릴 수 있으니 최소 높이만 유지
    minHeight: 280,

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between", // 청크 리스트 위, 힌트 아래
    cursor: "pointer",
    userSelect: "none",
  },

  list: { display: "flex", flexDirection: "column", gap: 10 },

  placeholder: {
    opacity: 0.6,
    fontSize: 14,
    paddingTop: 8,
  },

  hint: {
    opacity: 0.5,
    fontSize: 12,
    paddingTop: 12,
  },
};
