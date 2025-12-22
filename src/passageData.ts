export type Chunk = { en: string; ko: string };
export type Sentence = { sentence_id: number; chunks: Chunk[] };
export type Passage = { passage_id: string; title: string; sentences: Sentence[] };

export type IndexRow = { id: string; title: string };

export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function loadIndex(): Promise<IndexRow[]> {
  return fetchJson<IndexRow[]>("/passages/index.json");
}

export async function loadPassage(id: string): Promise<Passage> {
  return fetchJson<Passage>(`/passages/${id}.json`);
}
