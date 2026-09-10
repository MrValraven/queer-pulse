import type { CSSProperties } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiInfo,
} from "react-icons/fi";
import { focusControl } from "../../../shared/lib/focusFirstError";
import { prefersReducedMotionNow } from "../../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StepRequirement as StepRequirementRow } from "../createGatheringSteps";
import styles from "../CreateGatheringPage.module.css";

/**
 * The line under a step's title saying whether the host has to fill this step
 * in at all. Repeats and capacity are entirely skippable, and nothing on screen
 * used to say so: a host with nothing to add stalled on a step wondering what
 * the wizard wanted from them.
 */
export function StepRequirementBadge({ required }: { required: boolean }) {
  const { t } = useTranslation();
  return (
    <p
      className={[styles.stepBadge, required && styles.stepBadgeRequired]
        .filter(Boolean)
        .join(" ")}
    >
      {required ? <FiCheckCircle aria-hidden /> : <FiInfo aria-hidden />}
      {t(
        required
          ? "gatherings:create.stepBadge.required"
          : "gatherings:create.stepBadge.optional",
      )}
    </p>
  );
}

/** Controls a field group can hand focus to. Native inputs plus the button
 *  groups and `role="checkbox"` rows the wizard uses for its own choices. */
const FOCUSABLE_IN_FIELD =
  'input:not([type="hidden"]), select, textarea, button, [role="checkbox"], [tabindex]:not([tabindex="-1"])';

/** How long the flash runs, matching `.gateFlash`'s animation. */
const FLASH_MS = 1400;

/**
 * Send the host to the field a checklist row names: scroll it into view, put
 * focus in it, and flash it so the eye lands on the right thing.
 *
 * Focus goes to the field group itself when it can take focus (the publish
 * pledges are `role="checkbox"` rows) and otherwise to its first control, so
 * arriving means being able to type or press space straight away rather than
 * merely looking at the field. `focusControl` owns the scroll — it focuses
 * without the browser's own jump-to-top-edge, then scrolls to centre, and
 * honours reduced motion.
 */
function jumpToRequirement(anchor: string, flashClass?: string): void {
  const field = document.getElementById(anchor);
  if (!field) return;

  const control =
    field.tabIndex >= 0
      ? field
      : field.querySelector<HTMLElement>(FOCUSABLE_IN_FIELD);
  // A field group with nothing focusable in it still gets scrolled to.
  if (!focusControl(control) && typeof field.scrollIntoView === "function") {
    field.scrollIntoView({
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
      block: "center",
    });
  }

  if (!flashClass) return;
  // Restart the flash even when the same row is clicked twice in a row.
  field.classList.remove(flashClass);
  void field.offsetWidth;
  field.classList.add(flashClass);
  window.setTimeout(() => field.classList.remove(flashClass), FLASH_MS);
}

/**
 * What is still standing between the host and the next step, right above the
 * button it blocks.
 *
 * This used to be the disabled button's `title`, which is a native tooltip: it
 * never appears on touch, most browsers refuse to show one on a disabled
 * control at all, and a disabled control cannot be focused, so a host on a
 * phone or a keyboard was left with a dead button and no reason for it. The
 * rows tick over live as fields fill in, and the whole block is a polite live
 * region so the change is announced rather than only drawn.
 */
export function StepRequirementChecklist({
  id,
  requirements,
  isLastStep,
}: {
  id: string;
  requirements: StepRequirementRow[];
  isLastStep: boolean;
}) {
  const { t } = useTranslation();
  const unmetCount = requirements.filter(
    (requirement) => !requirement.met,
  ).length;

  return (
    <div id={id} className={styles.gate} aria-live="polite">
      {unmetCount === 0 ? (
        <p className={[styles.gateHead, styles.gateHeadReady].join(" ")}>
          <FiCheckCircle aria-hidden />
          {/* A step that asks nothing of the host at all (capacity, or repeats
              left switched off) says so plainly. "Everything required is filled
              in" would imply there had been something to fill in. */}
          {t(
            isLastStep
              ? "gatherings:create.gate.readyPublish"
              : requirements.length === 0
                ? "gatherings:create.gate.readyOptional"
                : "gatherings:create.gate.ready",
          )}
        </p>
      ) : (
        <>
          <p className={styles.gateHead}>
            {t(
              isLastStep
                ? "gatherings:create.gate.blockedTitlePublish"
                : "gatherings:create.gate.blockedTitle",
            )}
          </p>
          <ul className={styles.gateList}>
            {requirements.map((requirement, index) => (
              <li
                key={requirement.key}
                className={[
                  styles.gateItem,
                  requirement.met && styles.gateItemMet,
                ]
                  .filter(Boolean)
                  .join(" ")}
                /* Each row enters a beat after the one above it, so the list
                   reads top to bottom instead of landing all at once. */
                style={{ "--gate-item-index": index } as CSSProperties}
              >
                {/* The row is the way to the field, not only a report on it:
                    naming "pick a format" and leaving the host to scroll back
                    past eight cards to find it is a step they should not have
                    to take. */}
                <button
                  type="button"
                  className={styles.gateItemJump}
                  onClick={() =>
                    jumpToRequirement(requirement.anchor, styles.gateFlash)
                  }
                >
                  {requirement.met ? (
                    <FiCheck className={styles.gateItemIcon} aria-hidden />
                  ) : (
                    <FiCircle className={styles.gateItemIcon} aria-hidden />
                  )}
                  {/* The icon carries the done/still-to-do state visually; this
                      says the same thing for a screen reader, which would
                      otherwise hear an undifferentiated list of demands. */}
                  <span className="visuallyHidden">
                    {t(
                      requirement.met
                        ? "gatherings:create.gate.itemDone"
                        : "gatherings:create.gate.itemTodo",
                    )}{" "}
                  </span>
                  {/* The strike-through that marks a requirement done is drawn
                      on this span so it can fade in rather than appear. */}
                  <span className={styles.gateItemLabel}>
                    {t(requirement.labelKey)}
                  </span>
                  {/* A button whose name is only the demand does not say what
                      pressing it does. Sighted hosts read that off the arrow. */}
                  <span className="visuallyHidden">
                    {" "}
                    {t("gatherings:create.gate.jumpHint")}
                  </span>
                  <FiArrowRight className={styles.gateItemArrow} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
