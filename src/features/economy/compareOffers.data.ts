import type { Application } from "./applicationStatus.data";

/** Each scalar field compared across offers, in display order. */
export const COMPARE_ROWS: { label: string; get: (a: Application) => string }[] = [
  { label: "Salary", get: (a) => a.offer?.salary ?? "—" },
  { label: "Holiday", get: (a) => a.offer?.holiday ?? "—" },
  { label: "Start date", get: (a) => a.offer?.start ?? "—" },
  { label: "Respond by", get: (a) => a.offer?.respondBy ?? "—" },
  { label: "How it pays", get: (a) => a.offer?.market ?? "—" },
];
