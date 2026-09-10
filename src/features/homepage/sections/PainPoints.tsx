import { useCallback, useMemo, useState } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Reveal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { builtSteps } from "../data/painPoints";
import {
  BuiltCardHead,
  BuiltStepButton,
  BuiltStepDetail,
} from "./PainPointsParts";
import {
  BUILT_STEP_ROTATION_INTERVAL_MS,
  useSectionRotation,
} from "./useSectionRotation";
import styles from "./PainPoints.module.css";

/**
 * "We built the community we wanted to find." — one big card carrying the
 * section title, an icon rail of everything we built, and the selected step's
 * detail beside it (the Discovery spotlight idiom: pick a row, the card shows
 * it). Each step plays as a short conversation: two voices name the gap, we
 * answer with what we built, the first voice comes back on what changed.
 *
 * The card walks the rail on its own so a reader who never clicks still sees
 * more than the first step, and the first click anywhere inside it hands the
 * card over for good (`useSectionRotation`).
 *
 * The voices are composite characters we wrote, never members and never
 * photographs. See `voices` in `data/painPoints.ts`.
 */
export function PainPoints() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [activeKey, setActiveKey] = useState(builtSteps[0]?.key ?? "");
  const [isRotationStopped, setIsRotationStopped] = useState(false);
  const activeStep =
    builtSteps.find((step) => step.key === activeKey) ?? builtSteps[0];

  const rotationOrder = useMemo(() => builtSteps.map((step) => step.key), []);

  /**
   * Any click inside the card ends rotation, not only a rail button: the
   * detail pane's links and its explainer modal are just as much "the reader
   * took over", and the modal portals out of this section, so hover and focus
   * pausing cannot see it.
   */
  const stopRotation = useCallback(() => {
    setIsRotationStopped(true);
  }, []);

  const selectStep = useCallback((key: string) => {
    setActiveKey(key);
    setIsRotationStopped(true);
  }, []);

  const { sectionRef, pauseHandlers } = useSectionRotation({
    order: rotationOrder,
    selectedKey: activeKey,
    onRotate: setActiveKey,
    isStopped: isRotationStopped,
    isEnabled: !reducedMotion,
    intervalMs: BUILT_STEP_ROTATION_INTERVAL_MS,
  });

  return (
    <section
      className={styles.pain}
      id="why"
      ref={sectionRef}
      onClickCapture={stopRotation}
      {...pauseHandlers}
    >
      <div className={styles.wrap}>
        <Reveal>
          <div className={styles.card}>
            <BuiltCardHead />

            <div className={styles.focus}>
              <div className={styles.rail}>
                {builtSteps.map((step) => (
                  <BuiltStepButton
                    key={step.key}
                    step={step}
                    active={step.key === activeStep?.key}
                    onSelect={() => selectStep(step.key)}
                  />
                ))}
              </div>
              {/* Keyed on the step so switching remounts the thread and it
                  fades in, rather than swapping text in place. */}
              {activeStep && (
                <BuiltStepDetail key={activeStep.key} step={activeStep} />
              )}
            </div>

            <p className={styles.voicesNote}>
              {t("homepage:painPoints.voicesNote")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
