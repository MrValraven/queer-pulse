import { useEffect, useState } from "react";
import type { RefCallback } from "react";
import { usePdfSourceRegistry } from "./PdfSourceRegistryContext";

export type PageThumbnailStatus = "pending" | "ready" | "failed";

export interface PageThumbnail {
  containerRef: RefCallback<HTMLElement>;
  status: PageThumbnailStatus;
  url: string | null;
}

interface SettledThumbnail {
  cacheKey: string;
  status: "ready" | "failed";
  url: string | null;
}

/** Starts rendering when the container comes within 600px of the viewport. */
const NEAR_VIEWPORT_MARGIN = "600px";

function hasIntersectionObserver(): boolean {
  return typeof IntersectionObserver !== "undefined";
}

export function usePageThumbnail(
  fileId: string,
  sourceIndex: number,
): PageThumbnail {
  const registry = usePdfSourceRegistry();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  // Without IntersectionObserver (old browsers, jsdom) every page renders.
  const [isNearViewport, setIsNearViewport] = useState(
    () => !hasIntersectionObserver(),
  );
  const [settled, setSettled] = useState<SettledThumbnail | null>(null);
  const cacheKey = `${fileId}:${sourceIndex}`;

  useEffect(() => {
    if (isNearViewport || !container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: NEAR_VIEWPORT_MARGIN },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, isNearViewport]);

  useEffect(() => {
    if (!isNearViewport) return;
    let isCurrent = true;
    // Unmounting withdraws a render still waiting in the queue.
    const withdrawal = new AbortController();
    void registry.getThumbnailUrl(fileId, sourceIndex, withdrawal.signal).then(
      (url) => {
        if (isCurrent) setSettled({ cacheKey, status: "ready", url });
      },
      () => {
        if (isCurrent) setSettled({ cacheKey, status: "failed", url: null });
      },
    );
    return () => {
      isCurrent = false;
      withdrawal.abort();
    };
  }, [registry, fileId, sourceIndex, cacheKey, isNearViewport]);

  // A result for a different page reads as pending until its own settles.
  const current = settled?.cacheKey === cacheKey ? settled : null;
  return {
    containerRef: setContainer,
    status: current?.status ?? "pending",
    url: current?.url ?? null,
  };
}
