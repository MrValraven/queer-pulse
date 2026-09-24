import { useCallback, useState } from "react";
import type { LineKeyChange } from "./therapistTopics.helpers";

/** A line's stable React key. `isArriving` marks a line an edit inserted, so
 *  only that one fades in; lines present at load, or grown back by a
 *  reseed, appear at rest. */
export interface TopicLineKey {
  id: string;
  isArriving: boolean;
}

let lineKeySequence = 0;
const makeLineKey = (isArriving: boolean): TopicLineKey => ({
  id: `topic-line-${(lineKeySequence += 1)}`,
  isArriving,
});

type KeysByTopic = Record<string, TopicLineKey[]>;

/** Keys for the topics as they are now: kept where the line count still
 *  matches, grown or cut to length where it does not, and dropped for topics
 *  that are gone. The same object back when nothing changed. */
function reconcileKeys(
  stored: KeysByTopic,
  topics: readonly { uid: string; lineCount: number }[],
): KeysByTopic {
  let hasChanged = Object.keys(stored).length !== topics.length;
  const next: KeysByTopic = {};
  for (const { uid, lineCount } of topics) {
    const keys = stored[uid] ?? [];
    if (keys.length === lineCount) {
      next[uid] = keys;
      continue;
    }
    hasChanged = true;
    next[uid] =
      keys.length > lineCount
        ? keys.slice(0, lineCount)
        : [
            ...keys,
            ...Array.from({ length: lineCount - keys.length }, () =>
              makeLineKey(false),
            ),
          ];
  }
  return hasChanged ? next : stored;
}

/**
 * Stable keys for each topic's lines, which are bare strings in the
 * description with no id of their own (the `usePositionalRowKeys` idea, per
 * topic). Keyed by index, a line inserted mid-list would rewrite every input
 * below it and the new-line fade would play on the last one. `applyChange`
 * must run beside the matching edit; anything else is reconciled by length.
 */
export function useTopicLineKeys(
  topics: readonly { uid: string; lineCount: number }[],
) {
  const [storedKeys, setStoredKeys] = useState<KeysByTopic>({});
  // Adjust-while-rendering, so a new topic has its keys on this same paint.
  const keysByTopic = reconcileKeys(storedKeys, topics);
  if (keysByTopic !== storedKeys) setStoredKeys(keysByTopic);

  const applyChange = useCallback((uid: string, change: LineKeyChange) => {
    setStoredKeys((previous) => {
      const next = [...(previous[uid] ?? [])];
      if (change.kind === "insert") {
        const inserted = Array.from({ length: change.count }, () =>
          makeLineKey(true),
        );
        next.splice(change.index, 0, ...inserted);
      } else {
        next.splice(change.index, 1);
      }
      return { ...previous, [uid]: next };
    });
  }, []);

  const keysFor = (uid: string): TopicLineKey[] => keysByTopic[uid] ?? [];

  return { keysFor, applyChange };
}
