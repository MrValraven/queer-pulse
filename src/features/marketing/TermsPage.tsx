import { useMemo } from "react";
import { LegalDoc } from "./LegalDoc";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { TERMS_TOC, buildTermsSections } from "./TermsPage.data";

export function TermsPage() {
  const { t } = useTranslation();
  const sections = useMemo(() => buildTermsSections(t), [t]);
  const toc = useMemo(
    () =>
      TERMS_TOC.map((item) => ({
        id: item.id,
        label: t(`marketing:${item.titleKey}`),
      })),
    [t],
  );
  const pageTitle = t("marketing:terms.meta.title");
  const pageDescription = t("marketing:terms.meta.description");

  return (
    <>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.terms },
        ])}
      />
      <LegalDoc
        eyebrow={t("marketing:legal.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:terms.title"
            components={{ em: <em /> }}
          />
        }
        meta={[
          t("marketing:terms.meta.effective", { date: "1 February 2023" }),
          t("marketing:terms.meta.lastUpdated", { date: "1 June 2026" }),
          t("marketing:terms.meta.version", { version: "2.4" }),
        ]}
        plain={{
          title: t("marketing:legal.plainSummaryTitle"),
          text: t("marketing:terms.plain.text"),
        }}
        toc={toc}
        sections={sections}
        contact={{
          text: (
            <Translation
              i18nKey="marketing:terms.contactCta"
              components={{ strong: <strong /> }}
            />
          ),
          email: "hello@queerpulse.com",
        }}
      />
    </>
  );
}
