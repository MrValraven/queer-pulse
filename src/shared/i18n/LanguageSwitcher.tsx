import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "./useTranslation";
import { LANGUAGES } from "./types";
import styles from "./LanguageSwitcher.module.css";

/**
 * Accessible EN/PT switcher. Renders a labelled radio-style group; the active
 * language carries `aria-pressed`. Context-adaptive (see the CSS module), so it
 * drops into the footer or nav without variant props.
 *
 * Mounted in the footer today; safe to also drop into `Navbar`/`AppNav` or the
 * account/settings surface.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div
      className={[styles.switch, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={t("common:language.label")}
    >
      <FiGlobe className={styles.icon} aria-hidden />
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          aria-label={t(`common:language.${lang}`)}
          className={language === lang ? styles.active : undefined}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
