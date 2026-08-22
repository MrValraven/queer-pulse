import { useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { mintCardToken } from "./cards.api";

/**
 * The server token lives 60 seconds. Re-mint at 45 so a scan that starts just
 * before the boundary still lands against a live token.
 */
const REMINT_MS = 45_000;

/** Demo mode shows a real, scannable QR that resolves to a demo token. */
const DEMO_TOKEN = "demo-card-token";

/**
 * Mints the short-lived proof token behind a card's QR, and keeps it fresh
 * while the card is on screen.
 *
 * `isActive` is the whole privacy contract of this hook. It is false whenever
 * the card is not actually visible: behind the discreet gate, on a collapsed
 * card, or in a backgrounded tab. While it is false the hook mints nothing and
 * CLEARS any token it already holds, so a credential never sits in memory
 * behind a locked screen and a screenshot of a stale card cannot be re-shown.
 */
export function useCardToken(
  cardId: string | undefined,
  { isActive }: { isActive: boolean },
): { token: string | null; isMinting: boolean; error: boolean } {
  const { demoMode } = useDemoMode();
  const [token, setToken] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState(false);
  // Guards against a slow in-flight mint resolving after the card has been
  // hidden and writing a token back into state.
  const activeRef = useRef(isActive);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (!cardId || !isActive) {
      setToken(null);
      setError(false);
      return;
    }
    if (demoMode) {
      setToken(DEMO_TOKEN);
      return;
    }

    let cancelled = false;

    const mint = async () => {
      setIsMinting(true);
      try {
        const result = await mintCardToken(cardId);
        if (cancelled || !activeRef.current) return;
        setToken(result.token);
        setError(false);
      } catch {
        if (cancelled) return;
        // Clear rather than keep the previous token: showing a card that
        // cannot currently prove itself is worse than saying so.
        setToken(null);
        setError(true);
      } finally {
        if (!cancelled) setIsMinting(false);
      }
    };

    void mint();
    const timer = setInterval(() => void mint(), REMINT_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [cardId, isActive, demoMode]);

  return { token, isMinting, error };
}
