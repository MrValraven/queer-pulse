// src/features/messages/useEmojiDataset.ts
import { useEffect, useState } from "react";
import type { EmojiEntry, EmojiGroupKey } from "./emoji.data";

export interface EmojiDataset {
  entries: EmojiEntry[];
  groupOrder: EmojiGroupKey[];
}

export type EmojiDatasetState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; dataset: EmojiDataset };

/**
 * Loads `emoji.data.ts` (1,914 entries, ~81KB gzipped) through a dynamic
 * `import()` the first time the picker mounts, so the chunk is fetched on
 * first open rather than folded into the composer's own bundle. Never
 * statically imported anywhere — that would defeat the whole point of
 * splitting it out.
 *
 * Re-runs on every mount (the picker unmounts when the popover closes) but
 * the browser's module cache makes every load after the first a no-op fetch,
 * so reopening the picker resolves instantly.
 */
export function useEmojiDataset(): EmojiDatasetState {
  const [state, setState] = useState<EmojiDatasetState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    // No `setState({ status: "loading" })` here: the initial state is
    // already "loading" and this effect only ever runs once (empty deps —
    // the picker mounts fresh each time the popover opens), so there is
    // nothing to reset.
    import("./emoji.data")
      .then((module) => {
        if (cancelled) return;
        setState({
          status: "ready",
          dataset: {
            entries: module.EMOJI_DATA,
            groupOrder: module.EMOJI_GROUP_ORDER,
          },
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
