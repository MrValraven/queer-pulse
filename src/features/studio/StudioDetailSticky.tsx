import { ImageSlot, type ImageSlotTint } from "../../shared/components/ui";
import type { StudioReleaseView } from "./api/studio.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioStickyHeader } from "./kit/StudioStickyHeader";
import { useStudioReleasePlay } from "./useStudioReleasePlay";

/** The sticky header's small square: the hero's cover at 42px. */
export function StudioStickyCover({
  src,
  tint,
  isRound = false,
}: {
  src: string | null;
  tint: ImageSlotTint;
  isRound?: boolean;
}) {
  return (
    <ImageSlot
      src={src ?? undefined}
      tint={tint}
      width="100%"
      height="100%"
      radius={isRound ? 9999 : 6}
      shape={isRound ? "circle" : undefined}
      placeholder=""
      style={{ position: "absolute", inset: 0 }}
    />
  );
}

/** A release page's compact header: cover, title and the same Play as the
 *  hero, once the hero has scrolled away. Nothing to play (an upcoming
 *  release a visitor reads) leaves the bar to the title alone. */
export function StudioReleaseStickyHeader({
  release,
  sentinel,
}: {
  release: StudioReleaseView;
  sentinel: Element | null;
}) {
  const play = useStudioReleasePlay(release);
  const isUpcomingForViewer = release.isUpcoming && !release.isOwner;
  return (
    <StudioStickyHeader
      sentinel={sentinel}
      title={release.title}
      tint={release.tint}
      cover={<StudioStickyCover src={release.coverUrl} tint={release.tint} />}
      actions={
        isUpcomingForViewer ? undefined : (
          <StudioPlayButton
            size="card"
            state={play.state}
            onToggle={play.toggle}
            label={play.label}
            blockedReason={play.blockedReason}
          />
        )
      }
    />
  );
}
