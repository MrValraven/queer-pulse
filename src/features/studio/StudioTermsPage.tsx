import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShell } from "./StudioShell";
import {
  StudioTermsDeedButton,
  StudioTermsShowcase,
} from "./StudioTermsShowcase";
import { TERMS_LIVE_SECTIONS } from "./studioTerms.data";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./studioTerms.module.css";

/** The short Studio addendum in both modes; the co-op deal, deed and
 *  licences in the demo only (spec section 3.4). */
export function StudioTermsPage() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={s.eb}>{t("studio:termsLive.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:termsLive.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={s.lede}>{t("studio:termsLive.lede")}</p>
        </div>

        {TERMS_LIVE_SECTIONS.map((section) => (
          <section key={section.id} className={`${s.sec} ${s.liveSec}`}>
            <div className={s.num}>{t(section.numKey)}</div>
            <h2>
              <Translation
                i18nKey={section.headingKey}
                components={{ em: <em /> }}
              />
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.key}>
                <Translation
                  i18nKey={paragraph.key}
                  components={paragraph.components}
                />
              </p>
            ))}
          </section>
        ))}

        <p className={s.muted}>
          <Translation
            i18nKey="studio:termsLive.questions"
            components={{
              // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- element template; <Translation> clones it with the translated link text at render.
              a: <a href="mailto:hello@queerpulse.com" />,
              link: <Link to={routes.contact} />,
            }}
          />
        </p>

        {isShowcase && <StudioTermsShowcase />}

        <div className={s.meta}>
          <div className={s.mt}>
            <h2>{t("studio:termsLive.full.title")}</h2>
            <p>{t("studio:termsLive.full.body")}</p>
          </div>
          <Button variant="ghost" to={routes.terms}>
            {t("studio:termsLive.full.termsCta")}
          </Button>
          <Button variant="ghost" to={routes.privacy}>
            {t("studio:termsLive.full.privacyCta")}
          </Button>
          {isShowcase && <StudioTermsDeedButton />}
        </div>
      </div>
    </StudioShell>
  );
}
