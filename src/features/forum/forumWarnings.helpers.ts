import { useCallback, useState } from "react";
import type { TFunction } from "../../shared/i18n/types";
import { CONTENT_WARNINGS } from "./compose/composeWarnings.data";

/**
 * Content warnings on the PUBLISHED surfaces.
 *
 * The composer writes a set of ids (`CONTENT_WARNINGS`), and the backend
 * validates only a length: a member can type a warning nobody listed. So a
 * label lookup that misses falls back to the stored string rather than
 * dropping the warning, because a warning nobody renders is the one failure
 * this feature cannot have.
 */

/** The catalog key for each known warning id, resolved once. */
const LABEL_KEY_BY_ID = new Map(
  CONTENT_WARNINGS.map((warning) => [warning.id, warning.labelKey]),
);

/**
 * The warnings as a reader sees them: the composer's own labels for the eight
 * listed ids, and the author's own words for anything else.
 */
export function contentWarningLabels(
  warnings: readonly string[] | undefined,
  t: TFunction,
): string[] {
  return (warnings ?? [])
    .map((warning) => {
      const labelKey = LABEL_KEY_BY_ID.get(warning);
      return labelKey ? t(labelKey) : warning.trim();
    })
    .filter((label) => label.length > 0);
}

/**
 * Which threads this reader has chosen to uncover, for the life of the tab.
 *
 * Module scope on purpose: a reader who reveals a thread on the list, opens it,
 * and comes back should not be asked twice about the same post. It is NOT
 * persisted beyond the session — a shared or borrowed device starts covered
 * again, which is the safer default for exactly the posts that carry warnings.
 */
const revealedThreadKeys = new Set<string>();

/**
 * The reveal state for one thread's warned content.
 *
 * NOTHING AUTO-REVEALS. The initial value is read from the session set, so the
 * only thing that can uncover a post is a reader having pressed the control
 * for that same thread earlier in this session.
 *
 * @param threadKey Stable per-thread identity (the slug, or the demo id).
 */
export function useContentWarningReveal(threadKey: string) {
  const [isRevealed, setRevealed] = useState(() =>
    revealedThreadKeys.has(threadKey),
  );

  const reveal = useCallback(() => {
    revealedThreadKeys.add(threadKey);
    setRevealed(true);
  }, [threadKey]);

  const cover = useCallback(() => {
    revealedThreadKeys.delete(threadKey);
    setRevealed(false);
  }, [threadKey]);

  return { isRevealed, reveal, cover };
}
