import { PageHero } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { useConsent } from "../../app/providers/useConsent";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { LegalDoc } from "./LegalDoc";
import { CookieCategoryCards } from "./CookieCategoryCards";
import { CookieConsentSummary } from "./CookieConsentSummary";

export function CookiesPage() {
  const { t } = useTranslation();
  // Every cookie we set is strictly necessary or functional — all always-on —
  // so this page has no cookie toggles to save. The one remaining opt-in (error
  // monitoring, spec 01) isn't cookie-based; it lives in the in-app preference
  // center, which this page links out to.
  const { openPreferences } = useConsent();
  const pageTitle = t("marketing:cookies.meta.title");
  const pageDescription = t("marketing:cookies.meta.description");

  return (
    <>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.cookies },
        ])}
      />
      <LegalDoc
        hero={
          <PageHero
            plum={false}
            eyebrow={t("marketing:cookies.eyebrow")}
            title={
              <Translation
                i18nKey="marketing:cookies.h1"
                components={{ em: <em /> }}
              />
            }
            sub={t("marketing:cookies.sub")}
          />
        }
        body={<CookieCategoryCards />}
        aside={<CookieConsentSummary onManagePreferences={openPreferences} />}
        related={
          <Outro
            title={
              <Translation
                i18nKey="marketing:cookies.outro.title"
                components={{ em: <em /> }}
              />
            }
            sub={t("marketing:cookies.outro.sub")}
          >
            <Button variant="ghost-dark" size="lg" to={routes.privacy}>
              {t("marketing:cookies.outro.cta")}
            </Button>
          </Outro>
        }
      />
    </>
  );
}
