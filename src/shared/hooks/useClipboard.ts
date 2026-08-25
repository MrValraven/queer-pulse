import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../components/feedback/useToast";

/**
 * Copy-to-clipboard with a self-resetting `copied` flag for "Copied!" button
 * affordances. `copy(text)` writes via `navigator.clipboard.writeText`, resolves
 * `true` on success (and flips `copied` to `true`) or `false` on failure — never
 * throws, so callers can branch without a try/catch. `copied` auto-resets to
 * `false` after `resetMs` (default 2000); the pending timer is cleared on unmount
 * and on each new successful copy.
 *
 * This hook is intentionally pure (no toast, no i18n) so it stays reusable
 * anywhere. For the "link copied" toast UX, use `useShareLink` below.
 */
export function useClipboard(resetMs = 2000): {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
} {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimer.current !== null) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  }, []);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearResetTimer();
        resetTimer.current = setTimeout(() => {
          setCopied(false);
          resetTimer.current = null;
        }, resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs, clearResetTimer],
  );

  return { copy, copied };
}

/**
 * Copies a URL and surfaces the same toast the codebase already uses for share
 * actions — `showToast(message, "success" | "info")`, matching
 * `StudioArtistHero`. The toast *content* is passed in as already-translated
 * strings because there is no shared/common "link copied" i18n key: each feature
 * owns its own (`studio:detail.linkCopiedToast`, `magazine:toolbar.linkCopiedToast`,
 * …). Adopters pass their existing `t("…linkCopiedToast")` string, so the UX is
 * identical to the hand-rolled version they replace while keeping this hook free
 * of any hardcoded copy.
 *
 * Wiring decision: `useClipboard` stays pure; `useShareLink` owns the `useToast`
 * dependency and takes the messages, rather than making adopters re-wire the
 * toast themselves.
 */
export function useShareLink(messages: { copied: string; failed?: string }): {
  share: (url: string) => Promise<void>;
  copied: boolean;
} {
  const { copy, copied } = useClipboard();
  const { showToast } = useToast();

  const share = useCallback(
    async (url: string): Promise<void> => {
      const didCopy = await copy(url);
      if (didCopy) {
        showToast(messages.copied, "success");
      } else if (messages.failed) {
        showToast(messages.failed, "info");
      }
    },
    [copy, showToast, messages.copied, messages.failed],
  );

  return { share, copied };
}
