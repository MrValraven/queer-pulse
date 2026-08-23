import { useEffect, useState } from "react";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import type { MyCardDTO } from "./api/cards.api";

/**
 * How large a portrait the card front asks for. Exported so `CardFrontFace`
 * and the preload below can never drift apart: `resolveAvatarSrc` bakes the
 * size into the URL, so a mismatch here would preload one URL and render a
 * different one, and the card would reveal itself the instant the wrong image
 * finished.
 */
export const CARD_PORTRAIT_PX = 512;

/**
 * URLs already waited for, kept for the life of the tab.
 *
 * `DiscreetGate` UNMOUNTS the card when it is re-covered, so without this
 * every hide-then-show would replay the whole skeleton for images the browser
 * already holds. A failed URL is recorded too: this is a record of "we have
 * already waited on this", not of "this succeeded", and re-waiting on an
 * image that is never going to arrive helps nobody.
 */
const settledUrls = new Set<string>();

/**
 * The card reveals itself after this long no matter what. On a bad connection
 * a shimmering ghost that never resolves is worse than a card whose ground
 * fades in late, and a holder standing at a door needs the credential more
 * than they need it to arrive tidily.
 */
const REVEAL_CEILING_MS = 5000;

/** Every image the front of a card draws, in no particular order. */
export function cardFaceImageUrls(card: MyCardDTO): string[] {
  return [
    card.program.backgroundUrl,
    card.program.crestUrl,
    resolveAvatarSrc(card.holderAvatarUrl ?? undefined, CARD_PORTRAIT_PX),
  ].filter((url): url is string => Boolean(url));
}

function preloadImage(url: string): Promise<void> {
  if (settledUrls.has(url)) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const image = new Image();
    // The same reason the rendered <img> carries it: Google's image CDN
    // answers 403/429 when a Referer is sent. Without it the preload would
    // fail and the real image would then have to load from scratch anyway.
    image.referrerPolicy = "no-referrer";

    const settle = () => {
      settledUrls.add(url);
      resolve();
    };

    image.onload = settle;
    // A broken crest must never leave the card shimmering forever.
    image.onerror = settle;
    image.src = url;

    // `decode()` is the point of this whole hook: `onload` only means the
    // bytes arrived, and a downloaded-but-undecoded image still hitches the
    // frame it first paints on. Guarded because jsdom has no implementation,
    // where `onload`/`onerror` above carry it instead. Both handlers resolve
    // the same promise, and resolving twice is a no-op.
    image.decode?.().then(settle, settle);
  });
}

/**
 * Whether every image on this card's front has arrived AND decoded.
 *
 * The card's ground is a CSS `background` on a pseudo-element (see
 * `MembershipCardFace.module.css`), which fires no load event of any kind, so
 * `onLoad` handlers on the two `<img>`s could never have covered it. All three
 * are preloaded off-screen here instead and reported as one boolean, which is
 * what lets the card appear finished rather than assembling itself in front of
 * its holder.
 *
 * Cards with no images at all — a flat skin, no crest, no photo — are ready on
 * the first render, so they never flash a ghost for a frame.
 *
 * The result is STICKY: once true it never returns to false. That is for the
 * card designer, where an owner flipping through the flag presets would
 * otherwise drop back to a skeleton on every click. A card that is already on
 * screen swaps its ground in place; only a card being seen for the first time
 * waits.
 */
export function useCardImagesReady(card: MyCardDTO): boolean {
  // A newline-joined key rather than the array itself, so the effect below
  // compares by value: a fresh array each render would re-run it forever.
  const urlKey = cardFaceImageUrls(card).join("\n");
  const [isReady, setIsReady] = useState(() => isAlreadySettled(urlKey));

  useEffect(() => {
    // No early return for an already-settled set. `preloadImage` answers
    // instantly for a URL the cache already holds, so `Promise.all` below
    // resolves in a microtask and reveals the card without a repaint anyone
    // could see — and the initial state above has already covered the case
    // that actually matters, a cached card mounting ready on its first frame.
    let isCancelled = false;
    const reveal = () => {
      if (!isCancelled) setIsReady(true);
    };

    const ceiling = window.setTimeout(reveal, REVEAL_CEILING_MS);
    void Promise.all(splitUrlKey(urlKey).map(preloadImage)).then(() => {
      window.clearTimeout(ceiling);
      reveal();
    });

    return () => {
      isCancelled = true;
      window.clearTimeout(ceiling);
    };
  }, [urlKey]);

  return isReady;
}

function splitUrlKey(urlKey: string): string[] {
  return urlKey ? urlKey.split("\n") : [];
}

function isAlreadySettled(urlKey: string): boolean {
  return splitUrlKey(urlKey).every((url) => settledUrls.has(url));
}
