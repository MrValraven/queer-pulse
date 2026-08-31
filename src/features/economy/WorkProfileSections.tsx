import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { RadioCardGroup, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useProfileData } from "../../app/providers/useProfile";
import { fullName } from "../members/data/members";
import { PronounField } from "../../shared/identity/PronounField";
import { parsePronouns } from "../../shared/identity/pronouns";
import {
  OUT_AT_WORK,
  TRANS_SUPPORT,
  VIS_MATRIX,
  WORK_SKILLS,
  FOCUS_AREAS,
  type WorkTaxonomyOption,
} from "./workProfile.data";
import styles from "./WorkProfilePage.module.css";

/** Section 1 — professional identity: how you're named and described. */
export function IdentitySection() {
  const { t } = useTranslation();
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfileData();
  // Display-only, v1: identity inputs here are uncontrolled/non-persisting;
  // this local state mirrors that until real save is wired up.
  const [pronouns, setPronouns] = useState(() =>
    parsePronouns(profile.pronouns ?? ""),
  );
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="economy:workProfile.identity.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>
        {t("economy:workProfile.identity.sub")}
      </p>

      {/* Personal core — name, pronouns, location kept together and leading,
          mirroring the main profile editor's identity block. */}
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("economy:workProfile.identity.nameInUse")}
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          aria-label={t("economy:workProfile.identity.nameInUse")}
          defaultValue={fullName(profile)}
        />
      </div>

      <div className={styles.field}>
        <PronounField
          value={pronouns}
          onChange={setPronouns}
          labels={{
            field: t("economy:workProfile.identity.pronouns"),
            writeOwn: t("economy:workProfile.identity.pronounsWriteOwn"),
            placeholder: t("economy:workProfile.identity.pronounsPlaceholder"),
            add: t("economy:workProfile.identity.pronounsAdd"),
            removeAria: (pronoun) =>
              t("economy:workProfile.identity.pronounsRemoveAria", { pronoun }),
          }}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("economy:workProfile.identity.location")}
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          aria-label={t("economy:workProfile.identity.location")}
          defaultValue={profile.hood}
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            {t("economy:workProfile.identity.legalName")}{" "}
            <span className={styles.fieldOptional}>
              {t("economy:workProfile.identity.legalNameOptional")}
            </span>
          </div>
          <input
            className={styles.fieldInput}
            type="text"
            aria-label={t("economy:workProfile.identity.legalName")}
            placeholder={t("economy:workProfile.identity.legalNamePlaceholder")}
          />
          <div className={styles.fieldHint}>
            {t("economy:workProfile.identity.legalNameHint")}
          </div>
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            {t("economy:workProfile.identity.headline")}
          </div>
          <input
            className={styles.fieldInput}
            type="text"
            aria-label={t("economy:workProfile.identity.headline")}
            defaultValue={profile.role}
          />
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("economy:workProfile.identity.bio")}
        </div>
        <textarea
          className={styles.fieldTextarea}
          aria-label={t("economy:workProfile.identity.bio")}
          placeholder={t("economy:workProfile.identity.bioPlaceholder")}
        />
      </div>
    </section>
  );
}

interface ShowUpProps {
  outChoice: string;
  onOut: (v: string) => void;
  trans: string[];
  onToggleTrans: (id: string) => void;
  safeOnly: boolean;
  onSafeOnly: (v: boolean) => void;
}

/** Section 2 — the queer-specific safety core: out-at-work spectrum + visibility. */
export function ShowUpAtWorkSection({
  outChoice,
  onOut,
  trans,
  onToggleTrans,
  safeOnly,
  onSafeOnly,
}: ShowUpProps) {
  const { t } = useTranslation();
  const activeOut = OUT_AT_WORK.find((o) => o.value === outChoice);
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="economy:workProfile.showUp.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>{t("economy:workProfile.showUp.sub")}</p>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("economy:workProfile.showUp.outAtWork")}
        </div>
        <RadioCardGroup
          className={styles.seg}
          optionClassName={styles.segBtn}
          checkedClassName={styles.segOn}
          ariaLabel={t("economy:workProfile.showUp.outAtWorkAriaLabel")}
          value={outChoice}
          onChange={onOut}
          options={OUT_AT_WORK.map((o) => ({
            id: o.value,
            render: t(o.labelKey),
          }))}
        />
        {activeOut && <p className={styles.segDesc}>{t(activeOut.descKey)}</p>}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("economy:workProfile.showUp.transSupport")}{" "}
          <span className={styles.fieldOptional}>
            {t("economy:workProfile.showUp.transSupportOptional")}
          </span>
        </div>
        <div className={styles.toggleList}>
          {TRANS_SUPPORT.map((option) => {
            const on = trans.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={t(option.labelKey)}
                className={[styles.toggleRow, on && styles.toggleRowOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggleTrans(option.id)}
              >
                <span
                  className={[styles.toggle, on && styles.toggleOn]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  <span className={styles.toggleKnob} />
                </span>
                <span className={styles.toggleText}>
                  <span className={styles.toggleLabel}>
                    {t(option.labelKey)}
                  </span>
                  <span className={styles.toggleDesc}>{t(option.descKey)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("economy:workProfile.showUp.matrixLabel")}
        </div>
        <div className={styles.matrix}>
          <div className={[styles.matrixRow, styles.matrixHead].join(" ")}>
            <span className={styles.matrixField}>
              {t("economy:workProfile.showUp.matrixField")}
            </span>
            <span className={styles.matrixCell}>
              {t("economy:workProfile.showUp.matrixEmployers")}
            </span>
            <span className={styles.matrixCell}>
              {t("economy:workProfile.showUp.matrixCommunity")}
            </span>
          </div>
          {VIS_MATRIX.map((r) => (
            <div key={r.fieldKey} className={styles.matrixRow}>
              <span className={styles.matrixField}>{t(r.fieldKey)}</span>
              <span className={styles.matrixCell}>{t(r.employersKey)}</span>
              <span className={styles.matrixCell}>{t(r.communityKey)}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={safeOnly}
        aria-label={t("economy:workProfile.showUp.safeOnly.label")}
        className={[styles.toggleRow, safeOnly && styles.toggleRowOn]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onSafeOnly(!safeOnly)}
      >
        <span
          className={[styles.toggle, safeOnly && styles.toggleOn]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          <span className={styles.toggleKnob} />
        </span>
        <span className={styles.toggleText}>
          <span className={styles.toggleLabel}>
            {t("economy:workProfile.showUp.safeOnly.label")}
          </span>
          <span className={styles.toggleDesc}>
            {t("economy:workProfile.showUp.safeOnly.desc")}
          </span>
        </span>
      </button>
    </section>
  );
}

/** A multi-select row of taxonomy chips — a selectable chip per option. */
function SelectableChipRow({
  options,
  selected,
  onToggle,
  groupLabel,
}: {
  options: WorkTaxonomyOption[];
  selected: string[];
  onToggle: (id: string) => void;
  groupLabel: string;
}) {
  const { t } = useTranslation();
  return (
    <TagRow role="group" aria-label={groupLabel}>
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            className={[styles.chipToggle, on && styles.chipToggleOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onToggle(option.id)}
          >
            {on && <FiCheck className={styles.chipToggleCheck} aria-hidden />}
            {t(option.labelKey)}
          </button>
        );
      })}
    </TagRow>
  );
}

/** Section 3 — skills offered and focus areas sought, both multi-select. */
export function SkillsFocusSection({
  skills,
  onToggleSkill,
  focusAreas,
  onToggleFocusArea,
}: {
  skills: string[];
  onToggleSkill: (id: string) => void;
  focusAreas: string[];
  onToggleFocusArea: (id: string) => void;
}) {
  const { t } = useTranslation();
  const skillsLabel = t("economy:workProfile.skillsFocus.skills");
  const focusLabel = t("economy:workProfile.skillsFocus.focusAreas");
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="economy:workProfile.skillsFocus.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>
        {t("economy:workProfile.skillsFocus.sub")}
      </p>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>{skillsLabel}</div>
        <SelectableChipRow
          options={WORK_SKILLS}
          selected={skills}
          onToggle={onToggleSkill}
          groupLabel={skillsLabel}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>{focusLabel}</div>
        <SelectableChipRow
          options={FOCUS_AREAS}
          selected={focusAreas}
          onToggle={onToggleFocusArea}
          groupLabel={focusLabel}
        />
      </div>
    </section>
  );
}
