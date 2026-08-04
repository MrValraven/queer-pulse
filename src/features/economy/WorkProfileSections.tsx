import { Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useProfileData } from "../../app/providers/useProfile";
import { fullName } from "../members/data/members";
import {
  OUT_AT_WORK,
  TRANS_SUPPORT,
  VIS_MATRIX,
  WORK_SKILLS_KEYS,
  FOCUS_AREAS_KEYS,
} from "./workProfile.data";
import styles from "./WorkProfilePage.module.css";

/** Section 1 — professional identity: how you're named and described. */
export function IdentitySection() {
  const { t } = useTranslation();
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfileData();
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

      <div className={styles.fieldRow}>
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
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            {t("economy:workProfile.identity.pronouns")}
          </div>
          <input
            className={styles.fieldInput}
            type="text"
            aria-label={t("economy:workProfile.identity.pronouns")}
            defaultValue={profile.pronouns ?? ""}
          />
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
          {t("economy:workProfile.identity.location")}
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          aria-label={t("economy:workProfile.identity.location")}
          defaultValue={profile.hood}
        />
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
        <div
          className={styles.seg}
          role="radiogroup"
          aria-label={t("economy:workProfile.showUp.outAtWorkAriaLabel")}
        >
          {OUT_AT_WORK.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={outChoice === o.value}
              className={[styles.segBtn, outChoice === o.value && styles.segOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onOut(o.value)}
            >
              {t(o.labelKey)}
            </button>
          ))}
        </div>
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

/** Section 3 — skills offered/sought and focus areas. */
export function SkillsFocusSection() {
  const { t } = useTranslation();
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
        <div className={styles.fieldLabel}>
          {t("economy:workProfile.skillsFocus.skills")}
        </div>
        <TagRow>
          {WORK_SKILLS_KEYS.map((key) => (
            <Tag key={key}>{t(key)}</Tag>
          ))}
        </TagRow>
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("economy:workProfile.skillsFocus.focusAreas")}
        </div>
        <TagRow>
          {FOCUS_AREAS_KEYS.map((key) => (
            <Tag key={key}>{t(key)}</Tag>
          ))}
        </TagRow>
      </div>
    </section>
  );
}
