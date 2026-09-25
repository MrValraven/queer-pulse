import type { LinkPreviewResponse } from "../../../shared/contracts/contracts";
import { useDirectoryPlace } from "../../marketing/api/useDirectory";
import type { DirectoryPlace } from "../../marketing/directoryPlaces";
import { internalPlaceSlug } from "../internalLinkTargets";
import { hasPreviewContent, useLinkPreview } from "./useLinkPreview";

export interface MessageLinkCardState {
  /** The place slug when `url` is a QueerPulse directory place link AND that
   *  place resolved; `null` for every other link, including a place link
   *  whose slug turned out not to exist (see `hasContent`'s doc). Callers
   *  branch on this to pick which card body to render. */
  placeSlug: string | null;
  /** The resolved place, when `placeSlug` is set. */
  place: DirectoryPlace | undefined;
  /** The ordinary OG unfurl, resolved for every non-place link, and, as a
   *  fallback, for a place link whose slug didn't resolve to a real place. */
  ogPreview: LinkPreviewResponse | undefined;
  /** True while the card's content is still being determined: the place
   *  fetch, or (once a place link is confirmed unresolved) the OG fallback
   *  fetch, is in flight. */
  isLoading: boolean;
  /** True once the card has something worth rendering, of either kind. */
  hasContent: boolean;
}

/**
 * One resolver for the "what does this bubble's link card show" question,
 * shared by `TextBubble` (MessageBubbleBody.tsx) and `ShareToChatPreview` so
 * the sent bubble and its live preview can never disagree.
 *
 * A QueerPulse directory place link (`internalPlaceSlug(url)`) resolves the
 * real place via `useDirectoryPlace` and skips the OpenGraph fetch entirely,
 * since unfurling a place URL would only ever return the SPA shell's generic
 * QueerPulse card, never the place itself. Every other link keeps today's
 * `useLinkPreview` unfurl. A place link whose slug 404s (or matches nothing
 * in demo) falls back to the ordinary OG path once that's known, so an
 * unknown slug still shows *something* rather than a permanently broken card.
 *
 * `useDirectoryPlace(undefined)` is a no-op query (its own `enabled` gate),
 * so calling it unconditionally, rather than only for a place link, keeps
 * this a single hook with a stable call order regardless of which kind of
 * link the message carries.
 */
export function useMessageLinkCard(url: string | null): MessageLinkCardState {
  const placeSlug = url ? internalPlaceSlug(url) : null;
  const isPlaceLink = placeSlug !== null;
  const placeQuery = useDirectoryPlace(placeSlug ?? undefined);
  const isPlaceSettled = !isPlaceLink || !placeQuery.isLoading;
  const isPlaceResolved = isPlaceLink && isPlaceSettled && !!placeQuery.place;
  const needsOgFallback = !isPlaceLink || (isPlaceSettled && !isPlaceResolved);
  const ogPreviewQuery = useLinkPreview(needsOgFallback ? url : null);
  const isOgResolved = hasPreviewContent(ogPreviewQuery.data);

  const isLoading = isPlaceLink
    ? placeQuery.isLoading || (needsOgFallback && ogPreviewQuery.isLoading)
    : ogPreviewQuery.isLoading;

  return {
    placeSlug: isPlaceResolved ? placeSlug : null,
    place: placeQuery.place,
    ogPreview: ogPreviewQuery.data,
    isLoading,
    hasContent: isPlaceResolved || (needsOgFallback && isOgResolved),
  };
}
