import { useId, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiArrowDown, FiMic } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useStudioLanding } from "../api/useStudioLanding";
import { STUDIO_EXIT, STUDIO_FADE, STUDIO_SPRING_SOFT } from "../studioMotion";
import {
  STUDIO_LANDING_LISTEN_ID,
  STUDIO_LANDING_STORY_HEADING_ID,
  STUDIO_LANDING_STORY_ID,
  type StudioLandingAudience,
} from "./studioLanding.data";
import { StudioLandingAudienceSwitch } from "./StudioLandingAudienceSwitch";
import { StudioLandingCta } from "./StudioLandingCta";
import { StudioLandingHeroVisual } from "./StudioLandingHeroVisual";
import styles from "./StudioLandingHero.module.css";

/** Under reduced motion a swap still fades, briefly, so the change reads. */
const REDUCED_FADE = { duration: 0.12, ease: "linear" } as const;

interface StudioLandingHeroProps {
  audience: StudioLandingAudience;
  onAudienceChange: (next: StudioLandingAudience) => void;
}

/** Hides the outgoing side of a crossfade from assistive tech, so a heading
 *  or link is announced with its new text only. */
function PresenceHidden({ children }: { children: ReactNode }) {
  const isPresent = useIsPresent();
  return <span aria-hidden={isPresent ? undefined : true}>{children}</span>;
}

/** Crossfades its content whenever `swapKey` changes: the new text fades in
 *  where the old one fades out, the old one popped out of the flow. */
function HeroSwap({
  swapKey,
  className,
  children,
}: {
  swapKey: string;
  className?: string;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.span
        key={swapKey}
        className={className}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: reducedMotion ? REDUCED_FADE : STUDIO_FADE,
        }}
        exit={{
          opacity: 0,
          transition: reducedMotion ? REDUCED_FADE : STUDIO_EXIT,
        }}
      >
        <PresenceHidden>{children}</PresenceHidden>
      </m.span>
    </AnimatePresence>
  );
}

/** The heading a section link moves focus to: the story's named heading, or
 *  Hear it first's `<h2>` (`<section id>-heading`). */
function headingOfSection(sectionId: string): HTMLElement | null {
  if (sectionId === STUDIO_LANDING_STORY_ID) {
    return document.getElementById(STUDIO_LANDING_STORY_HEADING_ID);
  }
  return document.getElementById(`${STUDIO_LANDING_LISTEN_ID}-heading`);
}

/**
 * Opening section of the Studio landing: the eyebrow, the "I listen / I make
 * music" switch, the page's only `<h1>`, the lede, the access status, the
 * call to action and a link further down, beside the hero visual. The title
 * and lede crossfade with the audience. The secondary link reads "Hear it
 * first" and goes to the previews while the landing read has any, else "See
 * inside" and the scroll story; it scrolls there and moves focus to the
 * section heading. The status pill shows only signed out, since a member's
 * access request already says how access opens. On phones the copy and CTA
 * come first, then the visual.
 */
export function StudioLandingHero({
  audience,
  onAudienceChange,
}: StudioLandingHeroProps) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const { reducedMotion } = useMotionPrefs();
  const { landing } = useStudioLanding();
  const titleId = useId();
  const hasPreviews = (landing?.previews.length ?? 0) > 0;
  const targetId = hasPreviews
    ? STUDIO_LANDING_LISTEN_ID
    : STUDIO_LANDING_STORY_ID;
  const layoutMode = reducedMotion ? false : "position";

  function handleSecondaryLink(clickEvent: MouseEvent<HTMLAnchorElement>) {
    clickEvent.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    headingOfSection(targetId)?.focus({ preventScroll: true });
  }

  return (
    <section className={styles.hero} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <FiMic aria-hidden="true" className={styles.eyebrowIcon} />
            {t("studio:landing.hero.eyebrow")}
          </p>
          <StudioLandingAudienceSwitch
            audience={audience}
            onChange={onAudienceChange}
          />
          <h1 id={titleId} className={styles.title}>
            <HeroSwap swapKey={audience} className={styles.swapBlock}>
              <Translation
                i18nKey={
                  audience === "artist"
                    ? "studio:landing.hero.artistTitle"
                    : "studio:landing.hero.title"
                }
                components={{ em: <em /> }}
              />
            </HeroSwap>
          </h1>
          <m.p
            layout={layoutMode}
            transition={STUDIO_SPRING_SOFT}
            className={styles.lede}
          >
            <HeroSwap swapKey={audience} className={styles.swapBlock}>
              {audience === "artist"
                ? t("studio:landing.hero.artistLede")
                : t("studio:landing.hero.lede")}
            </HeroSwap>
          </m.p>
          {loggedIn ? null : (
            <m.p
              layout={layoutMode}
              transition={STUDIO_SPRING_SOFT}
              className={styles.status}
            >
              <span className={styles.statusDot} aria-hidden="true" />
              {t("studio:landing.hero.status")}
            </m.p>
          )}
          <m.div
            layout={layoutMode}
            transition={STUDIO_SPRING_SOFT}
            className={
              loggedIn
                ? `${styles.actions} ${styles.actionsMember}`
                : styles.actions
            }
          >
            <StudioLandingCta placement="hero" audience={audience} />
            <a
              className={styles.secondaryLink}
              href={`#${targetId}`}
              onClick={handleSecondaryLink}
            >
              <HeroSwap
                swapKey={hasPreviews ? "listen" : "story"}
                className={styles.swapInline}
              >
                {hasPreviews
                  ? t("studio:landing.hero.hearItFirst")
                  : t("studio:landing.hero.seeInside")}
              </HeroSwap>
              <FiArrowDown aria-hidden="true" />
            </a>
          </m.div>
        </div>
        <m.div
          layout={layoutMode}
          transition={STUDIO_SPRING_SOFT}
          className={styles.visual}
        >
          <StudioLandingHeroVisual photo={landing?.photos.hero ?? null} />
        </m.div>
      </div>
    </section>
  );
}
