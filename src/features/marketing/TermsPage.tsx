import { useMemo } from "react";
import { LegalDoc, type LegalSection } from "./LegalDoc";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { TERMS_TOC } from "./TermsPage.data";
import s from "./LegalDoc.module.css";

/**
 * i18n Pattern B — every `<p>`/`<li>` body is a `t()` call, `<strong>`/`<a>`
 * runs go through `<Translation>` so the tag placeholder stays inside one
 * catalog sentence instead of being split around the markup.
 */
function buildTermsSections(t: TFunction): LegalSection[] {
  return [
    {
      id: "eligibility",
      title: t("marketing:terms.eligibility.title"),
      body: (
        <>
          <p>{t("marketing:terms.eligibility.p1")}</p>
          <p>
            <Translation
              i18nKey="marketing:terms.eligibility.p2"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>{t("marketing:terms.eligibility.p3")}</p>
        </>
      ),
    },
    {
      id: "account",
      title: t("marketing:terms.account.title"),
      body: (
        <>
          <p>{t("marketing:terms.account.p1")}</p>
          <p>{t("marketing:terms.account.p2")}</p>
          <p>{t("marketing:terms.account.p3")}</p>
        </>
      ),
    },
    {
      id: "conduct",
      title: t("marketing:terms.conduct.title"),
      body: (
        <>
          <p>{t("marketing:terms.conduct.intro")}</p>
          <ul>
            <li>{t("marketing:terms.conduct.item1")}</li>
            <li>{t("marketing:terms.conduct.item2")}</li>
            <li>{t("marketing:terms.conduct.item3")}</li>
            <li>{t("marketing:terms.conduct.item4")}</li>
            <li>{t("marketing:terms.conduct.item5")}</li>
            <li>{t("marketing:terms.conduct.item6")}</li>
          </ul>
          <div className={s.highlight}>
            <p>{t("marketing:terms.conduct.highlight")}</p>
          </div>
        </>
      ),
    },
    {
      id: "content",
      title: t("marketing:terms.content.title"),
      body: (
        <>
          <p>
            <Translation
              i18nKey="marketing:terms.content.p1"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>{t("marketing:terms.content.p2")}</p>
          <p>{t("marketing:terms.content.p3")}</p>
          <h4>{t("marketing:terms.content.magazineHeading")}</h4>
          <p>{t("marketing:terms.content.magazineBody")}</p>
        </>
      ),
    },
    {
      id: "events",
      title: t("marketing:terms.events.title"),
      body: (
        <>
          <p>{t("marketing:terms.events.p1")}</p>
          <p>{t("marketing:terms.events.p2")}</p>
          <p>{t("marketing:terms.events.p3")}</p>
          <p>{t("marketing:terms.events.p4")}</p>
        </>
      ),
    },
    {
      id: "termination",
      title: t("marketing:terms.termination.title"),
      body: (
        <>
          <p>{t("marketing:terms.termination.intro")}</p>
          <ul>
            <li>{t("marketing:terms.termination.item1")}</li>
            <li>{t("marketing:terms.termination.item2")}</li>
            <li>{t("marketing:terms.termination.item3")}</li>
          </ul>
          <p>{t("marketing:terms.termination.p1")}</p>
          <p>{t("marketing:terms.termination.p2")}</p>
        </>
      ),
    },
    {
      id: "liability",
      title: t("marketing:terms.liability.title"),
      body: (
        <>
          <p>{t("marketing:terms.liability.p1")}</p>
          <p>{t("marketing:terms.liability.p2")}</p>
          <p>{t("marketing:terms.liability.p3")}</p>
          <div className={s.highlight}>
            <p>{t("marketing:terms.liability.highlight")}</p>
          </div>
        </>
      ),
    },
    {
      id: "changes-terms",
      title: t("marketing:terms.changesTerms.title"),
      body: (
        <>
          <p>{t("marketing:terms.changesTerms.p1")}</p>
          <p>{t("marketing:terms.changesTerms.p2")}</p>
        </>
      ),
    },
    {
      id: "law",
      title: t("marketing:terms.law.title"),
      body: (
        <>
          <p>{t("marketing:terms.law.p1")}</p>
          <p>{t("marketing:terms.law.p2")}</p>
        </>
      ),
    },
    {
      id: "contact-terms",
      title: t("marketing:terms.contactSection.title"),
      body: (
        <>
          <p>
            <Translation
              i18nKey="marketing:terms.contactSection.body"
              // eslint-disable-next-line jsx-a11y/anchor-has-content -- false positive: an element template for <Translation>, which clones it with the translated children at render.
              components={{ a: <a href="mailto:hello@queerpulse.pt" /> }}
            />
          </p>
        </>
      ),
    },
  ];
}

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
          email: "hello@queerpulse.pt",
        }}
      />
    </>
  );
}
