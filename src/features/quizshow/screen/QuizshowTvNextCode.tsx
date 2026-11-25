import { useEffect, useId } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowPairingDigits } from "./QuizshowPairingCode";
import type { QuizshowPairedClaim } from "./quizshowDeviceTicket";
import { SCREEN_EASE_OUT } from "./quizshowScreenMotion";
import { useQuizshowDevicePairing } from "./useQuizshowDevicePairing";
import styles from "./QuizshowTvPage.module.css";

interface QuizshowTvNextCodeProps {
  /** Called with the new claim once a remote pairs this TV for the next game. */
  onPaired: (claim: QuizshowPairedClaim) => void;
}

/**
 * A paired TV whose game ended keeps its thank-you card and shows a fresh
 * pairing code in a corner beside it, so the host pairs the screen again for
 * a rematch or the next game without walking to the TV. Mounted only after
 * the end (live only: the demo TV never pairs).
 */
export function QuizshowTvNextCode({ onPaired }: QuizshowTvNextCodeProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const titleId = useId();
  const pairing = useQuizshowDevicePairing("screen");
  const { status, claim } = pairing;
  useEffect(() => {
    if (status === "paired" && claim !== null) onPaired(claim);
  }, [claim, onPaired, status]);

  const isFailed = status === "failed";
  const failureKey = isFailed ? pairing.failureKey : null;
  return (
    <m.section
      className={styles.nextCode}
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, ease: SCREEN_EASE_OUT }}
    >
      <h2 id={titleId} className={styles.nextCodeTitle}>
        {t("quizshow:tv.nextGameTitle")}
      </h2>
      <p className={styles.note}>{t("quizshow:tv.body")}</p>
      <Collapse isOpen={!isFailed}>
        <QuizshowPairingDigits
          pairingCode={pairing.pairingCode}
          size="compact"
        />
      </Collapse>
      <Collapse isOpen={failureKey !== null}>
        <p className={styles.failure} role="alert">
          {failureKey !== null ? t(failureKey) : null}
        </p>
      </Collapse>
      <Collapse isOpen={isFailed}>
        <div className={styles.actions}>
          <Button variant="stage-ghost" onClick={pairing.restart}>
            {t("quizshow:tv.newCode")}
          </Button>
        </div>
      </Collapse>
    </m.section>
  );
}
