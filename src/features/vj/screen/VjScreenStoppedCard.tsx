import type { JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiRefreshCw } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useIsPointerIdle } from "./useIsPointerIdle";
import styles from "./VjScreen.module.css";

/** With no pointer or key activity for this long, the card fades out, so the
 *  projector shows the room plain black. */
const VJ_STOPPED_CARD_IDLE_MS = 6_000;
/** The slow fade to black; reduced motion makes it instant. */
const VJ_STOPPED_CARD_IDLE_FADE_SECONDS = 1.2;

/** The card itself; it mounts with the stop, so its idle wait starts then. */
function VjScreenStoppedPanel(): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isIdle = useIsPointerIdle(VJ_STOPPED_CARD_IDLE_MS);
  return (
    <m.section
      className={styles.setupCard}
      aria-labelledby="vj-screen-stopped"
      animate={{ opacity: isIdle ? 0 : 1 }}
      transition={{
        duration: reducedMotion ? 0 : VJ_STOPPED_CARD_IDLE_FADE_SECONDS,
      }}
    >
      <header className={styles.setupHeader}>
        <h1 id="vj-screen-stopped" className={styles.setupTitle}>
          {t("vj:screen.stoppedTitle")}
        </h1>
        <p className={styles.setupHint} role="status">
          {t("vj:screen.stoppedHint")}
        </p>
      </header>
      <Button
        variant="stage-ghost"
        size="lg"
        className={styles.setupAction}
        onClick={() => window.location.reload()}
      >
        <FiRefreshCw aria-hidden="true" focusable="false" />
        {t("vj:screen.connectAgain")}
      </Button>
    </m.section>
  );
}

/**
 * What a screen shows once Live connections in the VJ library stopped it: the
 * stage is gone, so the GPU and the video decoders rest, and the one way back
 * is a reload, which attaches as a fresh screen. The projector faces a room,
 * so after a few still seconds the card fades out over the black page; a
 * pointer move or a key brings it back.
 */
export function VjScreenStoppedCard({
  isShown,
  fadeSeconds,
}: {
  isShown: boolean;
  fadeSeconds: number;
}): JSX.Element {
  return (
    <AnimatePresence>
      {isShown ? (
        <m.div
          key="stopped"
          className={styles.setupLayer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeSeconds }}
        >
          <VjScreenStoppedPanel />
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
