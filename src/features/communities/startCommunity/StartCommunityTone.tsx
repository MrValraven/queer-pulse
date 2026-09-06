import { useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ENFORCEMENT_LADDER,
  MAX_WELCOME_MESSAGE_LENGTH,
  RULE_PRESET_KEYS,
} from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

/** Chapter 5 — Tone: the covenant, plus how the group holds it. */
export function StepTone({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set, toggleRule, addRule } = form;
  const [custom, setCustom] = useState("");

  // Preset keys first (in their canonical order — a stable, language-
  // independent id), then any custom rules the member typed in their own
  // words, which are content and rendered verbatim rather than through t().
  const isPreset = (rule: string) => RULE_PRESET_KEYS.includes(rule);
  const customRules = draft.rules.filter((r) => !isPreset(r));
  const shown = [...RULE_PRESET_KEYS, ...customRules];

  const add = () => {
    const r = custom.trim();
    if (!r) return;
    addRule(r);
    setCustom("");
  };

  return (
    <div>
      <p className={styles.covenantIntro}>
        {t("communities:start.tone.covenantIntro")}
      </p>

      <div className={styles.rulesList}>
        {shown.map((rule) => {
          const isOn = draft.rules.includes(rule);
          return (
            <button
              key={rule}
              type="button"
              className={[styles.rule, isOn && styles.ruleOn]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isOn}
              onClick={() => toggleRule(rule)}
            >
              <span className={styles.ruleBox}>
                <FiCheck size={12} aria-hidden />
              </span>
              <span className={styles.ruleTxt}>
                {isPreset(rule) ? t(rule) : rule}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.addRow}>
        <input
          type="text"
          className={styles.input}
          aria-label={t("communities:start.tone.addPlaceholder")}
          placeholder={t("communities:start.tone.addPlaceholder")}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button variant="ghost" onClick={add} disabled={!custom.trim()}>
          <FiPlus size={15} aria-hidden /> {t("communities:start.tone.addCta")}
        </Button>
      </div>

      <div className={styles.groupH}>
        {t("communities:start.tone.welcomeHeading")}
      </div>
      <p className={styles.groupSub}>
        {t("communities:start.tone.welcomeSub")}
      </p>
      <div className={styles.field}>
        <label htmlFor="sc-welcome">
          {t("communities:start.tone.welcomeLabel")}
        </label>
        <textarea
          id="sc-welcome"
          className={styles.textarea}
          placeholder={t("communities:start.tone.welcomePlaceholder")}
          value={draft.welcomeMessage}
          maxLength={MAX_WELCOME_MESSAGE_LENGTH}
          onChange={(event) => set({ welcomeMessage: event.target.value })}
        />
        <span className={styles.hint}>
          {t("communities:start.tone.welcomeHint")}
        </span>
      </div>

      <div className={styles.groupH}>
        {t("communities:start.tone.wrongHeading")}
      </div>
      <p className={styles.groupSub}>{t("communities:start.tone.wrongSub")}</p>
      <div className={styles.ladder}>
        {ENFORCEMENT_LADDER.map((step, i) => (
          <div key={step.titleKey} className={styles.ladderStep}>
            <span className={styles.lsN}>{i + 1}</span>
            <span className={styles.lsT}>
              <b>{t(step.titleKey)}</b>
              <span>{t(step.descriptionKey)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
