import type { CSSProperties } from "react";

type Props = {
  canPrev: boolean;
  canTranslate: boolean;
  canNext: boolean;
  onPrev: () => void;
  onTranslate: () => void;
  onNext: () => void;
};

export default function ControlsBar({
  canPrev,
  canTranslate,
  canNext,
  onPrev,
  onTranslate,
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
        style={{ ...styles.btn, ...(canTranslate ? {} : styles.btnDisabled) }}
        disabled={!canTranslate}
        onClick={(e) => {
          e.stopPropagation(); // SentenceFrame 탭과 충돌 방지
          onTranslate();
        }}
      >
        해석 보기
      </button>

      <button
        style={{ ...styles.btn, ...(canNext ? {} : styles.btnDisabled) }}
        disabled={!canNext}
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      >
        다음 문장 ▶
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
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
};
