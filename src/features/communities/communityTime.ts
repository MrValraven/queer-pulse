import { useCallback } from "react";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { relativeAgo } from "../../shared/lib/relativeAgo";

/** Anything a community surface renders a "when" for: a post, a reply, a
 *  thread, a join request, a report. Live rows carry `createdAt`; demo mock
 *  rows carry a pre-authored `time` string instead. */
export interface CommunityTimestamped {
  createdAt?: string;
  time?: string;
}

const AGO_KEYS = {
  justNow: "communities:common.justNow",
  unknown: "communities:common.unknownTime",
};

/**
 * Turn a community row's timestamp into words, in the viewer's language.
 *
 * The adapters used to bake `"4mo"` / `"just now"` into `time` at map time,
 * which meant a Portuguese reader saw "há 4mo" (an English token inside a
 * translated frame) and an open tab kept showing the age the post had when it
 * loaded. Live rows now carry the raw ISO `createdAt` and this hook formats
 * them here, through `Intl.RelativeTimeFormat` (`useFormat().relativeTime`).
 *
 * Two flavours, because the surfaces differ:
 * - `ago` for feeds that read as "{time} ago" (Pulse, hub cards, mod queues).
 * - `plain` for rows that render the phrase bare (the thread header).
 *
 * Demo mock rows, which have no timestamp, keep rendering their authored
 * `time` string exactly as they did before.
 */
export function useCommunityTime() {
  const { t } = useTranslation();
  const fmt = useFormat();

  const ago = useCallback(
    (item: CommunityTimestamped): string => {
      if (item.createdAt) return relativeAgo(item.createdAt, t, fmt, AGO_KEYS);
      if (!item.time) return "";
      // The standalone "just now" phrase must not be wrapped into "just now ago".
      const justNow = t("communities:common.justNow");
      return item.time === justNow
        ? justNow
        : t("communities:common.timeAgo", { time: item.time });
    },
    [t, fmt],
  );

  const plain = useCallback(
    (item: CommunityTimestamped): string =>
      item.createdAt
        ? relativeAgo(item.createdAt, t, fmt, AGO_KEYS)
        : (item.time ?? ""),
    [t, fmt],
  );

  return { ago, plain };
}
