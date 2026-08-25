import { FiHeart } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./DirectoryAffirmingBaseline.module.css";

/**
 * The affirming baseline, stated as what it is.
 *
 * Every business in this directory has agreed to welcome and serve LGBTQ+
 * people, because agreeing is the condition of being listed at all. That makes
 * it a fact about the directory, so this component takes no listing and reads
 * no per-listing field: it says the same thing on every detail page.
 *
 * Deliberately not a badge and deliberately not a filter. Rendering it as
 * either would turn a universal baseline back into an option some places have
 * and others do not, which is exactly the pattern the baseline replaced (the
 * same reasoning as the housing side's mandatory pledge).
 *
 * The commitment is about how a business treats the people it serves. It gives
 * nobody permission to exclude anyone over who they are, and the copy says so
 * out loud rather than leaving it to be inferred.
 */
export function DirectoryAffirmingBaseline() {
  const { t } = useTranslation();

  return (
    <section className={s.panel} aria-labelledby="directory-baseline-lead">
      <span className={s.icon} aria-hidden>
        <FiHeart />
      </span>
      <div className={s.body}>
        <h2 id="directory-baseline-lead" className={s.lead}>
          <Translation
            i18nKey="marketing:directory.detail.baseline.lead"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.detail}>
          {t("marketing:directory.detail.baseline.condition")}
        </p>
        <p className={s.detail}>
          {t("marketing:directory.detail.baseline.scope")}
        </p>
      </div>
    </section>
  );
}
