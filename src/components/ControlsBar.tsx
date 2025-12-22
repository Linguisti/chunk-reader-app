import type { CSSProperties } from "react";

type Props = {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function ControlsBar({
  canPrev,
  canNext,
  onPrev,
  onNext,
}: Props) {
  return (
    <div style={styles.bar}>
      <button
        style={{ ...styles.btn, ...(canPrev ? {} : styles.btnDisabled) }}
        disabled={!canPrev}
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
      >
        ◀ 이전 청크
      </button>

      <button
        style={{ ...styles.btn, ...(canNext ? {} : styles.btnDisabled) }}
        disabled={!canNext}
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      >
        다음 ▶
      </button>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  bar: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },
  btn: {
    flex: 1.2,
    padding: "12px 10px",
    borderRadius: 12,
    border: "1px solid var(--btn-border, rgba(0,0,0,0.12))",
    background: "var(--btn-bg, #fff)",
    color: "var(--btn-text, inherit)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
};
