import { useEffect, useRef, type ReactElement } from "react";
import { LayoutGroup, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { PageShell } from "../../../shared/components/layout";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isPrerendering } from "../../../shared/prerender";
import { PageMeta } from "../../../shared/seo";
import { useLandingVisitBeacon } from "../../homepage/api/useLandingVisitBeacon";
import { useStudioLanding } from "../api/useStudioLanding";
import { STUDIO_SPRING_SOFT } from "../studioMotion";
import {
  STUDIO_LANDING_ARTISTS_ID,
  STUDIO_LANDING_LISTEN_ID,
  STUDIO_LANDING_OG_IMAGE,
  STUDIO_LANDING_SECTION_ORDER,
  type StudioLandingSectionId,
} from "./studioLanding.data";
import { StudioLandingArtists } from "./StudioLandingArtists";
import { StudioLandingClosing } from "./StudioLandingClosing";
import { StudioLandingComparison } from "./StudioLandingComparison";
import { StudioLandingFaq } from "./StudioLandingFaq";
import { StudioLandingForArtists } from "./StudioLandingForArtists";
import { StudioLandingHero } from "./StudioLandingHero";
import { StudioLandingListen } from "./StudioLandingListen";
import { StudioLandingManifesto } from "./StudioLandingManifesto";
import { StudioLandingNextSteps } from "./StudioLandingNextSteps";
import { StudioLandingPlan } from "./StudioLandingPlan";
import { StudioLandingProof } from "./StudioLandingProof";
import { StudioLandingStory } from "./StudioLandingStory";
import { StudioLandingTeam } from "./StudioLandingTeam";
import { useStudioLandingAudience } from "./useStudioLandingAudience";
import styles from "./StudioLandingPage.module.css";

/** The component behind each section id, in no particular order. */
const STUDIO_LANDING_SECTIONS: Record<
  StudioLandingSectionId,
  () => ReactElement
> = {
  proof: () => <StudioLandingProof />,
  listen: () => <StudioLandingListen id={STUDIO_LANDING_LISTEN_ID} />,
  artists: () => <StudioLandingArtists />,
  forArtists: () => <StudioLandingForArtists />,
  story: () => <StudioLandingStory />,
  compare: () => <StudioLandingComparison />,
  plan: () => <StudioLandingPlan />,
  faq: () => <StudioLandingFaq />,
  next: () => <StudioLandingNextSteps />,
  team: () => <StudioLandingTeam />,
  manifesto: () => <StudioLandingManifesto />,
};

/** The sections above For artists fold open in the shared Collapse (0.28 s)
 *  when the landing read lands; the scroll waits for that fold plus a frame. */
const ARTISTS_SCROLL_AFTER_FOLD_MS = 320;
/** Scroll anyway when the landing read has not settled by then. */
const ARTISTS_SCROLL_FALLBACK_MS = 1500;

/** Scrolls the For artists section into view once when the page was opened on
 *  `#artists`, after the landing read settles and the sections above it have
 *  folded open, so Safari (no scroll anchoring) lands on the section. A read
 *  that never settles scrolls after the fallback. The guard is set inside the
 *  frame, so a cancelled timer or frame (a StrictMode remount) schedules again. */
function useScrollToArtistsOnce(
  isOpenedOnArtists: boolean,
  reducedMotion: boolean,
  isLandingSettled: boolean,
) {
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (!isOpenedOnArtists || hasScrolledRef.current) return;
    const foldDelay = reducedMotion ? 0 : ARTISTS_SCROLL_AFTER_FOLD_MS;
    const delay = isLandingSettled ? foldDelay : ARTISTS_SCROLL_FALLBACK_MS;
    let frame = 0;
    const timer = window.setTimeout(() => {
      frame = window.requestAnimationFrame(() => {
        hasScrolledRef.current = true;
        document.getElementById(STUDIO_LANDING_ARTISTS_ID)?.scrollIntoView({
          behavior: reducedMotion ? "instant" : "smooth",
          block: "start",
        });
      });
    }, delay);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, [isOpenedOnArtists, reducedMotion, isLandingSettled]);
}

/**
 * The Studio landing: what every visitor without a Studio grant sees at
 * /studio. Signed-out visitors, members still waiting for access, and a
 * staffer's visitor preview all land here, in demo and live alike.
 *
 * It sits in the marketing `PageShell`. One full-bleed, theme-following
 * island holds the hero, then the sections in the order the hero's
 * "I listen / I make music" switch picks (`STUDIO_LANDING_SECTION_ORDER`):
 * proof strip, Hear it first, Meet the artists, For artists, the scroll
 * story, the comparison, the plan, the FAQ, What happens next, Who runs it
 * and the manifesto. "I make music" brings For artists up to right after the
 * proof strip, and the sections glide to their new places (they jump under
 * reduced motion). The closing call to action follows the switch too.
 *
 * The page is indexed, and the build bakes its head only (title, description
 * and share image), since /studio is also Studio home for a granted member. It
 * counts one anonymous visit for signed-out live visitors through
 * the landing visit beacon, and it records nothing else. "Who runs it" waits
 * for the browser, so the baked HTML holds no governance read.
 */
export function StudioLandingPage() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { audience, setAudience, isOpenedOnArtists } =
    useStudioLandingAudience();
  useLandingVisitBeacon("studio");
  const { isLoading: isLandingLoading } = useStudioLanding();
  useScrollToArtistsOnce(isOpenedOnArtists, reducedMotion, !isLandingLoading);
  const isBaking = isPrerendering();
  const sectionIds = STUDIO_LANDING_SECTION_ORDER[audience].filter(
    (sectionId) => !(isBaking && sectionId === "team"),
  );

  return (
    <PageShell>
      <PageMeta
        title={t("studio:landing.metaTitle")}
        description={t("studio:landing.description")}
        image={STUDIO_LANDING_OG_IMAGE}
        imageAlt={t("studio:landing.ogImageAlt")}
        twitterCard="summary_large_image"
      />
      <div className={styles.island}>
        <StudioLandingHero audience={audience} onAudienceChange={setAudience} />
        <LayoutGroup id="studio-landing-sections">
          {sectionIds.map((sectionId) => {
            const renderSection = STUDIO_LANDING_SECTIONS[sectionId];
            return (
              <m.div
                key={sectionId}
                className={styles.slot}
                layout={reducedMotion ? false : "position"}
                transition={STUDIO_SPRING_SOFT}
              >
                {renderSection()}
              </m.div>
            );
          })}
        </LayoutGroup>
        <StudioLandingClosing audience={audience} />
      </div>
    </PageShell>
  );
}
