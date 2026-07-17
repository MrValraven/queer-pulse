import type { Application } from "./applicationStatus.data";

/** Each scalar field compared across offers, in display order. */
export const COMPARE_ROWS: {
  labelKey: string;
  get: (a: Application) => string;
}[] = [
  { labelKey: "economy:compareRow.salary", get: (a) => a.offer?.salary ?? "—" },
  {
    labelKey: "economy:compareRow.holiday",
    get: (a) => a.offer?.holiday ?? "—",
  },
  {
    labelKey: "economy:compareRow.startDate",
    get: (a) => a.offer?.start ?? "—",
  },
  {
    labelKey: "economy:compareRow.respondBy",
    get: (a) => a.offer?.respondBy ?? "—",
  },
  {
    labelKey: "economy:compareRow.howItPays",
    get: (a) => a.offer?.market ?? "—",
  },
];
