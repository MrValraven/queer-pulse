import { useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { LuSprout, LuTreeDeciduous } from "react-icons/lu";
import { Button, Select, Sending } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  MATCH_FLOWS,
  type MatchArea,
  type MatchField,
  type Mode,
} from "./mentorship.data";
import styles from "./MentorshipPage.module.css";

function CheckGrid({ options }: { options: MatchArea[] }) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  return (
    <div className={styles.mmCheckGrid}>
      {options.map((option) => (
        <label
          key={option.id}
          className={[
            styles.mmCheck,
            checked.has(option.id) && styles.mmCheckActive,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="checkbox"
            checked={checked.has(option.id)}
            onChange={() =>
              setChecked((prev) => {
                const next = new Set(prev);
                if (next.has(option.id)) next.delete(option.id);
                else next.add(option.id);
                return next;
              })
            }
          />
          {t(option.labelKey)}
        </label>
      ))}
    </div>
  );
}

/** One placeholder-labelled control (input / select / textarea) in a step. */
function MatchFieldControl({ field }: { field: MatchField }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const label = t(field.placeholderKey);
  if (field.kind === "select") {
    return (
      <Select
        label={label}
        placeholder={label}
        options={(field.optionKeys ?? []).map((optionKey) => ({
          value: t(optionKey),
          label: t(optionKey),
        }))}
        value={selected}
        onChange={setSelected}
      />
    );
  }
  if (field.kind === "textarea") {
    return (
      <textarea
        className={styles.mmTextarea}
        rows={field.rows}
        aria-label={label}
        placeholder={label}
      />
    );
  }
  return (
    <input
      className={styles.mmInput}
      type={field.kind}
      aria-label={label}
      placeholder={label}
    />
  );
}

export function MentorMatchSuccess({
  mode,
  onClose,
}: {
  mode: Mode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.mmSuccess}>
      <div className={styles.mmSuccessIcon}>
        {mode === "mentee" ? <LuSprout /> : <LuTreeDeciduous />}
      </div>
      <div className={styles.mmTitle} style={{ fontSize: 24 }}>
        {mode === "mentee"
          ? t("economy:mentorship.match.success.mentee.title")
          : t("economy:mentorship.match.success.mentor.title")}
      </div>
      <p className={styles.mmDesc}>
        {mode === "mentee"
          ? t("economy:mentorship.match.success.mentee.body")
          : t("economy:mentorship.match.success.mentor.body")}
      </p>
      <Button type="button" variant="ghost" onClick={onClose}>
        {t("economy:mentorship.match.success.done")}
      </Button>
    </div>
  );
}

/**
 * One step of a match ladder, driven by the per-mode `MATCH_FLOWS` config so a
 * single renderer serves both the mentee (3-step) and mentor (2-step) ladders.
 * Navigation and the submit lifecycle are owned by the parent's `useWizardForm`.
 */
export function MentorMatchStep({
  mode,
  stepIndex,
  isFirstStep,
  isLastStep,
  isSending,
  onBack,
  onContinue,
  onSubmit,
}: {
  mode: Mode;
  stepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSending: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const step = MATCH_FLOWS[mode].steps[stepIndex];
  if (!step) return null;
  return (
    <>
      <div className={styles.mmEye}>{t(step.eyebrowKey)}</div>
      <div className={styles.mmTitle}>{t(step.titleKey)}</div>
      {step.leadKey && <p className={styles.mmDesc}>{t(step.leadKey)}</p>}
      {step.areas && <CheckGrid options={step.areas} />}
      {step.fields && (
        <div className={styles.mmFields}>
          {step.fields.map((field) => (
            <MatchFieldControl key={field.placeholderKey} field={field} />
          ))}
        </div>
      )}
      {step.trailingKey && (
        <p className={styles.mmDesc}>{t(step.trailingKey)}</p>
      )}
      <div className={styles.mmNav}>
        {isFirstStep ? (
          <span />
        ) : (
          <button
            type="button"
            className={styles.mmBack}
            onClick={onBack}
          >
            <FiArrowLeft aria-hidden />{" "}
            {t("economy:mentorship.nav.back")}
          </button>
        )}
        <Button
          type="button"
          variant="primary"
          className={styles.mmContinue}
          disabled={isSending}
          onClick={isLastStep ? onSubmit : onContinue}
        >
          {isSending ? (
            <Sending label={t("economy:resume.submittingLabel")} />
          ) : isLastStep ? (
            <>
              {t("economy:mentorship.nav.submit")}{" "}
              <FiArrowRight aria-hidden />
            </>
          ) : (
            <>
              {t("economy:mentorship.nav.continue")}{" "}
              <FiArrowRight aria-hidden />
            </>
          )}
        </Button>
      </div>
    </>
  );
}
