import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { safeStorage } from "../../shared/storage/safeStorage";
import { usePrefersReducedMotion } from "../../shared/hooks";

/** One bucket per piece. Namespaced so it never collides with another feature. */
const STORAGE_PREFIX = "queerpulse:magazine:reading-position:";
/** Below this the reader has barely started, so there is nothing to resume. */
const RESUME_FLOOR = 0.06;
/** Above this they have effectively finished, and a resume prompt would nag. */
const RESUME_CEILING = 0.92;
/** A position older than this is not where the reader thinks they left off. */
const RESUME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
/** Persisting on every frame would write hundreds of times per screenful. */
const PERSIST_INTERVAL_MS = 1500;

interface StoredPosition {
  ratio: number;
  savedAt: number;
}

function clampRatio(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * The stored position for this piece, or `null` when there is none, it is stale,
 * or the payload is not the shape we wrote. `safeStorage` already swallows the
 * SecurityError a private window or blocked site data raises on the accessor
 * itself; the try/catch here covers the parse.
 */
function readStoredRatio(storageKey: string): number | null {
  try {
    const raw = safeStorage.get(storageKey);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { ratio, savedAt } = parsed as Partial<StoredPosition>;
    if (typeof ratio !== "number" || typeof savedAt !== "number") return null;
    if (Date.now() - savedAt > RESUME_MAX_AGE_MS) return null;
    if (ratio <= RESUME_FLOOR || ratio >= RESUME_CEILING) return null;
    return clampRatio(ratio);
  } catch {
    return null;
  }
}

export interface ArticleReadingPosition {
  /** How far through the body the reader has scrolled, 0 to 1. */
  ratio: number;
  /** Where they left off last time, or `null` when there is nothing to offer. */
  resumeRatio: number | null;
  /** Scroll back to `resumeRatio` and retire the prompt. */
  resume: () => void;
  /** Retire the prompt without moving. */
  dismissResume: () => void;
}

/**
 * PRD-113: reading progress and position memory for one article.
 *
 * Progress is measured against the body element rather than the document, so
 * the masthead, the related rail and the comments below it never count as text
 * the reader has read. The position is remembered in `localStorage`, which is
 * the right store for a per-viewer convenience: it is private to this browser,
 * survives a reload, and losing it costs the reader a scroll. Every access goes
 * through `safeStorage`, so a private window or blocked site data degrades to
 * "no remembered position" instead of throwing.
 *
 * A position is only kept while it is worth offering: the first few percent and
 * the last few are dropped, and so is anything older than a month.
 */
export function useArticleReadingPosition(
  articleSlug: string,
  bodyRef: RefObject<HTMLElement | null>,
): ArticleReadingPosition {
  const prefersReducedMotion = usePrefersReducedMotion();
  const storageKey = `${STORAGE_PREFIX}${articleSlug}`;
  const [ratio, setRatio] = useState(0);
  // Read ONCE per piece, before the scroll listener below starts writing over
  // the stored value.
  const [resumeRatio, setResumeRatio] = useState<number | null>(() =>
    readStoredRatio(storageKey),
  );
  const latestRatio = useRef(0);

  // Moving to another piece re-reads THAT piece's remembered position during
  // the same render (React's documented "adjust state while rendering", the
  // contract `usePersistedState` already uses), so no committed frame shows the
  // previous piece's progress and no effect has to fire a cascading render.
  const [appliedKey, setAppliedKey] = useState(storageKey);
  if (appliedKey !== storageKey) {
    setAppliedKey(storageKey);
    setRatio(0);
    setResumeRatio(readStoredRatio(storageKey));
  }

  useEffect(() => {
    let frame = 0;
    let lastPersistedAt = 0;
    // Nothing is written until the reader has actually moved on this visit.
    // Otherwise opening a piece and leaving again immediately would persist a
    // ratio of 0 and WIPE the position they were coming back to.
    let hasScrolled = false;

    const persist = () => {
      if (!hasScrolled) return;
      const value = latestRatio.current;
      if (value <= RESUME_FLOOR || value >= RESUME_CEILING) {
        // Barely started or effectively finished: there is nothing useful to
        // come back to, and clearing keeps the store from growing per piece.
        safeStorage.remove(storageKey);
        return;
      }
      safeStorage.set(
        storageKey,
        JSON.stringify({ ratio: value, savedAt: Date.now() }),
      );
    };

    const measure = () => {
      frame = 0;
      const element = bodyRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const next =
        scrollable <= 0
          ? // A body shorter than the viewport is read the moment its foot
            // clears the fold.
            rect.bottom <= window.innerHeight
            ? 1
            : 0
          : clampRatio(-rect.top / scrollable);
      latestRatio.current = next;
      setRatio(next);
      const now = Date.now();
      if (now - lastPersistedAt >= PERSIST_INTERVAL_MS) {
        lastPersistedAt = now;
        persist();
      }
    };

    const schedule = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(measure);
    };
    const onScroll = () => {
      hasScrolled = true;
      schedule();
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pagehide", persist);
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pagehide", persist);
      persist();
    };
  }, [bodyRef, storageKey]);

  const resume = useCallback(() => {
    const element = bodyRef.current;
    if (!element || resumeRatio === null) return;
    const rect = element.getBoundingClientRect();
    const bodyTop = rect.top + window.scrollY;
    const scrollable = Math.max(rect.height - window.innerHeight, 0);
    window.scrollTo({
      top: bodyTop + scrollable * resumeRatio,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    setResumeRatio(null);
  }, [bodyRef, resumeRatio, prefersReducedMotion]);

  const dismissResume = useCallback(() => setResumeRatio(null), []);

  return { ratio, resumeRatio, resume, dismissResume };
}
