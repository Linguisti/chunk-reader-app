import Papa from "papaparse";

export type Chunk = { en: string; ko: string };
export type Sentence = { sentence_id: number; chunks: Chunk[] };
export type Passage = { passage_id: string; title: string; sentences: Sentence[] };

export type IndexRow = { id: string; title: string };

export type PassageRow = {
  passage_id: string;
  title: string;
  sentence_id: string;
  chunk_index: string;
  en: string;
  ko: string;
};

export async function fetchText(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.text();
}

export function parseCsv<T>(csvText: string): T[] {
  const result = Papa.parse<T>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
}

export function buildPassageFromRows(rows: PassageRow[]): Passage {
  if (rows.length === 0) throw new Error("Empty passage CSV");

  const passage_id = rows[0].passage_id;
  const title = rows[0].title;

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

export async function loadIndex(): Promise<IndexRow[]> {
  const text = await fetchText("/passages/index.csv");
  return parseCsv<IndexRow>(text);
}

export async function loadPassage(id: string): Promise<Passage> {
  const passageText = await fetchText(`/passages/${id}.csv`);
  const rows = parseCsv<PassageRow>(passageText);
  return buildPassageFromRows(rows);
}
