import { apiGet } from "../../../shared/api/client";

export type RespondsWithin = "day" | "fewDays" | "week";

/** One chip's pull, keyed by the raw `requestReason` the chip itself writes
 *  through `reasonValue()`. Matching on the raw string means a renamed custom
 *  chip starts fresh instead of inheriting the old chip's hellos. */
export interface NowChipInsight {
  reason: string;
  count: number;
  /** Newest hello for this reason over ALL time, so a chip nobody has used in
   *  months can say how long it has been. Null when nobody ever has. */
  lastHelloAt: string | null;
}

export interface NowInsights {
  windowDays: number;
  hellos: number;
  replies: number;
  perChip: NowChipInsight[];
  nowUpdatedAt: string | null;
  history: { text: string; startedAt: string; endedAt: string }[];
}

/** The caller's own Now card figures. Owner-only: the endpoint takes no slug. */
export const getNowInsights = (signal?: AbortSignal) =>
  apiGet<NowInsights>(
    "/profiles/me/now-insights",
    undefined,
    undefined,
    signal,
  );
