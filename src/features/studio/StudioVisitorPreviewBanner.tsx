import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import styles from "./StudioVisitorPreviewBanner.module.css";

/** The visible pill. A child of AnimatePresence, so it goes inert while it
 *  plays its exit. Exit preview takes focus as the pill lands: the View as
 *  visitor control it replaces has just left the page. */
function StudioVisitorPreviewPill({ onExit }: { onExit: () => void }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const exitRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    exitRef.current?.focus({ preventScroll: true });
  }, []);
  const hidden = { opacity: 0, y: reducedMotion ? 0 : 12 };
  return (
    <m.div
      className={styles.bar}
      role="status"
      inert={!isPresent}
      initial={hidden}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        ...hidden,
        transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
      }}
      transition={reducedMotion ? { duration: 0 } : STUDIO_FADE}
    >
      <span className={styles.text}>
        <Translation
          i18nKey="studio:artistPage.visitorPreview.banner"
          components={{ strong: <strong /> }}
        />
      </span>
      <Button
        ref={exitRef}
        variant="quiet"
        className={styles.exit}
        onClick={onExit}
      >
        {t("studio:artistPage.visitorPreview.exit")}
      </Button>
    </m.div>
  );
}

/**
 * The floating pill shown while an artist's owner reads their own Studio
 * page as a visitor, with the way back out. Modelled on the persona page's
 * `SubprofilePreviewBanner` so the two previews read as one affordance, and
 * fixed above the Studio player bar so the exit stays reachable from
 * anywhere on a long page. Portaled to the body, so no scrolling container
 * clips it.
 */
export function StudioVisitorPreviewBanner({
  isShown,
  onExit,
}: {
  isShown: boolean;
  onExit: () => void;
}) {
  return createPortal(
    <AnimatePresence>
      {isShown && (
        <StudioVisitorPreviewPill
          key="studio-visitor-preview"
          onExit={onExit}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
