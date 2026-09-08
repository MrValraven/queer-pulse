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
  // The page discloses; it doesn't decide. Everything in the necessary and
  // functional categories is always-on, and the one opt-in (error monitoring,
  // spec 01) is switched in the in-app preference center this button opens —
  // so there is nothing here to save. Rows come from the shared
  // `STORAGE_INVENTORY`, which the preference center renders too.
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
