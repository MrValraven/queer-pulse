import { businessPath } from "../../app/routeMap";
import type { MessageLinkCardState } from "./api/useMessageLinkCard";
import type { ChatPlaceLinkInfo } from "./linkify";

/**
 * Builds `renderWithLinks`'s optional `placeLink` argument from a
 * `useMessageLinkCard` state, or `undefined` when the card is not (yet, or
 * ever) a resolved place. Shared by `TextBubble` (MessageBubbleBody.tsx) and
 * `ShareToChatPreview` so the sent bubble and its live preview swap the same
 * URL for the same place-name link and can never disagree.
 *
 * `previewUrl` is the same `firstLinkUrl(text)` value both callers already
 * pass into `useMessageLinkCard`; reusing it here (rather than reading
 * `linkCard.placeSlug` back into a URL) is what keeps `ChatPlaceLinkInfo.url`
 * comparable with `===` against a URL match found while splitting `text`.
 */
export function resolveChatPlaceLink(
  previewUrl: string | null,
  linkCard: Pick<MessageLinkCardState, "placeSlug" | "place">,
): ChatPlaceLinkInfo | undefined {
  if (!previewUrl || !linkCard.placeSlug || !linkCard.place) return undefined;
  return {
    url: previewUrl,
    name: linkCard.place.name,
    to: businessPath(linkCard.place.slug),
  };
}
