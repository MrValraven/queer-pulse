import type { RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_SPRING } from "./studioMotion";
import css from "./StudioFirstRun.module.css";

/** Skip and Back pop in and out on the spring, a plain fade with reduced
 *  motion. */
function useNavItemMotion() {
  const { reducedMotion } = useMotionPrefs();
  return {
    initial: { opacity: 0, scale: reducedMotion ? 1 : 0.92 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: reducedMotion ? { duration: 0.12 } : STUDIO_SPRING,
    },
    exit: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.92,
      transition: reducedMotion ? { duration: 0.12 } : STUDIO_EXIT,
    },
  };
}

/** The welcome's footer on one row: Back from step 2 at the start, then
 *  Skip as a text button (until the last step, where Start listening
 *  finishes) and Next at the end. Next never moves or unmounts, so keyboard
 *  focus rides along from step to step. */
export function StudioFirstRunNav({
  stepIndex,
  isLastStep,
  nextButtonRef,
  onSkip,
  onBack,
  onNext,
}: {
  stepIndex: number;
  isLastStep: boolean;
  nextButtonRef: RefObject<HTMLButtonElement | null>;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const itemMotion = useNavItemMotion();
  return (
    <div className={css.nav}>
      <span className={css.navStart}>
        <AnimatePresence initial={false}>
          {stepIndex > 0 && (
            <m.span key="back" className={css.navItem} {...itemMotion}>
              <Button
                variant="ghost"
                className={css.backButton}
                onClick={onBack}
              >
                <FiArrowLeft aria-hidden />
                {t("studio:firstRun.backCta")}
              </Button>
            </m.span>
          )}
        </AnimatePresence>
      </span>
      <span className={css.navEnd}>
        <AnimatePresence initial={false} mode="popLayout">
          {!isLastStep && (
            <m.span key="skip" className={css.navItem} {...itemMotion}>
              <Button variant="quiet" className={css.skipText} onClick={onSkip}>
                {t("studio:firstRun.skipCta")}
              </Button>
            </m.span>
          )}
        </AnimatePresence>
        <Button ref={nextButtonRef} variant="primary" onClick={onNext}>
          {t(
            isLastStep
              ? "studio:firstRun.finishCta"
              : "studio:firstRun.nextCta",
          )}
          <FiArrowRight aria-hidden />
        </Button>
      </span>
    </div>
  );
}
