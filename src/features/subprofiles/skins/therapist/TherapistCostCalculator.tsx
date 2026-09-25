import { useId, useState, type ReactNode } from "react";
import { FiSliders } from "react-icons/fi";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { RollingNumber } from "../../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  AMOUNT_FORMAT,
  DEFAULT_SESSIONS_PER_MONTH,
  NO_INSURANCE_INDEX,
  SESSIONS_PER_MONTH_OPTIONS,
} from "./therapistPractical.data";
import { PracticalCell } from "./TherapistPracticalCells";
import { PracticalEditLink } from "./TherapistPracticalEdit";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { monthlyCost, type TherapistView } from "./therapistView";
import styles from "./TherapistPractical.module.css";

interface OptionGroupProps {
  label: string;
  children: ReactNode;
}

/** A labelled row of segmented `aria-pressed` toggles. */
function OptionGroup({ label, children }: OptionGroupProps) {
  const labelId = useId();
  return (
    <div className={styles.calcRow}>
      <span id={labelId}>{label}</span>
      <div className={styles.options} role="group" aria-labelledby={labelId}>
        {children}
      </div>
    </div>
  );
}

interface OptionProps {
  isPressed: boolean;
  onSelect: () => void;
  children: ReactNode;
}

function Option({ isPressed, onSelect, children }: OptionProps) {
  return (
    <button
      type="button"
      className={styles.option}
      aria-pressed={isPressed}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

/** "What you'd actually pay": sessions a month times the fee, less the
 *  chosen insurer's typical reimbursement. Local state only. Renders only
 *  when a standard fee is set. */
export function TherapistCostCalculator({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const format = useFormat();
  const formatAmount = (value: number) => format.number(value, AMOUNT_FORMAT);
  const [sessionsPerMonth, setSessionsPerMonth] = useState<number>(
    DEFAULT_SESSIONS_PER_MONTH,
  );
  const [insurerIndex, setInsurerIndex] = useState<number>(
    view.reimbursement.length > 0 ? 0 : NO_INSURANCE_INDEX,
  );
  // Flips on the first pick, so the detail lines fade on change only.
  const [hasChangedSelection, setHasChangedSelection] = useState(false);
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const selectSessions = (option: number) => {
    setSessionsPerMonth(option);
    setHasChangedSelection(true);
  };
  const selectInsurer = (index: number) => {
    setInsurerIndex(index);
    setHasChangedSelection(true);
  };

  const { standardFee, reimbursement, slidingRange } = view;
  if (standardFee === null) return null;

  const insurer = reimbursement[insurerIndex] ?? null;
  const reimbursedPerSession = insurer?.amount ?? 0;
  const cost = monthlyCost({
    standardFee,
    sessionsPerMonth,
    reimbursedPerSession,
    slidingMin: slidingRange ? slidingRange[0] : null,
  });
  const sessions = format.number(sessionsPerMonth);
  const net = formatAmount(cost.net);
  const shouldFadeDetail = hasChangedSelection && !isReducedMotion;

  return (
    <PracticalCell
      icon={FiSliders}
      title={t("subprofiles:therapist.practical.calculator.title")}
      isWide
    >
      <PracticalEditLink target={THERAPIST_EDIT_TARGETS.calculator} />
      <OptionGroup
        label={t("subprofiles:therapist.practical.calculator.sessionsLabel")}
      >
        {SESSIONS_PER_MONTH_OPTIONS.map((option) => (
          <Option
            key={option}
            isPressed={option === sessionsPerMonth}
            onSelect={() => selectSessions(option)}
          >
            {format.number(option)}
          </Option>
        ))}
      </OptionGroup>
      {reimbursement.length > 0 && (
        <OptionGroup
          label={t("subprofiles:therapist.practical.calculator.insurerLabel")}
        >
          {reimbursement.map((row, index) => (
            <Option
              key={`${row.label}-${index}`}
              isPressed={index === insurerIndex}
              onSelect={() => selectInsurer(index)}
            >
              {row.label}
            </Option>
          ))}
          <Option
            isPressed={insurer === null}
            onSelect={() => selectInsurer(NO_INSURANCE_INDEX)}
          >
            {t("subprofiles:therapist.practical.calculator.noInsurance")}
          </Option>
        </OptionGroup>
      )}
      <div className={styles.calcOut} aria-live="polite" aria-atomic="true">
        <p className={styles.calcTotal}>
          <span className={styles.calcTotalLabel}>
            {t("subprofiles:therapist.practical.calculator.perMonth")}
          </span>
          <span className={styles.calcBig}>
            <RollingNumber
              value={t("subprofiles:therapist.practical.amount", {
                amount: net,
              })}
              numericValue={cost.net}
            />
          </span>
        </p>
        <m.ul
          key={`${sessionsPerMonth}-${insurerIndex}`}
          className={styles.calcDetail}
          initial={shouldFadeDetail ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <li>
            {t("subprofiles:therapist.practical.calculator.gross", {
              sessions,
              fee: formatAmount(standardFee),
              gross: formatAmount(cost.gross),
            })}
          </li>
          <li>
            {insurer && reimbursedPerSession > 0
              ? t("subprofiles:therapist.practical.calculator.reimbursed", {
                  sessions,
                  amount: formatAmount(reimbursedPerSession),
                  insurer: insurer.label,
                })
              : t("subprofiles:therapist.practical.calculator.noReimbursement")}
          </li>
          {cost.slidingLow !== null && cost.slidingLow < cost.net && (
            <li>
              {t("subprofiles:therapist.practical.calculator.sliding", {
                low: formatAmount(cost.slidingLow),
                net,
              })}
            </li>
          )}
        </m.ul>
      </div>
      <p className={styles.hint}>
        {t("subprofiles:therapist.practical.calculator.hint")}
      </p>
    </PracticalCell>
  );
}
