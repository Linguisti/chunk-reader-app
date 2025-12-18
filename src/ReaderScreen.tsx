import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import SentenceFrame from "./components/SentenceFrame";
import ControlsBar from "./components/ControlsBar";

type Chunk = { en: string; ko: string };
type Sentence = { sentence_id: number; chunks: Chunk[] };
type Passage = { passage_id: string; title: string; sentences: Sentence[] };

type IndexRow = { id: string; title: string };

type PassageRow = {
  passage_id: string;
  title: string;
  sentence_id: string;   // CSV라 string으로 들어옴
  chunk_index: string;   // CSV라 string으로 들어옴
  en: string;
  ko: string;
};

const DEFAULT_PASSAGE_ID = "demo-1"; // MVP에서는 고정. 나중에 목록 선택 UI가 생기면 바뀜.

async function fetchText(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.text();
}

function parseCsv<T>(csvText: string): T[] {
  const result = Papa.parse<T>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.errors?.length) {
    // 첫 에러만 던져도 충분 (MVP)
    throw new Error(result.errors[0].message);
  }
  return result.data;
}

function buildPassageFromRows(rows: PassageRow[]): Passage {
  if (rows.length === 0) throw new Error("Empty passage CSV");

  const passage_id = rows[0].passage_id;
  const title = rows[0].title;

  // sentence_id, chunk_index 기준으로 정렬 (CSV 순서가 꼬여도 안정적으로)
  const sorted = [...rows].sort((a, b) => {
    const sa = Number(a.sentence_id);
    const sb = Number(b.sentence_id);
    if (sa !== sb) return sa - sb;
    return Number(a.chunk_index) - Number(b.chunk_index);
  });

  const sentenceMap = new Map<number, Chunk[]>();

  for (const r of sorted) {
    const sid = Number(r.sentence_id);
    if (!Number.isFinite(sid)) continue;

    const chunk: Chunk = { en: r.en ?? "", ko: r.ko ?? "" };
    if (!sentenceMap.has(sid)) sentenceMap.set(sid, []);
    sentenceMap.get(sid)!.push(chunk);
  }

  const sentences: Sentence[] = Array.from(sentenceMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([sid, chunks]) => ({ sentence_id: sid, chunks }));

  return { passage_id, title, sentences };
}

export default function ReaderScreen() {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 리더 상태(기존 그대로)
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(-1);
  const [showKoForChunkIndex, setShowKoForChunkIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);

        // (확장 대비) index.csv를 읽어두되, MVP에서는 DEFAULT_PASSAGE_ID로 로드
        const indexText = await fetchText("/passages/index.csv");
        const indexRows = parseCsv<IndexRow>(indexText);

        const exists = indexRows.some((r) => r.id === DEFAULT_PASSAGE_ID);
        const targetId = exists ? DEFAULT_PASSAGE_ID : (indexRows[0]?.id ?? DEFAULT_PASSAGE_ID);

        const passageText = await fetchText(`/passages/${targetId}.csv`);
        const rows = parseCsv<PassageRow>(passageText);

        const built = buildPassageFromRows(rows);
        setPassage(built);

        // 로드 시 리더 상태 초기화
        setSentenceIndex(0);
        setChunkIndex(-1);
        setShowKoForChunkIndex(null);
      } catch (e: any) {
        setLoadError(e?.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const header = useMemo(() => {
    if (!passage) return { title: "Loading...", progress: "" };
    return {
      title: passage.title,
      progress: `${sentenceIndex + 1} / ${passage.sentences.length}`,
    };
  }, [passage, sentenceIndex]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.title}>Loading…</div>
        </div>
      </div>
    );
  }

  if (loadError || !passage) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.title}>Data Load Error</div>
          <div style={styles.sub}>{loadError ?? "Unknown error"}</div>
        </div>
      </div>
    );
  }

  const currentSentence = passage.sentences[sentenceIndex];
  const lastChunkIndex = currentSentence.chunks.length - 1;

  const isSentenceComplete = chunkIndex >= lastChunkIndex;
  const canTranslate = chunkIndex >= 0;
  const canNext = isSentenceComplete && sentenceIndex < passage.sentences.length - 1;

  function onTapReveal() {
    if (chunkIndex >= lastChunkIndex) return;
    const next = chunkIndex + 1;
    setChunkIndex(next);
    setShowKoForChunkIndex(null);
  }

  function onPressTranslate() {
    if (!canTranslate) return;
    setShowKoForChunkIndex(chunkIndex);
  }

  function onNextSentence() {
    if (!canNext) return;
    setSentenceIndex((i) => i + 1);
    setChunkIndex(-1);
    setShowKoForChunkIndex(null);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>{header.title}</div>
        <div style={styles.sub}>{`Sentence ${header.progress}`}</div>
      </div>

      <SentenceFrame
        chunks={currentSentence.chunks}
        revealedUntil={chunkIndex}
        showKoForIndex={showKoForChunkIndex}
        onTap={onTapReveal}
      />

      <ControlsBar
        canTranslate={canTranslate}
        canNext={canNext}
        onTranslate={onPressTranslate}
        onNext={onNextSentence}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "16px",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 700 },
  sub: { fontSize: 13, opacity: 0.7, marginTop: 4 },
};
