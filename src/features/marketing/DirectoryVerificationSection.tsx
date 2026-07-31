import { Button, Eyebrow, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import s from "./DirectoryVerificationSection.module.css";

/**
 * The "how verification works" explainer, rendered inline on the directory
 * page rather than advertised as a top-level nav link. It gives browsers the
 * gist in context — nominated → reviewed → re-checked — and sends anyone who
 * wants the full story (criteria, the delisting record, how to nominate) to
 * the `/local/safe-spaces` trust hub, which stays the canonical destination.
 */
const PILLARS = ["nominate", "review", "recheck"] as const;

export function DirectoryVerificationSection() {
  const { t } = useTranslation();

  return (
    <section className={s.section} aria-labelledby="directory-verify-title">
      <div className="wrap">
        <Reveal className={s.panel}>
          <div className={s.intro}>
            <Eyebrow>{t("marketing:directory.verify.eyebrow")}</Eyebrow>
            <h2 id="directory-verify-title" className={s.title}>
              <Translation
                i18nKey="marketing:directory.verify.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={s.lead}>{t("marketing:directory.verify.lead")}</p>
            <Button variant="ghost" to={routes.safeSpaces}>
              {t("marketing:directory.verify.cta")}
            </Button>
          </div>

          <ol className={s.pillars}>
            {PILLARS.map((key, index) => (
              <li key={key} className={s.pillar}>
                <span className={s.num} aria-hidden>
                  {index + 1}
                </span>
                <div>
                  <h3 className={s.pillarTitle}>
                    {t(`marketing:directory.verify.pillar.${key}.title`)}
                  </h3>
                  <p className={s.pillarBody}>
                    {t(`marketing:directory.verify.pillar.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
