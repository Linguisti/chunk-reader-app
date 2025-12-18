type Props = {
  canTranslate: boolean;
  canNext: boolean;
  onTranslate: () => void;
  onNext: () => void;
};

export default function ControlsBar({ canTranslate, canNext, onTranslate, onNext }: Props) {
  return (
    <div style={styles.bar}>
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

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    padding: "12px 12px",
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
