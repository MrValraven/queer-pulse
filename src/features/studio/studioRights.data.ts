/**
 * The three promise cards at the top of the Rights & takedown page. Chrome
 * (Pattern A) — resolved via `t(titleKey)` / `t(bodyKey)` in the component.
 */
export interface RightsPromise {
  key: string;
  titleKey: string;
  bodyKey: string;
}

export const PROMISES: RightsPromise[] = [
  {
    key: "window",
    titleKey: "studio:rights.promise.window.title",
    bodyKey: "studio:rights.promise.window.body",
  },
  {
    key: "paid",
    titleKey: "studio:rights.promise.paid.title",
    bodyKey: "studio:rights.promise.paid.body",
  },
  {
    key: "banking",
    titleKey: "studio:rights.promise.banking.title",
    bodyKey: "studio:rights.promise.banking.body",
  },
];

/** A single release row. `state` drives whether it can be taken down. */
export interface Release {
  id: string;
  /** Plain title used in toasts and modal copy. */
  title: string;
  /** Title with the emphasised span split out for the serif <em>. */
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  meta: string;
  licence?: { top: string; sub: string };
  cover: string;
  tint: "coral" | "jade" | "plum";
  state: "live" | "removing";
  /** Days remaining when in the removal window. */
  daysLeft?: number;
}

export const RELEASES: Release[] = [
  {
    id: "cidade-dos-santos",
    title: "Cidade dos santos",
    titlePre: "Cidade dos ",
    titleEm: "santos",
    meta: "Album · 11 tracks · 2026 · 142k plays · €7,100 paid",
    licence: { top: "CC-BY-NC", sub: "licence" },
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    state: "live",
  },
  {
    id: "devocao",
    title: "Devoção",
    titlePre: "Devoção",
    meta: "EP · 9 tracks · 2025 · 61k plays · €3,040 paid",
    licence: { top: "All rights", sub: "reserved" },
    cover:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    state: "live",
  },
  {
    id: "a-beja",
    title: "A Beja",
    titlePre: "A ",
    titleEm: "Beja",
    meta: "Single · 2025 · 28k plays · €1,400 paid",
    licence: { top: "CC-BY-SA", sub: "licence" },
    cover:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    state: "live",
  },
  {
    id: "live-casa-do-comum",
    title: "Live at Casa do Comum",
    titlePre: "Live at ",
    titleEm: "Casa do Comum",
    meta: "Live recording · 2024 · clearance dispute on 2 tracks",
    cover:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    state: "removing",
    daysLeft: 11,
  },
  {
    id: "the-first-sunday",
    title: "The first Sunday",
    titlePre: "The first ",
    titleEm: "Sunday",
    meta: "Single · 2024 · 9k plays · €450 paid",
    licence: { top: "CC-BY-NC", sub: "licence" },
    cover:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    state: "live",
  },
];
