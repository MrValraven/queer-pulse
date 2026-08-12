import { useMemo } from "react";
import { SubpageIndex } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { POLICY_VERSION } from "../../shared/api/consent.api";
import { LegalDoc } from "./LegalDoc";
import { PRIVACY_TOC, buildPrivacySections } from "./privacy.data";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";

export function PrivacyPage() {
  const { t } = useTranslation();
  const sections = useMemo(() => buildPrivacySections(t), [t]);
  const toc = useMemo(
    () =>
      PRIVACY_TOC.map((item) => ({
        id: item.id,
        label: t(`marketing:${item.titleKey}`),
      })),
    [t],
  );
  const pageTitle = t("marketing:privacy.meta.title");
  const pageDescription = t("marketing:privacy.meta.description");

  return (
    <>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.privacy },
        ])}
      />
      <LegalDoc
        eyebrow={t("marketing:legal.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:privacy.title"
            components={{ em: <em /> }}
          />
        }
        meta={[
          t("marketing:privacy.meta.effective", { date: "1 February 2023" }),
          t("marketing:privacy.meta.lastUpdated", { date: "12 August 2026" }),
          t("marketing:privacy.meta.version", { version: POLICY_VERSION }),
        ]}
        plain={{
          title: t("marketing:legal.plainSummaryTitle"),
          text: t("marketing:privacy.plain.text"),
        }}
        toc={toc}
        sections={sections}
        contact={{
          text: (
            <Translation
              i18nKey="marketing:privacy.contactCta"
              components={{ strong: <strong /> }}
            />
          ),
          email: "privacy@queerpulse.pt",
        }}
        related={
          <SubpageIndex
            title={t("marketing:privacy.related.title")}
            items={[
              {
                label: t("marketing:privacy.related.dataRequestLabel"),
                to: routes.dsar,
                blurb: t("marketing:privacy.related.dataRequestBlurb"),
              },
            ]}
          />
        }
      />
    </>
  );
}
