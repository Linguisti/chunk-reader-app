import type { CSSProperties } from "react";

type Props = {
  en: string;
  ko: string;
  showKo: boolean;
};

export default function ChunkItem({ en, ko, showKo }: Props) {
  return (
    <div style={styles.block}>
      <div style={styles.en}>{en}</div>
      {showKo ? <div style={styles.ko}>{ko}</div> : null}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  block: { display: "flex", flexDirection: "column", gap: 6 },
  en: { fontSize: 20, fontWeight: 600, lineHeight: 1.4 },
  ko: {
    fontSize: 14,
    lineHeight: 1.35,
    opacity: 0.85,
    borderLeft: "3px solid rgba(0,0,0,0.2)",
    paddingLeft: 10,
  },
};
