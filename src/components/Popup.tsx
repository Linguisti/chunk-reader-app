import type { CSSProperties } from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  actions: { label: string; onClick: () => void }[];
  onClose: () => void;
};

export default function Popup({ open, title, message, actions, onClose }: Props) {
  if (!open) return null;
  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {title ? <div style={styles.title}>{title}</div> : null}
        {message ? <div style={styles.message}>{message}</div> : null}
        <div style={styles.actions}>
          {actions.map((a) => (
            <button key={a.label} style={styles.btn} onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 16,
  },
  modal: {
    background: "#fff",
    color: "#111",
    borderRadius: 12,
    padding: 16,
    minWidth: 260,
    maxWidth: 360,
    boxShadow: "0 6px 20px rgba(0,0,0,0.16)",
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  message: { fontSize: 14, lineHeight: 1.5, marginBottom: 12 },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" },
  btn: {
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    color: "#111",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
  },
};
