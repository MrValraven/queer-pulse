import { AnimatePresence } from "motion/react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useStudioAccess } from "../api/useStudioAccess";
import { StudioShareCardFrame } from "./StudioShareCardFrame";
import {
  StudioShareCardLayer,
  StudioShareCardStatusBody,
} from "./StudioShareCardStates";
import { studioShareTargetKey, type StudioShareKind } from "./studioLinkTarget";
import type { StudioShareCardProps } from "./studioShareCard.types";
import { studioShareCardStatus } from "./studioShareCardModel";
import { studioShareLabelKey } from "./studioShareLabel";
import { StudioShareLyricCard } from "./StudioShareLyricCard";
import { StudioShareMilestoneCard } from "./StudioShareMilestoneCard";
import { StudioSharePlaylistCard } from "./StudioSharePlaylistCard";
import { StudioShareReleaseCard } from "./StudioShareReleaseCard";
import { StudioShareTrackCard } from "./StudioShareTrackCard";

const VARIANT_BY_KIND: Record<StudioShareKind, typeof StudioShareTrackCard> = {
  track: StudioShareTrackCard,
  release: StudioShareReleaseCard,
  playlist: StudioSharePlaylistCard,
  lyric: StudioShareLyricCard,
  milestone: StudioShareMilestoneCard,
};

/**
 * One shared Studio link as a card, resolved by the reader's own Studio
 * reads (spec invariant 1). Without a grant it shows the teaser and makes no
 * request. Loaded through `LazyStudioShareCard`, so none of this reaches a
 * chunk until a card mounts.
 */
export function StudioShareCard({
  target,
  surface,
  onRemove,
}: StudioShareCardProps) {
  const { t } = useTranslation();
  const access = useStudioAccess();
  const Variant = VARIANT_BY_KIND[target.kind];
  // The teaser (and the wait for the grant) pass no load state: no read runs.
  const accessStatus = studioShareCardStatus(access, null, false);
  return (
    <StudioShareCardFrame
      surface={surface}
      kind={target.kind}
      label={t(studioShareLabelKey(target.kind))}
      onRemove={onRemove}
    >
      {access.hasAccess ? (
        // Keyed by the target so an edited composer link starts fresh.
        <Variant key={studioShareTargetKey(target)} target={target} />
      ) : (
        <AnimatePresence initial={false}>
          <StudioShareCardLayer key={accessStatus}>
            <StudioShareCardStatusBody
              status={accessStatus === "ready" ? "loading" : accessStatus}
            />
          </StudioShareCardLayer>
        </AnimatePresence>
      )}
    </StudioShareCardFrame>
  );
}
