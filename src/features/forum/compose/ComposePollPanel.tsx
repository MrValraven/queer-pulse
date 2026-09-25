import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COMPOSE_POLL_MAX_OPTIONS,
  COMPOSE_POLL_MIN_OPTIONS,
  type ComposePoll,
  type PollCloses,
} from "./composeThread.types";
import { ComposePollOptionRow } from "./ComposePollOptionRow";
import styles from "./ComposePollPanel.module.css";

// ── The poll attached to an opening post ────────────────────────────────────
// Two to six options, and the panel enforces both ends by making the control
// unavailable rather than by letting a click do nothing: at two options the ×
// on each row is disabled, at six the "Add option" pill is, and in both cases
// the reason is printed beside it. The setters in `useComposeThreadState`
// refuse the same moves, so the rule is true even if this row were wrong.
//
// Blank rows are allowed while typing. `pollNeedsTwoOptions` is what stops a
// publish until two of them carry text, which is why nothing here validates.

/** The four deadlines a poll may carry, in the order they are offered. */
const POLL_CLOSES_VALUES: readonly PollCloses[] = ["never", "3d", "1w", "2w"];

/** The house curve for things that grow into place, as a cubic bezier. */
const POLL_MOTION_EASE = [0.22, 0.68, 0.16, 1] as const;

/** Must match `gap` on `.controls`: the limit note slides that gap in with
 *  it, so the pills beside it glide over smoothly. */
const CONTROLS_GAP_PX = 14;

export interface ComposePollPanelProps {
  /** `id` of this panel. The "Add a poll" pill points `aria-controls` here. */
  id: string;
  /** The attached poll. The panel is only rendered when there is one. */
  poll: ComposePoll;
  onSetOption: (index: number, option: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onSetAllowMultiple: (allowMultiple: boolean) => void;
  onSetCloses: (closes: PollCloses) => void;
}

export function ComposePollPanel({
  id,
  poll,
  onSetOption,
  onAddOption,
  onRemoveOption,
  onSetAllowMultiple,
  onSetCloses,
}: ComposePollPanelProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const closesLabelId = useId();
  const canRemoveOption = poll.options.length > COMPOSE_POLL_MIN_OPTIONS;
  const canAddOption = poll.options.length < COMPOSE_POLL_MAX_OPTIONS;

  return (
    <section id={id} className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h3 id={headingId} className={styles.title}>
          {t("forum:composePage.poll.title")}
        </h3>
        <p className={styles.hint}>
          {t("forum:composePage.poll.hint", {
            min: COMPOSE_POLL_MIN_OPTIONS,
            max: COMPOSE_POLL_MAX_OPTIONS,
          })}
        </p>
      </div>

      <ol className={styles.options}>
        {/* Rows grow in and fold away. Keys are positions, so a removal
            always folds the LAST row while the text above it shifts up; that
            keeps focus on the same remove button it was on before. */}
        <AnimatePresence initial={false}>
          {poll.options.map((option, index) => (
            <ComposePollOptionRow
              // Poll options have no id of their own and the member reorders
              // nothing, so the position IS the identity here.
              key={index}
              index={index}
              option={option}
              canRemove={canRemoveOption}
              onSetOption={onSetOption}
              onRemoveOption={onRemoveOption}
            />
          ))}
        </AnimatePresence>
      </ol>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.addOption}
          onClick={onAddOption}
          disabled={!canAddOption}
        >
          <FiPlus aria-hidden />
          {t("forum:composePage.poll.addOption")}
        </button>
        <AnimatePresence initial={false}>
          {!canAddOption && (
            <m.span
              key="limit"
              className={styles.limit}
              initial={{
                opacity: 0,
                width: 0,
                marginInlineStart: -CONTROLS_GAP_PX,
              }}
              animate={{ opacity: 1, width: "auto", marginInlineStart: 0 }}
              exit={{
                opacity: 0,
                width: 0,
                marginInlineStart: -CONTROLS_GAP_PX,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.25,
                ease: POLL_MOTION_EASE,
              }}
            >
              {t("forum:composePage.poll.maxReached", {
                max: COMPOSE_POLL_MAX_OPTIONS,
              })}
            </m.span>
          )}
        </AnimatePresence>
        <label className={styles.checkLine}>
          <input
            type="checkbox"
            className={styles.checkBox}
            checked={poll.allowMultiple}
            onChange={(event) => onSetAllowMultiple(event.target.checked)}
          />
          <span>{t("forum:composePage.poll.allowMultiple")}</span>
        </label>
        <span className={styles.closes}>
          <span id={closesLabelId} className={styles.closesLabel}>
            {t("forum:composePage.poll.closesLabel")}
          </span>
          <Select
            size="sm"
            labelledBy={closesLabelId}
            value={poll.closes}
            onChange={(value) =>
              onSetCloses((value as PollCloses | null) ?? "never")
            }
            options={POLL_CLOSES_VALUES.map((value) => ({
              value,
              label: t(`forum:composePage.poll.closes.${value}`),
            }))}
          />
        </span>
      </div>
    </section>
  );
}
