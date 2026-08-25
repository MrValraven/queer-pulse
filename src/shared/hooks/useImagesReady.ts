import { useEffect, useMemo, useState } from "react";

/**
 * Failsafe. However slow or broken the image host is, the page is revealed once
 * this elapses — a dead CDN degrades to "the photos fill in late", which is the
 * behaviour we had before this hook, rather than trapping the visitor behind an
 * overlay that never lifts.
 */
const HARD_CAP_MS = 6000;

export interface ImagesReady {
  /** Every image has decoded, failed, or the hard cap fired. */
  isReady: boolean;
  /** How many have settled so far — for a "3 of 4" style progress line. */
  loadedCount: number;
  totalCount: number;
}

interface Progress {
  /** Which URL set this progress belongs to. Stale sets read as zero. */
  key: string;
  settledCount: number;
  isDone: boolean;
}

/**
 * Waits for a known set of images to be decoded and sitting in the browser
 * cache, so a page can hold its reveal until the photos will paint instantly
 * instead of popping in one by one.
 *
 * Preloads through detached `new Image()` objects rather than watching the real
 * `<img>` elements, for two reasons. Thumbnails are usually `loading="lazy"`
 * and below the fold, so a DOM-based wait would deadlock on images the browser
 * has deliberately not started. And the caller often wants to gate BEFORE the
 * markup that holds those images has mounted. Because the preload requests are
 * byte-identical to the ones the `<img>` tags fire, the browser serves the real
 * elements from cache the moment they mount.
 *
 * Pass the FINAL resolved `src` strings — the same values the `<img>` will
 * carry, `resolveAvatarSrc()` sizing included. Warming a differently-sized URL
 * warms a request nothing else makes, and the gate then measures nothing.
 *
 * `isReady` is sticky per URL set: once a set has settled it stays settled, so
 * a re-render cannot re-raise a loader that already lifted. A genuinely
 * different set (navigating to another listing) starts a fresh wait. Passing
 * `null` means "not known yet" and holds at not-ready without starting the
 * clock, so a slow data fetch can't burn the hard cap before the URLs arrive.
 */
export function useImagesReady(
  urls: readonly string[] | null | undefined,
): ImagesReady {
  // The array identity changes on every render; its CONTENT is what the effect
  // actually depends on. Newlines can't appear in a URL, so joining is a safe
  // stable key.
  const key = useMemo(() => (urls ? urls.join("\n") : null), [urls]);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    // Nothing known yet, or nothing to wait for. The empty case is answered
    // below without state, so neither needs an effect.
    if (key === null || key === "") return;
    const list = key.split("\n");

    let isCancelled = false;
    let settledCount = 0;
    const publish = (isDone: boolean) => {
      if (!isCancelled) setProgress({ key, settledCount, isDone });
    };
    // Fires only if the images are still outstanding when it elapses; the
    // completing `publish(true)` below clears it first.
    const capTimer = window.setTimeout(() => publish(true), HARD_CAP_MS);
    const settle = () => {
      settledCount += 1;
      const isDone = settledCount >= list.length;
      if (isDone) window.clearTimeout(capTimer);
      publish(isDone);
    };

    for (const url of list) {
      // One image can reach us from two directions in the fallback path below,
      // and double-counting would let a set of four settle on three photos.
      let hasSettled = false;
      const settleThisImage = () => {
        if (hasSettled) return;
        hasSettled = true;
        settle();
      };

      const image = new Image();
      image.decoding = "async";
      // Google's image CDN answers 403/429 when the request carries a Referer,
      // and the real <img> tags set this too. The preload has to match, or it
      // warms a request the element never repeats.
      image.referrerPolicy = "no-referrer";
      image.src = url;
      if (typeof image.decode === "function") {
        // A broken image rejects; either way the wait for it is over. Never let
        // one 404 hold the whole set.
        image.decode().then(settleThisImage, settleThisImage);
      } else {
        // jsdom and very old browsers have no decode(); load/error is the same
        // signal minus the guarantee that the bitmap is ready to paint.
        image.onload = settleThisImage;
        image.onerror = settleThisImage;
        // An image that is already `complete` — a cache hit, or jsdom, which
        // never fetches — will fire neither event, so nothing would ever settle
        // it. Deferred by a tick so this stays out of the effect's render pass.
        if (image.complete) window.setTimeout(settleThisImage, 0);
      }
    }

    return () => {
      isCancelled = true;
      window.clearTimeout(capTimer);
      // Deliberately no abort. These requests are already in flight and land in
      // the browser cache, which is exactly where we want them if the visitor
      // comes back — and there are at most a handful of them.
    };
  }, [key]);

  // Progress recorded against a previous URL set reads as zero rather than
  // being cleared in the effect, which keeps this hook free of the cascading
  // render a synchronous reset would cause.
  const isCurrent = progress !== null && progress.key === key;
  const totalCount = key === null || key === "" ? 0 : key.split("\n").length;
  return {
    isReady:
      key !== null && (totalCount === 0 || (isCurrent && progress.isDone)),
    loadedCount: isCurrent ? progress.settledCount : 0,
    totalCount,
  };
}
