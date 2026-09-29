import { routes } from "../../app/routeMap";

/** The tabs of the writer workspace at `/magazine/writer`, in display order. */
export type WriterTab = "work" | "pitches" | "submissions" | "payments";

export const WRITER_TAB_IDS: WriterTab[] = [
  "work",
  "pitches",
  "submissions",
  "payments",
];

export const WRITER_TAB_LABEL_KEYS: Record<WriterTab, string> = {
  work: "magazine:writer.tabs.work",
  pitches: "magazine:writer.tabs.pitches",
  submissions: "magazine:writer.tabs.submissions",
  payments: "magazine:writer.tabs.payments",
};

/** The search param that selects a tab, so a tab can be linked to directly. */
export const WRITER_TAB_PARAM = "tab";

/**
 * Read a `?tab=` value. Anything missing or unknown opens "Your work", the
 * workspace's landing tab, so a stale or hand-typed link still lands somewhere.
 */
export function parseWriterTab(value: string | null): WriterTab {
  return WRITER_TAB_IDS.find((tabId) => tabId === value) ?? "work";
}

/**
 * The workspace opened on one tab. `/magazine/pitches` (the old standalone
 * story-submission tracker) redirects to `writerTabHref("submissions")`.
 */
export function writerTabHref(tab: WriterTab): string {
  return `${routes.magazineWriter}?${WRITER_TAB_PARAM}=${tab}`;
}
