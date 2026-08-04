import { useEffect, useState } from "react";
import { PageHero } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useConsent } from "../../app/providers/useConsent";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { LegalDoc } from "./LegalDoc";
import { CookieCategoryCards } from "./CookieCategoryCards";
import { CookieConsentSummary } from "./CookieConsentSummary";

export function CookiesPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  // Persist through the real consent gate (spec 07) instead of throwing the
  // choice away. Analytics is the one opt-in category this page surfaces;
  // `monitoring` (error tracking) is left to the in-app preference center and
  // is preserved untouched on a granular save.
  const {
    consent,
    setConsent,
    acceptAll: acceptAllConsent,
    rejectAll,
  } = useConsent();
  const [analytics, setAnalytics] = useState(consent.analytics);
  const pageTitle = t("marketing:cookies.meta.title");
  const pageDescription = t("marketing:cookies.meta.description");

  // Reflect the stored choice — including the backend reconciliation the
  // provider runs on mount in live mode — so the toggle never drifts from what
  // is actually persisted.
  useEffect(() => {
    setAnalytics(consent.analytics);
  }, [consent.analytics]);

  const toggleFor: Record<
    string,
    { value: boolean; set: (value: boolean) => void }
  > = {
    analytics: { value: analytics, set: setAnalytics },
  };

  function save() {
    setConsent(
      { analytics, monitoring: consent.monitoring },
      "preference_center",
    );
    showToast(t("marketing:cookies.toast.saved"), "success");
  }
  function acceptAll() {
    setAnalytics(true);
    acceptAllConsent("preference_center");
    showToast(t("marketing:cookies.toast.saved"), "success");
  }
  function essentialOnly() {
    setAnalytics(false);
    rejectAll("preference_center");
    showToast(t("marketing:cookies.toast.saved"), "success");
  }

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
        body={<CookieCategoryCards toggleFor={toggleFor} />}
        aside={
          <CookieConsentSummary
            analytics={analytics}
            onSave={save}
            onAcceptAll={acceptAll}
            onEssentialOnly={essentialOnly}
          />
        }
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
