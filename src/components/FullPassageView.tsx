import type { CSSProperties } from "react";
import type { Passage } from "../passageData";

type Props = {
  passage: Passage;
  selectedSentenceIds: number[];
  onToggle: (sentenceId: number) => void;
};

export default function FullPassageView({ passage, selectedSentenceIds, onToggle }: Props) {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>{passage.title}</div>
      <div style={styles.textBlock}>
        {passage.sentences.map((s, idx) => {
          const plain = buildPlainSentence(s);
          const selected = selectedSentenceIds.includes(s.sentence_id);
          return (
            <span
              key={s.sentence_id}
              style={{
                ...styles.sentenceInline,
                ...(selected ? styles.selected : {}),
              }}
              onClick={() => onToggle(s.sentence_id)}
              aria-label={`문장 ${idx + 1}`}
            >
              {plain}{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function buildPlainSentence(s: Passage["sentences"][number]): string {
  return s.chunks
    .map((c) => c.en.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 8,
    background: "#fff",
    color: "#111",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.1)",
    padding: "16px 18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  textBlock: { fontSize: 16, lineHeight: 1.65, color: "#111", wordBreak: "keep-all" },
  sentenceInline: {
    display: "inline",
    cursor: "pointer",
    padding: "2px 4px",
    marginRight: 4,
    borderRadius: 6,
    transition: "background-color 120ms ease, color 120ms ease",
  },
  selected: { background: "#fff7c2" },
};
