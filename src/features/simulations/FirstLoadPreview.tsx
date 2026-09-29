import { useEffect, useEffectEvent, useState } from "react";
import { matchPath, useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { registeredChunkLoaders } from "../../app/routeHelpers";
import { PageLoader } from "../../shared/components/feedback/PageLoader";
import { RouteFallback } from "../../shared/components/feedback/RouteFallback";

const DEFAULT_SESSION_MS = 1200;
const DEFAULT_CHUNK_MS = 1400;

/** Ceiling on each stage, so a typo in the URL cannot wedge the preview. */
const MAX_STAGE_MS = 10_000;

type FirstLoadStage = "session" | "chunk";

interface FirstLoadTimings {
  sessionMs: number;
  chunkMs: number;
}

/** A stage length from the URL, clamped to 0..MAX_STAGE_MS; a missing or
 *  unreadable value takes the default. */
function readStageMs(rawValue: string | null, defaultMs: number): number {
  if (rawValue === null || rawValue.trim() === "") return defaultMs;
  const parsedMs = Number(rawValue);
  if (!Number.isFinite(parsedMs)) return defaultMs;
  return Math.min(Math.max(parsedMs, 0), MAX_STAGE_MS);
}

/**
 * Start fetching the feed's route chunk while the stand-in loader holds the
 * screen, the same work a real cold load is waiting on at that point. The code
 * is then already in hand when the navigation at the end asks for it, so the
 * feed's own route fallback only covers the moment React takes to reveal the
 * page, and it joins the same loader chain. Silent on failure: the navigation
 * then simply pays for the fetch itself.
 */
function warmFeedChunk(): void {
  for (const [pattern, loadChunk] of registeredChunkLoaders()) {
    if (!matchPath(pattern, routes.feed)) continue;
    void loadChunk().catch(() => {});
    return;
  }
}

/**
 * The page behind the "first load" simulations. It stages the two full-screen
 * loaders a cold load of a gated route mounts back to back, with the real
 * components, and then hands over to the real feed:
 *
 * 1. "session": the bare `<PageLoader size="screen" />` that app/routes.tsx
 *    renders while the session is checked, for `sessionMs`.
 * 2. "chunk": the real `<RouteFallback />`, standing in for the route
 *    Suspense fallback while the page's code loads, for `chunkMs`. It swaps in
 *    within the same commit and is a separate mount, so the timeline handoff
 *    in screenLoaderHandoff.ts runs exactly as it does on a real load.
 *    RouteFallback's shell-frame hold is inert here, as it is on a cold boot:
 *    nothing has registered a frame yet, so it holds nothing.
 * 3. Then it replaces itself with the feed.
 *
 * Demo mode skips the session check, so this is the only place the handoff
 * can be watched. The timings come from the URL (see `firstLoadPreviewPath`
 * in ./simulations.data.ts) and are read once, so the page is unaffected by
 * the router moving on to the feed. Only registered on the dev server (see
 * ./routes.tsx).
 */
export function FirstLoadPreview() {
  const [searchParams] = useSearchParams();
  const [timings] = useState<FirstLoadTimings>(() => ({
    sessionMs: readStageMs(searchParams.get("sessionMs"), DEFAULT_SESSION_MS),
    chunkMs: readStageMs(searchParams.get("chunkMs"), DEFAULT_CHUNK_MS),
  }));
  const [stage, setStage] = useState<FirstLoadStage>("session");
  const navigate = useNavigate();
  const openFeed = useEffectEvent(() => {
    void navigate(routes.feed, { replace: true });
  });

  useEffect(() => {
    warmFeedChunk();
    const chunkStageTimer = window.setTimeout(
      () => setStage("chunk"),
      timings.sessionMs,
    );
    const doneTimer = window.setTimeout(
      openFeed,
      timings.sessionMs + timings.chunkMs,
    );
    return () => {
      window.clearTimeout(chunkStageTimer);
      window.clearTimeout(doneTimer);
    };
  }, [timings]);

  return stage === "session" ? <PageLoader size="screen" /> : <RouteFallback />;
}
