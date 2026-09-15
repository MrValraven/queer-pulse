import { useId } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COMPOSE_POLL_MAX_OPTIONS,
  COMPOSE_POLL_MIN_OPTIONS,
  type ComposePoll,
  type PollCloses,
} from "./composeThread.types";
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
        {poll.options.map((option, index) => (
          <PollOptionRow
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
        {!canAddOption && (
          <span className={styles.limit}>
            {t("forum:composePage.poll.maxReached", {
              max: COMPOSE_POLL_MAX_OPTIONS,
            })}
          </span>
        )}
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

interface PollOptionRowProps {
  index: number;
  option: string;
  canRemove: boolean;
  onSetOption: (index: number, option: string) => void;
  onRemoveOption: (index: number) => void;
}

function PollOptionRow({
  index,
  option,
  canRemove,
  onSetOption,
  onRemoveOption,
}: PollOptionRowProps) {
  const { t } = useTranslation();
  const optionName = t("forum:composePage.poll.optionLabel", {
    number: index + 1,
  });
  return (
    <li className={styles.optionRow}>
      <span className={styles.optionNumber} aria-hidden>
        {index + 1}
      </span>
      <input
        type="text"
        className={styles.optionInput}
        value={option}
        onChange={(event) => onSetOption(index, event.target.value)}
        aria-label={optionName}
        placeholder={optionName}
        autoComplete="off"
      />
      <button
        type="button"
        className={styles.removeOption}
        onClick={() => onRemoveOption(index)}
        disabled={!canRemove}
        aria-label={t("forum:composePage.poll.removeOption", {
          number: index + 1,
        })}
      >
        <FiX aria-hidden />
      </button>
    </li>
  );
}
