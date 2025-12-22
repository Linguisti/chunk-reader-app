import type { CSSProperties } from "react";
import type { IndexRow } from "../passageData";

type Props = {
  passages: IndexRow[];
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  rightSlot?: React.ReactNode;
};

export default function PassageListScreen({ passages, loading, error, onSelect, rightSlot }: Props) {
  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <div />
        {rightSlot ? <div style={styles.right}>{rightSlot}</div> : null}
      </div>
      <div style={styles.header}>
        <div style={styles.title}>Passages</div>
        <div style={styles.sub}>읽을 지문을 선택하세요.</div>
      </div>

      {loading ? <div style={styles.state}>목록을 불러오는 중…</div> : null}
      {error ? <div style={{ ...styles.state, color: "#c00" }}>{error}</div> : null}

      <div style={styles.list}>
        {passages.map((p) => (
          <button key={p.id} style={styles.card} onClick={() => onSelect(p.id)}>
            <div style={styles.cardTitle}>{p.title}</div>
            <div style={styles.cardMeta}>ID: {p.id}</div>
          </button>
        ))}
      </div>

      {!loading && passages.length === 0 && !error ? (
        <div style={styles.state}>등록된 지문이 없습니다.</div>
      ) : null}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { width: "100%", maxWidth: 720, margin: "0 auto", padding: 16 },
  top: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  right: { display: "flex", alignItems: "center", gap: 8 },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 700 },
  sub: { fontSize: 14, opacity: 0.7, marginTop: 4 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    textAlign: "left",
    borderRadius: 12,
    padding: "14px 16px",
    border: "1px solid var(--card-border, rgba(0,0,0,0.1))",
    background: "var(--card-bg, #fff)",
    color: "inherit",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  cardTitle: { fontSize: 16, fontWeight: 700 },
  cardMeta: { fontSize: 13, opacity: 0.65, marginTop: 4 },
  state: { fontSize: 14, opacity: 0.75, marginTop: 8 },
};
