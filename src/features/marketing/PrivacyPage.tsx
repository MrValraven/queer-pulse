import { useMemo } from "react";
import { SubpageIndex } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { POLICY_VERSION } from "../../shared/api/consent.api";
import { LegalDoc } from "./LegalDoc";
import { PRIVACY_TOC, buildPrivacySections } from "./privacy.data";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";

/** When the privacy policy first took effect and when it last changed. Built
 *  from local date parts so the meta line never shows a day early west of
 *  Greenwich, then formatted in the reader's language. */
const EFFECTIVE_ON = new Date(2023, 1, 1);
const LAST_UPDATED_ON = new Date(2026, 7, 12);

export function PrivacyPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
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
          t("marketing:privacy.meta.effective", {
            date: fmt.date(EFFECTIVE_ON),
          }),
          t("marketing:privacy.meta.lastUpdated", {
            date: fmt.date(LAST_UPDATED_ON),
          }),
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
          email: "hello@queerpulse.com",
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
