import { useState } from "react";
import { LuSprout, LuTreeDeciduous } from "react-icons/lu";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  MENTEE_AREAS,
  MENTOR_AREAS,
  type MatchArea,
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

export function MenteeSteps({
  step,
  setStep,
}: {
  step: number;
  setStep: (s: number) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <>
      {step === 1 && (
        <>
          <div className={styles.mmEye}>
            {t("economy:mentorship.mentee.step1.eyebrow")}
          </div>
          <div className={styles.mmTitle}>
            {t("economy:mentorship.mentee.step1.title")}
          </div>
          <p className={styles.mmDesc}>
            {t("economy:mentorship.mentee.step1.sub")}
          </p>
          <CheckGrid options={MENTEE_AREAS} />
          <div className={styles.mmNav}>
            <span />
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => setStep(2)}
            >
              {t("economy:mentorship.nav.continue")}
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className={styles.mmEye}>
            {t("economy:mentorship.mentee.step2.eyebrow")}
          </div>
          <div className={styles.mmTitle}>
            {t("economy:mentorship.mentee.step2.title")}
          </div>
          <div className={styles.mmFields}>
            <input
              className={styles.mmInput}
              type="text"
              placeholder={t("economy:mentorship.mentee.step2.namePlaceholder")}
            />
            <input
              className={styles.mmInput}
              type="text"
              placeholder={t("economy:mentorship.mentee.step2.rolePlaceholder")}
            />
            <select className={styles.mmSelect} defaultValue="">
              <option value="">
                {t("economy:mentorship.mentee.step2.frequencyPlaceholder")}
              </option>
              <option>
                {t("economy:mentorship.mentee.step2.frequency.monthly")}
              </option>
              <option>
                {t("economy:mentorship.mentee.step2.frequency.twiceMonthly")}
              </option>
              <option>
                {t("economy:mentorship.mentee.step2.frequency.asNeeded")}
              </option>
            </select>
            <textarea
              className={styles.mmTextarea}
              rows={3}
              placeholder={t("economy:mentorship.mentee.step2.notePlaceholder")}
            />
          </div>
          <div className={styles.mmNav}>
            <button
              type="button"
              className={styles.mmBack}
              onClick={() => setStep(1)}
            >
              {t("economy:mentorship.nav.back")}
            </button>
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => setStep(3)}
            >
              {t("economy:mentorship.nav.continue")}
            </Button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <div className={styles.mmEye}>
            {t("economy:mentorship.mentee.step3.eyebrow")}
          </div>
          <div className={styles.mmTitle}>
            {t("economy:mentorship.mentee.step3.title")}
          </div>
          <div className={styles.mmFields}>
            <input
              className={styles.mmInput}
              type="email"
              placeholder={t(
                "economy:mentorship.mentee.step3.emailPlaceholder",
              )}
            />
          </div>
          <p className={styles.mmDesc}>
            {t("economy:mentorship.mentee.step3.sub")}
          </p>
          <div className={styles.mmNav}>
            <button
              type="button"
              className={styles.mmBack}
              onClick={() => setStep(2)}
            >
              {t("economy:mentorship.nav.back")}
            </button>
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => {
                setStep(4);
                showToast(
                  t("economy:mentorship.mentee.toastSubmitted"),
                  "success",
                );
              }}
            >
              {t("economy:mentorship.nav.submit")}
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export function MentorSteps({
  step,
  setStep,
}: {
  step: number;
  setStep: (s: number) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <>
      {step === 1 && (
        <>
          <div className={styles.mmEye}>
            {t("economy:mentorship.mentor.step1.eyebrow")}
          </div>
          <div className={styles.mmTitle}>
            {t("economy:mentorship.mentor.step1.title")}
          </div>
          <p className={styles.mmDesc}>
            {t("economy:mentorship.mentor.step1.sub")}
          </p>
          <CheckGrid options={MENTOR_AREAS} />
          <div className={styles.mmNav}>
            <span />
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => setStep(2)}
            >
              {t("economy:mentorship.nav.continue")}
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className={styles.mmEye}>
            {t("economy:mentorship.mentor.step2.eyebrow")}
          </div>
          <div className={styles.mmTitle}>
            {t("economy:mentorship.mentor.step2.title")}
          </div>
          <div className={styles.mmFields}>
            <input
              className={styles.mmInput}
              type="text"
              placeholder={t("economy:mentorship.mentor.step2.namePlaceholder")}
            />
            <select className={styles.mmSelect} defaultValue="">
              <option value="">
                {t("economy:mentorship.mentor.step2.menteesPlaceholder")}
              </option>
              <option>
                {t("economy:mentorship.mentor.step2.mentees.one")}
              </option>
              <option>
                {t("economy:mentorship.mentor.step2.mentees.two")}
              </option>
              <option>
                {t("economy:mentorship.mentor.step2.mentees.three")}
              </option>
            </select>
            <select className={styles.mmSelect} defaultValue="">
              <option value="">
                {t("economy:mentorship.mentor.step2.formatPlaceholder")}
              </option>
              <option>
                {t("economy:mentorship.mentor.step2.format.inPersonLisbon")}
              </option>
              <option>
                {t("economy:mentorship.mentor.step2.format.video")}
              </option>
              <option>
                {t("economy:mentorship.mentor.step2.format.either")}
              </option>
            </select>
            <input
              className={styles.mmInput}
              type="email"
              placeholder={t(
                "economy:mentorship.mentor.step2.emailPlaceholder",
              )}
            />
          </div>
          <div className={styles.mmNav}>
            <button
              type="button"
              className={styles.mmBack}
              onClick={() => setStep(1)}
            >
              {t("economy:mentorship.nav.back")}
            </button>
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => {
                setStep(3);
                showToast(
                  t("economy:mentorship.mentor.toastSubmitted"),
                  "success",
                );
              }}
            >
              {t("economy:mentorship.nav.submit")}
            </Button>
          </div>
        </>
      )}
    </>
  );
}
