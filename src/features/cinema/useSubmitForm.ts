import { useState } from "react";

export interface ContentNote {
  topic: string;
  detail: string;
  timecode: string;
}

export interface SubmitDraft {
  // Step 1 — the film
  title: string;
  originalTitle: string;
  year: string;
  runtime: string;
  country: string;
  language: string;
  format: string;
  synopsis: string;
  statement: string;
  identities: string[];
  notes: ContentNote[];
  poster: string | null;
  screener: string;
  // Step 2 — accessibility
  captions: string;
  captionLangs: string[];
  ad: string;
  signTracks: string[];
  accessNotes: string;
  // Step 3 — rights
  territory: string;
  term: string;
  rightsConfirmed: boolean;
  // Step 4 — revenue
  revenue: string;
  rentPrice: string;
  buyPrice: string;
  // Step 5
  agreed: boolean;
}

const EMPTY_NOTE: ContentNote = { topic: "", detail: "", timecode: "" };

const INITIAL: SubmitDraft = {
  title: "",
  originalTitle: "",
  year: "",
  runtime: "",
  country: "Portugal",
  language: "Portuguese",
  format: "documentary",
  synopsis: "",
  statement: "",
  identities: [],
  notes: [{ ...EMPTY_NOTE }, { ...EMPTY_NOTE }],
  poster: null,
  screener: "",
  captions: "have",
  captionLangs: [],
  ad: "help",
  signTracks: [],
  accessNotes: "",
  territory: "worldwide",
  term: "1yr",
  rightsConfirmed: false,
  revenue: "free",
  rentPrice: "",
  buyPrice: "",
  agreed: false,
};

export type SubmitForm = ReturnType<typeof useSubmitForm>;

/** Local state for the film-submission wizard: field setters, multi-select
 * toggles, and content-note row helpers. All client-side, no persistence. */
export function useSubmitForm() {
  const [draft, setDraft] = useState<SubmitDraft>(INITIAL);

  const set = <K extends keyof SubmitDraft>(key: K, value: SubmitDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggle = (
    key: "identities" | "captionLangs" | "signTracks",
    value: string,
  ) =>
    setDraft((d) => {
      const list = d[key];
      return {
        ...d,
        [key]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });

  const setNote = (i: number, patch: Partial<ContentNote>) =>
    setDraft((d) => ({
      ...d,
      notes: d.notes.map((n, j) => (j === i ? { ...n, ...patch } : n)),
    }));
  const addNote = () =>
    setDraft((d) => ({ ...d, notes: [...d.notes, { ...EMPTY_NOTE }] }));
  const removeNote = (i: number) =>
    setDraft((d) => ({ ...d, notes: d.notes.filter((_, j) => j !== i) }));

  const reset = () => setDraft(INITIAL);

  return { draft, set, toggle, setNote, addNote, removeNote, reset };
}
