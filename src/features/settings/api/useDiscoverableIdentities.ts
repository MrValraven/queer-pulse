import { useCallback, useEffect, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getDiscoverableIdentities,
  putDiscoverableIdentities,
} from "./discoverableIdentities.api";

export interface DiscoverableIdentitiesState {
  /** Identities this member could publish — server truth in live mode. */
  available: string[];
  /** Identities currently published. Empty until the member opts in. */
  published: string[];
  loading: boolean;
  /** True while a toggle is in flight. */
  saving: boolean;
  /** Set when a write failed; the published set is unchanged when it is. */
  error: boolean;
  /** Publish or un-publish ONE identity. Resolves true on success. */
  setPublished: (identity: string, next: boolean) => Promise<boolean>;
}

/**
 * The published-identity set, dual-mode.
 *
 * Demo mode never touches the network: `available` is whatever the caller passes
 * from the local profile draft and `published` lives in component state, so the
 * prototype's toggles behave exactly like the real ones. Live mode is the only
 * path that calls the API.
 *
 * Deliberately plain `useState` rather than react-query. This is a safety
 * control, and its correctness property is that un-publishing is instant and
 * total — so the ONLY copy of the published set is the one the server just
 * confirmed. A query cache would introduce a second copy that could be read
 * after a retraction and before an invalidation, which is precisely the bug
 * class this whole feature exists to avoid. Nothing here derives, memoises or
 * persists the set anywhere else.
 */
export function useDiscoverableIdentities(
  /** The member's private identities, for demo mode's `available`. */
  demoAvailable: string[],
): DiscoverableIdentitiesState {
  const { demoMode } = useDemoMode();
  const [available, setAvailable] = useState<string[]>([]);
  const [published, setPublishedState] = useState<string[]>([]);
  const [loading, setLoading] = useState(!demoMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Demo mode never fetches; `loading` is derived as false for it below
    // rather than set here, so this effect only ever drives the live path.
    if (demoMode) return;
    let cancelled = false;
    setLoading(true);
    getDiscoverableIdentities()
      .then((dto) => {
        if (cancelled) return;
        setAvailable(dto.available);
        setPublishedState(dto.published);
      })
      // A failed READ must not imply "nothing is published" — it implies we do
      // not know. `error` renders the plain failure line instead of a list of
      // all-off toggles that would be a lie about the member's own disclosure.
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  const setPublished = useCallback(
    async (identity: string, next: boolean): Promise<boolean> => {
      const target = next
        ? [...published, identity]
        : published.filter((value) => value !== identity);

      if (demoMode) {
        setPublishedState(target);
        return true;
      }

      setSaving(true);
      setError(false);
      try {
        // The server echoes what it actually stored; take that, never `target`.
        const dto = await putDiscoverableIdentities(target);
        setAvailable(dto.available);
        setPublishedState(dto.published);
        return true;
      } catch {
        // Leave `published` untouched — the toggle snaps back and the copy says
        // nothing changed, which is true.
        setError(true);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [demoMode, published],
  );

  return {
    available: demoMode ? demoAvailable : available,
    published,
    loading: demoMode ? false : loading,
    saving,
    error,
    setPublished,
  };
}
