import type { CSSProperties } from "react";
import type { Passage } from "../passageData";

type Props = {
  passage: Passage;
};

export default function FullPassageView({ passage }: Props) {
  const plainText = buildPlainText(passage);

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>{passage.title}</div>
      <div style={styles.text}>{plainText}</div>
    </div>
  );
}

function buildPlainText(passage: Passage): string {
  const sentences = passage.sentences.map((s) =>
    s.chunks
      .map((c) => c.en.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  return sentences.filter(Boolean).join(" ");
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 8,
    background: "#fff",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.1)",
    padding: "16px 18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  text: {
    fontSize: 16,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    color: "#111",
  },
};
