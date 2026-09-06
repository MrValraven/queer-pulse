import { useEffect, useRef, useState, type RefObject } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { LinkPreviewResponse } from "../../../shared/contracts/contracts";
import { getLinkPreview } from "../../messages/api/link-preview.api";
import { demoLinkPreview } from "../../messages/linkPreview.data";

/**
 * Link unfurls for forum posts (PRD-171).
 *
 * The endpoint, the demo mock and the "is this card worth rendering" rule are
 * the messaging feature's and are imported, not copied: a URL pasted into a DM
 * and the same URL pasted into a thread share one react-query entry
 * (`["link-preview", url, demoMode]`) and therefore one round trip. What is new
 * here is the RATE DISCIPLINE a thread needs and a chat bubble does not.
 *
 * THE BUDGET. `GET /link-preview` and `/link-preview/batch` share one allowance
 * of 40 URLs per 60 seconds, keyed on client IP — so everyone behind one office
 * or venue NAT spends the same 40. A thread of twenty replies each carrying a
 * link would burn half of that on a single page load, for cards nobody had
 * scrolled to yet. Three rules keep that from happening:
 *
 *  1. at most the FIRST link in a post is ever unfurled (`firstLinkIn`);
 *  2. nothing is requested until the post is near the viewport
 *     (`useInViewOnce`, which is what the call sites gate the hook on);
 *  3. the requests that do fire are coalesced into batches of up to four
 *     (`loadLinkPreview` below), so scrolling past four linked replies costs
 *     one round trip rather than four.
 *
 * A batch is a round-trip saver and NOT a bigger allowance: the server charges
 * one slot per URL either way.
 */

/** The batch route's hard cap. Sending more is a 400. */
const MAX_BATCH_URLS = 4;

/** How long a requested URL waits for company before its batch goes out. Short
 *  enough to feel immediate, long enough for the handful of posts that scroll
 *  into view together to travel as one request. */
const COALESCE_MS = 40;

/**
 * `GET /link-preview/batch?url=A&url=B` — the parameter is REPEATED, never
 * comma-joined (a comma is legal inside a URL). The response is one card per
 * requested URL IN REQUEST ORDER, so it is zipped by index below: matching on
 * the returned `url` would silently mis-attribute every card whose page
 * redirected, because that field is the final URL, not the one asked for.
 */
async function getLinkPreviewBatch(
  urls: string[],
): Promise<LinkPreviewResponse[]> {
  const params = new URLSearchParams();
  for (const url of urls) params.append("url", url);
  return apiGet<LinkPreviewResponse[]>(
    `/link-preview/batch?${params.toString()}`,
  );
}

/** A card with nothing in it: what an un-previewable URL resolves to, and what
 *  a short batch response falls back to. Never an error, so the post keeps the
 *  plain link it already renders. */
function emptyPreview(url: string): LinkPreviewResponse {
  return {
    url,
    siteName: null,
    title: null,
    description: null,
    imageUrl: null,
  };
}

interface PendingUnfurl {
  url: string;
  resolve: (preview: LinkPreviewResponse) => void;
  reject: (reason: unknown) => void;
}

// Module-level, deliberately: the whole point is to coalesce across the
// separate components that each ask for their own post's link, which no
// per-component state can do. React Query has already deduped identical URLs by
// query key before anything reaches here, so one entry is one distinct URL.
let pendingUnfurls: PendingUnfurl[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(flushPendingUnfurls, COALESCE_MS);
}

function flushPendingUnfurls(): void {
  flushTimer = null;
  const batch = pendingUnfurls.slice(0, MAX_BATCH_URLS);
  pendingUnfurls = pendingUnfurls.slice(MAX_BATCH_URLS);
  // More than four arrived inside one window: the rest go out as their own
  // batch rather than being dropped or sent over the cap.
  if (pendingUnfurls.length) scheduleFlush();
  if (!batch.length) return;

  const only = batch[0];
  if (batch.length === 1 && only) {
    getLinkPreview(only.url).then(only.resolve, only.reject);
    return;
  }

  getLinkPreviewBatch(batch.map((entry) => entry.url)).then(
    (previews) => {
      batch.forEach((entry, index) => {
        entry.resolve(previews[index] ?? emptyPreview(entry.url));
      });
    },
    (error: unknown) => {
      batch.forEach((entry) => entry.reject(error));
    },
  );
}

/** Queue one URL for the next batch and resolve with its card. */
function loadLinkPreview(url: string): Promise<LinkPreviewResponse> {
  return new Promise<LinkPreviewResponse>((resolve, reject) => {
    pendingUnfurls.push({ url, resolve, reject });
    scheduleFlush();
  });
}

/**
 * Unfurl one URL. Pass `null` (which the call sites do until the post is near
 * the viewport) and nothing is requested at all.
 *
 * Retries are off: a URL the server could not unfurl will not become
 * unfurlable on a second try, and a 429 answered by three more requests is the
 * exact failure this whole module exists to avoid. A failure and an all-null
 * card land in the same place — the post keeps its plain link.
 */
export function useForumLinkPreview(url: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<LinkPreviewResponse>({
    // Deliberately the SAME key the messaging hook uses, so a link shared in
    // both places is fetched once.
    queryKey: ["link-preview", url, demoMode],
    enabled: !!url,
    queryFn: async () => {
      const target = url as string;
      // Demo has no network at all: the prototype synthesizes its card.
      if (demoMode) return demoLinkPreview(target);
      return loadLinkPreview(target);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

// A bare http(s) URL in prose. The character class stops at whitespace and at
// the brackets/quotes that wrap a link rather than belong to it; the trailing
// trim then drops sentence punctuation, so "see https://example.com/page." does
// not request a URL with a full stop glued to it.
const URL_PATTERN = /https?:\/\/[^\s<>"'`)\]}]+/i;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

/**
 * The FIRST http(s) URL across a post's paragraphs, or null.
 *
 * First, and only the first: a resource-sharing post can carry a dozen links,
 * and one card under it is a preview while twelve is a wall. This is also the
 * per-post half of the rate discipline described at the top of this file.
 */
export function firstLinkIn(paragraphs: string[]): string | null {
  for (const paragraph of paragraphs) {
    const match = URL_PATTERN.exec(paragraph);
    if (!match) continue;
    const candidate = match[0].replace(TRAILING_PUNCTUATION, "");
    if (candidate.length > 2048) continue;
    return candidate;
  }
  return null;
}

/**
 * True once the element has come within reach of the viewport, and true from
 * then on.
 *
 * Deliberately NOT `useScrollReveal`, which reports "visible" immediately under
 * `prefers-reduced-motion` because it exists to gate an ANIMATION. Reduced
 * motion is a statement about movement, not about network requests: honouring
 * it there would fire every unfurl on the page at once for exactly the members
 * who asked for less, which is the rate-limit failure this guards against. The
 * 200px margin starts the request just before the post is read, so the card is
 * usually there by the time the member's eye arrives.
 */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(): {
  ref: RefObject<T | null>;
  isInView: boolean;
} {
  const ref = useRef<T>(null);
  // jsdom and any browser without the observer start "in view", so a missing
  // IntersectionObserver degrades to unfurling rather than to never unfurling.
  const [isInView, setIsInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (isInView) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsInView(true);
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isInView]);

  return { ref, isInView };
}
