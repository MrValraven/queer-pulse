import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  dominantCoverColour,
  headerTintFromCoverColour,
} from "./studioCoverTint";

/** The cover is drawn this many pixels square before it is sampled. */
const SAMPLE_SIZE = 32;

/** Every cover read this session: its header tint, or null when the image
 *  could not be read (a cover served without CORS headers taints the
 *  canvas). A failure is kept too, so it is never retried on a re-render. */
const coverTintCache = new Map<string, string | null>();

interface PendingCoverTint {
  listeners: Set<() => void>;
  cancel: () => void;
}

/** Loads still running, shared by the hero and the sticky header so one
 *  cover is fetched and sampled once. */
const pendingCoverTints = new Map<string, PendingCoverTint>();

/** Samples a loaded cover. Any failure reads as null, quietly. */
function readCoverTint(image: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    return headerTintFromCoverColour(dominantCoverColour(data).rgb);
  } catch {
    return null;
  }
}

/** Starts loading `coverUrl`, caching the outcome and then telling every
 *  listener still waiting. Cancelling also empties the image's source, so
 *  the browser stops the download. */
function startCoverTintLoad(coverUrl: string): PendingCoverTint {
  const image = new Image();
  const clearHandlers = () => {
    image.onload = null;
    image.onerror = null;
  };
  const pending: PendingCoverTint = {
    listeners: new Set(),
    cancel: () => {
      clearHandlers();
      image.src = "";
    },
  };
  const settle = (tint: string | null) => {
    clearHandlers();
    coverTintCache.set(coverUrl, tint);
    pendingCoverTints.delete(coverUrl);
    pending.listeners.forEach((listener) => listener());
  };
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  image.onload = () => settle(readCoverTint(image));
  image.onerror = () => settle(null);
  image.src = coverUrl;
  return pending;
}

/** Waits for `coverUrl`'s tint; the returned function stops waiting, and
 *  the last listener to leave drops the load. */
function subscribeToCoverTint(
  coverUrl: string,
  onTint: () => void,
): () => void {
  let pending = pendingCoverTints.get(coverUrl);
  if (!pending) {
    pending = startCoverTintLoad(coverUrl);
    pendingCoverTints.set(coverUrl, pending);
  }
  const subscribed = pending;
  subscribed.listeners.add(onTint);
  return () => {
    subscribed.listeners.delete(onTint);
    if (
      subscribed.listeners.size === 0 &&
      pendingCoverTints.get(coverUrl) === subscribed
    ) {
      subscribed.cancel();
      pendingCoverTints.delete(coverUrl);
    }
  };
}

/** Nothing to wait for: no cover, a cover already read, or no browser. */
function stopNothing() {}

/** Prerendering has no cover pixels, so the header starts neutral. */
function readServerTint(): string | null {
  return null;
}

/**
 * A light header tint (`#rrggbb`) pulled from a cover image, for the
 * Daylight wash behind a release hero and its sticky header. Returns null
 * while the cover loads, when there is none, or when the browser cannot
 * read its pixels; the header then stays neutral. The cache is the store:
 * a cover already read this session answers on the first render, and one
 * that another subscriber finishes between this render and the
 * subscription still lands, since useSyncExternalStore re-reads the cache
 * once it subscribes. Nothing touches the DOM outside the subscription, so
 * prerendering is safe.
 */
export function useStudioCoverTint(
  coverUrl: string | null | undefined,
): string | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!coverUrl || coverTintCache.has(coverUrl)) return stopNothing;
      if (typeof Image === "undefined" || typeof document === "undefined")
        return stopNothing;
      return subscribeToCoverTint(coverUrl, onStoreChange);
    },
    [coverUrl],
  );
  return useSyncExternalStore(
    subscribe,
    () => (coverUrl ? (coverTintCache.get(coverUrl) ?? null) : null),
    readServerTint,
  );
}

const PAGE_TINT_PROPERTY = "--studio-page-tint";

/** Every mounted hero holding a tint, oldest first. The newest paints the
 *  page, so a hero that leaves after the next one mounted cannot wipe it. */
const pageTintHolders: { tint: string }[] = [];

function paintPageTint() {
  const rootStyle = document.documentElement.style;
  const newestHolder = pageTintHolders[pageTintHolders.length - 1];
  if (newestHolder)
    rootStyle.setProperty(PAGE_TINT_PROPERTY, newestHolder.tint);
  else rootStyle.removeProperty(PAGE_TINT_PROPERTY);
}

/**
 * Lends a hero's cover tint to the whole page as `--studio-page-tint` on
 * <html>, so the light topbar washes in the same colour. Only a known tint
 * touches the root; the property goes again when the tint clears or the
 * hero unmounts. Runs in an effect, so prerendering is safe.
 */
export function useStudioPageTint(tint: string | null): void {
  useEffect(() => {
    if (!tint || typeof document === "undefined") return;
    const holder = { tint };
    pageTintHolders.push(holder);
    paintPageTint();
    return () => {
      pageTintHolders.splice(pageTintHolders.indexOf(holder), 1);
      paintPageTint();
    };
  }, [tint]);
}
