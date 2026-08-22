import type { TFunction } from "../../shared/i18n/types";
import type { Application } from "./applicationStatus.types";

/**
 * Filler for an offer field the employer left blank. Mirrors the `t`-optional
 * fallback pattern in `api/jobs.adapters.ts`: call sites that have a `t` get
 * the reader's language, and one that has not been threaded yet still gets a
 * real word instead of an em dash (a dash a screen reader simply skips).
 */
const NOT_SET_KEY = "economy:placeholder.notSet";
const NOT_SET_FALLBACK = "Not set";

const notSet = (t?: TFunction) => (t ? t(NOT_SET_KEY) : NOT_SET_FALLBACK);

/** Each scalar field compared across offers, in display order. */
export const COMPARE_ROWS: {
  labelKey: string;
  get: (a: Application, t?: TFunction) => string;
}[] = [
  {
    labelKey: "economy:compareRow.salary",
    get: (a, t) => a.offer?.salary ?? notSet(t),
  },
  {
    labelKey: "economy:compareRow.holiday",
    get: (a, t) => a.offer?.holiday ?? notSet(t),
  },
  {
    labelKey: "economy:compareRow.startDate",
    get: (a, t) => a.offer?.start ?? notSet(t),
  },
  {
    labelKey: "economy:compareRow.respondBy",
    get: (a, t) => a.offer?.respondBy ?? notSet(t),
  },
  {
    labelKey: "economy:compareRow.howItPays",
    get: (a, t) => a.offer?.market ?? notSet(t),
  },
];
