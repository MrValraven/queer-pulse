import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRONOUNS, VIS_OPTS, type Visibility } from "./createAccount.data";
import styles from "./auth.module.css";

interface AboutProps {
  pronouns: string;
  setPronouns: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  visibility: Visibility;
  setVisibility: (v: Visibility) => void;
}

export function AboutAndVisibility({
  pronouns,
  setPronouns,
  bio,
  setBio,
  visibility,
  setVisibility,
}: AboutProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          {t("auth:createAccount.section.about")}
        </div>
        <FormField
          label={t("auth:createAccount.field.displayName.label")}
          helper={t("auth:createAccount.field.displayName.helper")}
        >
          <input
            type="text"
            placeholder={t("auth:createAccount.field.displayName.placeholder")}
          />
        </FormField>
        <div className={styles.field}>
          <label>{t("auth:createAccount.field.pronouns.label")}</label>
          <input
            type="text"
            placeholder={t("auth:createAccount.field.pronouns.placeholder")}
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
          <div className={styles.pronounChips}>
            {PRONOUNS.map((p) => (
              <button
                key={p}
                type="button"
                className={styles.pChip}
                onClick={() => setPronouns(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <FormField label={t("auth:createAccount.field.location.label")}>
          <input
            type="text"
            placeholder={t("auth:createAccount.field.location.placeholder")}
          />
        </FormField>
        <FormField
          label={t("auth:createAccount.field.bio.label")}
          labelAside={`${bio.length}/280`}
        >
          <textarea
            maxLength={280}
            placeholder={t("auth:createAccount.field.bio.placeholder")}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </FormField>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          {t("auth:createAccount.section.visibility")}
        </div>
        <div className={styles.visOpts}>
          {VIS_OPTS.map((opt) => (
            <label
              key={opt.value}
              className={[
                styles.visOpt,
                visibility === opt.value && styles.visOptSelected,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name="vis"
                aria-label={t(opt.labelKey)}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
              />
              <div className={styles.visOptText}>
                <span>{t(opt.labelKey)}</span>
                <small>{t(opt.subKey)}</small>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
