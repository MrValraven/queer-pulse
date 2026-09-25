import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminSeg } from "../ui";
import styles from "./AdminEmailTemplates.module.css";

/** EN/PT switch. A language with unsaved edits says so in words. */
export function EmailTemplateLocaleTabs({
  active,
  onChange,
  isLocaleDirty,
  isLabelHidden = false,
}: {
  active: Language;
  onChange: (locale: Language) => void;
  isLocaleDirty: (locale: Language) => boolean;
  /** Keeps the "Language" label for screen readers only, for the compact
   *  editor toolbar where the language names speak for themselves. */
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const labelFor = (locale: Language) => {
    const name = t(`admin:emailTemplates.editor.localeTab.${locale}`);
    return isLocaleDirty(locale)
      ? t("admin:emailTemplates.editor.localeUnsaved", { language: name })
      : name;
  };
  return (
    <div className={styles.localeTabs}>
      <span
        id="email-template-language"
        className={isLabelHidden ? "visuallyHidden" : styles.metaGroupLabel}
      >
        {t("admin:emailTemplates.editor.languageLabel")}
      </span>
      <AdminSeg
        ariaLabelledby="email-template-language"
        value={active}
        onChange={(value) => onChange(value === "pt" ? "pt" : "en")}
        options={[
          { value: "en", label: labelFor("en") },
          { value: "pt", label: labelFor("pt") },
        ]}
      />
    </div>
  );
}
