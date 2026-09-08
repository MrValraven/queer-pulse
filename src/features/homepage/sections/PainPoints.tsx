import { useState } from "react";
import { Reveal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { builtSteps } from "../data/painPoints";
import {
  BuiltCardHead,
  BuiltStepButton,
  BuiltStepDetail,
} from "./PainPointsParts";
import styles from "./PainPoints.module.css";

/**
 * "We built the community we wanted to find." — one big card carrying the
 * section title, an icon rail of everything we built, and the selected step's
 * detail beside it (the Discovery spotlight idiom: pick a row, the card shows
 * it). Each step plays as a short conversation: two voices name the gap, we
 * answer with what we built, the first voice comes back on what changed.
 *
 * The voices are composite characters we wrote, never members and never
 * photographs. See `voices` in `data/painPoints.ts`.
 */
export function PainPoints() {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState(builtSteps[0]?.key ?? "");
  const activeStep =
    builtSteps.find((step) => step.key === activeKey) ?? builtSteps[0];

  return (
    <section className={styles.pain} id="why">
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
                    onSelect={() => setActiveKey(step.key)}
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
