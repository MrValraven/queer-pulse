import type { AdminCreatorDraftDetail } from "../api/adminCreatorDrafts.api";
import { CommunityDraftPreview } from "./previews/CommunityDraftPreview";
import { EventDraftPreview } from "./previews/EventDraftPreview";
import { ListingDraftPreview } from "./previews/ListingDraftPreview";
import { PersonaDraftPreview } from "./previews/PersonaDraftPreview";
import { StudioDraftPreview } from "./previews/StudioDraftPreview";

/**
 * The draft through the public renderer of its kind. Each preview component
 * wraps itself in `CreatorDraftPreviewFrame`, which keeps every link and
 * button inert, so this switch only picks the renderer and its props.
 */
export function AdminCreatorDraftPreview({
  detail,
}: {
  detail: AdminCreatorDraftDetail;
}) {
  switch (detail.kind) {
    case "persona":
      return <PersonaDraftPreview preview={detail.preview} />;
    case "studio_release":
      return (
        <StudioDraftPreview preview={detail.preview} episodeTrackId={null} />
      );
    case "studio_episode":
      return (
        <StudioDraftPreview
          preview={detail.preview}
          episodeTrackId={detail.episodeTrackId}
        />
      );
    case "listing":
      return <ListingDraftPreview preview={detail.preview} slug={null} />;
    case "listing_edit":
      return (
        <ListingDraftPreview
          preview={detail.preview}
          slug={detail.listing.slug}
        />
      );
    case "event":
      return (
        <EventDraftPreview preview={detail.preview} owner={detail.owner} />
      );
    case "community":
      return <CommunityDraftPreview preview={detail.preview} />;
    default: {
      // A new kind fails the type check here until it gets a renderer.
      const unhandledDetail: never = detail;
      return unhandledDetail;
    }
  }
}
