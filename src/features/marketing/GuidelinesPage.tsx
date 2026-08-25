import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { GuidelinesContent } from "./GuidelinesContent";
import s from "./GuidelinesPage.module.css";

export function GuidelinesPage() {
  const { t } = useTranslation();
  const pageTitle = t("marketing:guidelines.meta.title");
  const pageDescription = t("marketing:guidelines.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.guidelines },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:guidelines.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:guidelines.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:guidelines.hero.sub")}
      />

      <div className="wrap">
        <div className={s.content}>
          <GuidelinesContent />
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="marketing:guidelines.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:guidelines.outro.sub")}
      >
        <Button size="lg" to={routes.homepage}>
          {t("marketing:guidelines.outro.backCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
