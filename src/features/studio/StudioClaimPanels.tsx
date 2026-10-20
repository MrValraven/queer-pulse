import { AnimatePresence } from "motion/react";
import { CollapseListItem } from "../../shared/components/ui";
import type { StudioReleaseView, StudioTrackView } from "./api/studio.adapters";
import type { StudioOwnerClaimView } from "./api/studioSafetyFields";
import { StudioClaimPanel } from "./StudioClaimPanel";
import { StudioWithheldBanner } from "./StudioWithheldBanner";
import css from "./StudioClaimPanel.module.css";

// Each row folds with the shared Collapse motion (curve, duration, clipping
// while it moves), so a panel that arrives or leaves never spills.
function ClaimPanelList({
  claims,
  trackTitleOf,
  releaseId,
}: {
  claims: readonly StudioOwnerClaimView[];
  trackTitleOf: (trackId: string) => string;
  releaseId: string;
}) {
  return (
    <ul className={css.list}>
      <AnimatePresence initial={false}>
        {claims.map((claim) => (
          <CollapseListItem key={claim.id}>
            <StudioClaimPanel
              claim={claim}
              trackTitle={trackTitleOf(claim.trackId)}
              releaseId={releaseId}
            />
          </CollapseListItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/** The owner's claim panels on the release page, one per claim, newest
 *  first, each naming its track. One banner above them counts the tracks a
 *  claim holds offline. Listeners get none (the adapter empties `claims`). */
export function StudioReleaseClaimPanels({
  release,
}: {
  release: StudioReleaseView;
}) {
  const claims = release.isOwner ? (release.claims ?? []) : [];
  const ownerRows = release.ownerTracks ?? release.tracks;
  const heldTrackCount = new Set(
    claims.filter((claim) => claim.isHolding).map((claim) => claim.trackId),
  ).size;
  return (
    <>
      <StudioWithheldBanner
        isShown={heldTrackCount > 0}
        heldTrackCount={heldTrackCount}
      />
      <ClaimPanelList
        claims={claims}
        trackTitleOf={(trackId) =>
          ownerRows.find((track) => track.id === trackId)?.title ?? ""
        }
        releaseId={release.id}
      />
    </>
  );
}

/** The same panels on the owner's track page, where StudioTrackPage puts
 *  the one banner that says the track is offline. */
export function StudioTrackClaimPanels({ track }: { track: StudioTrackView }) {
  return (
    <ClaimPanelList
      claims={track.claims ?? []}
      trackTitleOf={() => track.title}
      releaseId={track.releaseId}
    />
  );
}
