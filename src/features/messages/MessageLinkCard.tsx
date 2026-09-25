import { lazy, Suspense } from "react";
import type { MessageLinkCardState } from "./api/useMessageLinkCard";
import { LinkPreview } from "./LinkPreview";
import previewStyles from "./LinkPreview.module.css";

// The directory feature (LocalBusinessCardBody + DirectoryPage.module.css and
// everything they in turn import) is real weight to carry into the Messages
// chunk for a card that only some links ever need, so it's deferred until a
// message actually resolves to a place, same reasoning `HousingLocationMap`
// defers maplibre (see that component's own doc).
const PlaceLinkCardBody = lazy(() =>
  import("./PlaceLinkCardBody").then((module) => ({
    default: module.PlaceLinkCardBody,
  })),
);

export interface MessageLinkCardProps {
  /** The first link in the message body: the OG card's own href, and the
   *  fallback accessible-name source (see `LinkPreview`). */
  url: string;
  /** The shared resolution result from `useMessageLinkCard(url)`. The caller
   *  resolves it (it also needs `isLoading`/`hasContent` for its own
   *  link-only "hide the text" gate); this component only renders it. */
  state: MessageLinkCardState;
  /** True on the current user's own outgoing (plum) bubble, forwarded to the
   *  OG `LinkPreview` branch for its sent/received recolor. */
  isSent: boolean;
}

/**
 * One card, whichever kind `url` resolves to: the real directory place card
 * for a shared QueerPulse place link, or today's OpenGraph `LinkPreview` for
 * every other link (and as the fallback for a place link whose slug doesn't
 * resolve). Shared by `TextBubble` (MessageBubbleBody.tsx, for the OG-unfurl
 * and still-resolving cases; a resolved place link hands off to
 * `PlaceShareBubble`, which mounts this same component) and
 * `ShareToChatPreview` so the sent bubble and its live preview can never
 * render two different cards for the same body.
 *
 * Loading and "nothing to show" both render exactly as `LinkPreview` already
 * did (a slim skeleton, then nothing for an unresolved/un-previewable URL); a
 * place card just replaces what used to always be the OG branch once one
 * resolves.
 */
export function MessageLinkCard({ url, state, isSent }: MessageLinkCardProps) {
  const { placeSlug, place, ogPreview, isLoading } = state;

  if (isLoading) {
    return <div className={previewStyles.skeleton} aria-hidden="true" />;
  }

  if (placeSlug && place) {
    return (
      <Suspense
        fallback={<div className={previewStyles.skeleton} aria-hidden="true" />}
      >
        <PlaceLinkCardBody place={place} />
      </Suspense>
    );
  }

  return (
    <LinkPreview url={url} data={ogPreview} isLoading={false} isSent={isSent} />
  );
}
