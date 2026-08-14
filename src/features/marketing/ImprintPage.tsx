import { useMemo } from "react";
import { LegalDoc, type LegalSection } from "./LegalDoc";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { IMPRINT_TOC, IMPRINT_ENTITY } from "./ImprintPage.data";

/**
 * The legally required imprint / Impressum: who runs QueerPulse, how to reach a
 * real person, and the jurisdiction we answer to. Mirrors the `TermsPage` i18n
 * pattern — each `<p>` body is a `t()` call. QueerPulse is run by volunteers
 * with no registered legal entity yet, so there are no registration details to
 * interpolate; the only entity value is the contact email in {@link IMPRINT_ENTITY}.
 */
function buildImprintSections(t: TFunction): LegalSection[] {
  return [
    {
      id: "operator",
      title: t("marketing:imprint.operator.title"),
      body: <p>{t("marketing:imprint.operator.p1")}</p>,
    },
    {
      id: "contact",
      title: t("marketing:imprint.contact.title"),
      body: (
        <>
          <p>
            <Translation
              i18nKey="marketing:imprint.contact.p1"
              values={{ email: IMPRINT_ENTITY.email }}
              // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- element template for <Translation>, cloned with translated children (its accessible name) at render.
              components={{ a: <a href={`mailto:${IMPRINT_ENTITY.email}`} /> }}
            />
          </p>
          <p>{t("marketing:imprint.contact.p2")}</p>
        </>
      ),
    },
    {
      id: "representation",
      title: t("marketing:imprint.representation.title"),
      body: <p>{t("marketing:imprint.representation.p1")}</p>,
    },
    {
      id: "hosting",
      title: t("marketing:imprint.hosting.title"),
      body: <p>{t("marketing:imprint.hosting.p1")}</p>,
    },
    {
      id: "jurisdiction",
      title: t("marketing:imprint.jurisdiction.title"),
      body: (
        <>
          <p>{t("marketing:imprint.jurisdiction.p1")}</p>
          <p>{t("marketing:imprint.jurisdiction.p2")}</p>
        </>
      ),
    },
    {
      id: "disputes",
      title: t("marketing:imprint.disputes.title"),
      body: <p>{t("marketing:imprint.disputes.p1")}</p>,
    },
  ];
}

export function ImprintPage() {
  const { t } = useTranslation();
  const sections = useMemo(() => buildImprintSections(t), [t]);
  const toc = useMemo(
    () =>
      IMPRINT_TOC.map((item) => ({
        id: item.id,
        label: t(`marketing:${item.titleKey}`),
      })),
    [t],
  );
  const pageTitle = t("marketing:imprint.meta.title");
  const pageDescription = t("marketing:imprint.meta.description");

  return (
    <>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.imprint },
        ])}
      />
      <LegalDoc
        eyebrow={t("marketing:legal.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:imprint.title"
            components={{ em: <em /> }}
          />
        }
        meta={[t("marketing:imprint.meta.lastReviewed")]}
        plain={{
          title: t("marketing:legal.plainSummaryTitle"),
          text: t("marketing:imprint.plain.text"),
        }}
        toc={toc}
        sections={sections}
        contact={{
          text: (
            <Translation
              i18nKey="marketing:imprint.contactCta"
              components={{ strong: <strong /> }}
            />
          ),
          email: IMPRINT_ENTITY.email,
        }}
      />
    </>
  );
}
