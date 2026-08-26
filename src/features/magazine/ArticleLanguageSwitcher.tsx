import { Link } from "react-router-dom";
import { FiGlobe } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ArticleTranslationDTO, ContentLocale } from "./api/magazine.api";
import styles from "./ArticleLanguageSwitcher.module.css";

export interface ArticleLanguageSwitcherProps {
  /** Every language this piece is readable in, the current one included. */
  translations: ArticleTranslationDTO[] | undefined;
  /** The language the piece on screen is written in. */
  currentLocale: ContentLocale | undefined;
  /** The translator's name, when this piece IS a translation. */
  translatorName?: string | null;
}

/** The language's own name in that language, so a Portuguese reader finds
 *  "Português" rather than "Portuguese". Never an emoji flag: a flag is a
 *  country, and a language is not one. */
const LANGUAGE_LABEL: Record<ContentLocale, string> = {
  en: "English",
  pt: "Português",
};

/**
 * CON-16 — the article page's language switcher.
 *
 * A translation is a first-class article at its own slug, so switching
 * language NAVIGATES rather than swapping text in place: the reader can share
 * the Portuguese link and have it open in Portuguese. `?lang=` travels along
 * so the intent survives, and the backend resolves it if a slug ever drifts.
 *
 * What a reader sees when the piece they are on has no translation in their
 * language is the case this component exists to get right. Saying nothing at
 * all leaves a Portuguese reader wondering whether they missed a control.
 * Rendering an empty switcher is worse. So: when the piece exists in one
 * language and that is not the reader's, it says so in one plain line. When
 * the reader's chrome language already matches the piece, there is nothing to
 * report and nothing renders.
 *
 * A translation that is drafted but unshipped is shown as in progress rather
 * than linked, so nobody is sent to a piece that is not there yet.
 */
export function ArticleLanguageSwitcher({
  translations,
  currentLocale,
  translatorName,
}: ArticleLanguageSwitcherProps) {
  const { t, language } = useTranslation();
  const options = translations ?? [];

  if (options.length <= 1) {
    // Nothing to switch to. Worth a word only when the reader is reading in a
    // language the piece is not in.
    if (!currentLocale || currentLocale === language) return null;
    return (
      <p className={styles.onlyIn}>
        <FiGlobe aria-hidden />
        {t("magazine:article.language.onlyIn", {
          language: LANGUAGE_LABEL[currentLocale],
        })}
      </p>
    );
  }

  return (
    <div className={styles.switcher}>
      <span className={styles.label}>
        <FiGlobe aria-hidden />
        {t("magazine:article.language.label")}
      </span>
      <ul className={styles.options}>
        {options.map((option) => {
          const isCurrent = option.locale === currentLocale;
          if (isCurrent) {
            return (
              <li key={option.locale}>
                <span className={styles.current} aria-current="true">
                  {LANGUAGE_LABEL[option.locale]}
                </span>
              </li>
            );
          }
          if (!option.isPublished) {
            return (
              <li key={option.locale}>
                <span className={styles.pending}>
                  {t("magazine:article.language.inProgress", {
                    language: LANGUAGE_LABEL[option.locale],
                  })}
                </span>
              </li>
            );
          }
          return (
            <li key={option.locale}>
              <Link
                className={styles.option}
                to={`${routes.article}?id=${encodeURIComponent(option.slug)}&lang=${option.locale}`}
              >
                {LANGUAGE_LABEL[option.locale]}
              </Link>
            </li>
          );
        })}
      </ul>
      {translatorName && (
        <span className={styles.translator}>
          {t("magazine:article.language.translatedBy", {
            name: translatorName,
          })}
        </span>
      )}
    </div>
  );
}
