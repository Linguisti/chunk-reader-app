import type { CSSProperties } from "react";
import type { ReaderMode } from "../ReaderScreen";

type Props = {
  title: string;
  onBack: () => void;
  onSelectMode: (mode: ReaderMode) => void;
  rightSlot?: React.ReactNode;
};

export default function ModeSelectScreen({ title, onBack, onSelectMode, rightSlot }: Props) {
  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <button style={styles.backBtn} onClick={onBack}>
          ← 목록으로
        </button>
        {rightSlot ? <div style={styles.right}>{rightSlot}</div> : null}
      </div>

      <div style={styles.header}>
        <div style={styles.title}>{title}</div>
        <div style={styles.sub}>읽기 모드를 선택하세요.</div>
      </div>

      <div style={styles.actions}>
        <button style={styles.modeBtn} onClick={() => onSelectMode("chunk")}>
          청크 읽기
          <span style={styles.modeDesc}>문장을 한 덩어리씩 확인</span>
        </button>
        <button style={styles.modeBtn} onClick={() => onSelectMode("full")}>
          전체 읽기
          <span style={styles.modeDesc}>지문 전체를 한 번에 보기</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { width: "100%", maxWidth: 720, margin: "0 auto", padding: 16 },
  top: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 },
  right: { display: "flex", alignItems: "center", gap: 8 },
  backBtn: {
    border: "1px solid var(--btn-border, rgba(0,0,0,0.1))",
    background: "var(--btn-bg, #fff)",
    color: "var(--btn-text, inherit)",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
    marginBottom: 12,
  },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 700 },
  sub: { fontSize: 14, opacity: 0.7, marginTop: 4 },
  actions: { display: "flex", flexDirection: "column", gap: 12 },
  modeBtn: {
    textAlign: "left",
    borderRadius: 12,
    padding: "14px 16px",
    border: "1px solid var(--card-border, rgba(0,0,0,0.1))",
    background: "var(--card-bg, #fff)",
    color: "inherit",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
  },
  modeDesc: { display: "block", fontSize: 13, opacity: 0.7, marginTop: 4, fontWeight: 500 },
};
