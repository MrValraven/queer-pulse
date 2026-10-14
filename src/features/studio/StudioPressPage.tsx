import { useSearchParams } from "react-router-dom";
import type { StudioPressKitView } from "./api/studio.adapters";
import { DEMO_DEFAULT_ARTIST_ID } from "./api/studioDemoMe.data";
import { useStudioPressKit } from "./api/useStudioPressKit";
import { StudioPressBar } from "./StudioPressBar";
import { StudioPressHero } from "./StudioPressHero";
import { PressLinks } from "./StudioPressLinks";
import {
  PressBestTracks,
  PressBio,
  PressContact,
  PressQuotes,
  PressReleases,
} from "./StudioPressSections";
import {
  PressShowcaseBoilerplate,
  PressShowcaseFacts,
  PressShowcasePhotos,
  PressShowcasePreview,
  PressShowcaseRequest,
} from "./StudioPressShowcase";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./StudioPressLayout.module.css";

function StudioPressKitBody({
  pressKit,
  hasShowcase,
}: {
  pressKit: StudioPressKitView;
  hasShowcase: boolean;
}) {
  return (
    <>
      <StudioPressHero pressKit={pressKit}>
        {hasShowcase && <PressShowcaseFacts />}
      </StudioPressHero>
      <PressBestTracks pressKit={pressKit} />
      {hasShowcase && <PressShowcasePreview />}
      <PressBio pressKit={pressKit} />
      {hasShowcase && <PressShowcasePhotos />}
      <PressReleases pressKit={pressKit} />
      <PressQuotes pressKit={pressKit} />
      <PressLinks pressKit={pressKit} />
      {hasShowcase && <PressShowcaseBoilerplate />}
      <PressContact pressKit={pressKit}>
        {hasShowcase && <PressShowcaseRequest />}
      </PressContact>
    </>
  );
}

/** A persona's press kit (`/studio/press?id=<subprofileId>`), for granted
 *  members while the persona is listenable and always for its owners. The
 *  demo opens Mariana Sol's without an id and adds its mock pieces there. */
export function StudioPressPage() {
  const [searchParams] = useSearchParams();
  const isShowcase = useStudioShowcase();
  const subprofileId =
    searchParams.get("id") ?? (isShowcase ? DEMO_DEFAULT_ARTIST_ID : null);
  const { pressKit, loadState } = useStudioPressKit(subprofileId);
  const hasShowcase =
    isShowcase && pressKit?.artist.id === DEMO_DEFAULT_ARTIST_ID;
  let body;
  // A press kit has no withdrawn view; a 410 reads as not found.
  if (loadState.isNotFound || loadState.isWithdrawn) body = <StudioNotFound />;
  else if (loadState.isError) body = <StudioLoadError loadState={loadState} />;
  else if (!pressKit) body = <StudioDetailSkeleton />;
  else
    body = <StudioPressKitBody pressKit={pressKit} hasShowcase={hasShowcase} />;
  return (
    <div className={styles.page}>
      <StudioPressBar pressKit={pressKit} isShowcase={hasShowcase} />
      <main className={styles.wrap}>{body}</main>
    </div>
  );
}
