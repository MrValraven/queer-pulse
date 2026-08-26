import { useMemo } from "react";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { LegalDoc, type LegalSection } from "./LegalDoc";
import {
  ACCESSIBILITY_STATEMENT_TOC,
  buildAccessibilityStatementSections,
} from "./accessibilityStatement.data";
import s from "./LegalDoc.module.css";

/**
 * The day this statement was written, and the day it was last gone through.
 *
 * `Date` values rather than pre-formatted strings: they go through
 * `useFormat().date()` below, so the Portuguese page reads "26 de agosto de
 * 2026" instead of an English month name inside a Portuguese sentence. On the
 * accessibility statement of all pages, a language mismatch mid-sentence is
 * exactly what a screen reader reads out in the wrong voice.
 *
 * Built from local parts rather than parsed from "2026-08-26", which `Date`
 * reads as UTC midnight and would render as the 25th for any reader west of
 * Greenwich. Month is zero-based, so 7 is August.
 */
const PREPARED_DATE = new Date(2026, 7, 26);
const LAST_REVIEWED_DATE = new Date(2026, 7, 26);

/**
 * Section list with REAL headings.
 *
 * `LegalDoc`'s own `sections` prop renders each section title as a styled
 * `<div>`, which leaves a long document with a single `<h1>` and no structure
 * under it. That is survivable on Privacy and Terms and indefensible on the
 * accessibility statement itself, so this page passes `body` instead and
 * renders `<section>` + `<h2>`, reusing LegalDoc's own classes so it looks
 * identical to its siblings. `*` resets margins globally (src/styles/base.css),
 * so an `<h2>` carrying `.sTitle` computes exactly as the `<div>` did.
 *
 * Each `<section>` is named by its own heading, which makes the document
 * navigable by region as well as by heading, and every id is unique because it
 * comes from the table of contents.
 */
function AccessibilityStatementSections({
  sections,
}: {
  sections: LegalSection[];
}) {
  return (
    <>
      {sections.map((section) => {
        const headingId = `${section.id}-heading`;
        return (
          <section
            className={s.section}
            id={section.id}
            key={section.id}
            aria-labelledby={headingId}
          >
            <h2 className={s.sTitle} id={headingId}>
              {section.title}
            </h2>
            <div className={s.sBody}>{section.body}</div>
          </section>
        );
      })}
    </>
  );
}

/**
 * The published accessibility statement (LG-01) at `/policies/accessibility`.
 *
 * Public, like every other page under `/policies`: `src/app/authGate.ts` is a
 * denylist and nothing gates this prefix, which is what a legally required
 * document needs, since the person most likely to be locked out of the sign-in
 * is exactly the person the document is for.
 *
 * The words live in `accessibilityStatement.data.tsx`, which carries the list
 * of files every claim was checked against. Read that before editing the copy.
 */
export function AccessibilityStatementPage() {
  const { t } = useTranslation();
  const format = useFormat();
  const sections = useMemo(() => buildAccessibilityStatementSections(t), [t]);
  const toc = useMemo(
    () =>
      ACCESSIBILITY_STATEMENT_TOC.map((item) => ({
        id: item.id,
        label: t(`marketing:${item.titleKey}`),
      })),
    [t],
  );
  const pageTitle = t("marketing:accessibilityStatement.meta.title");
  const pageDescription = t(
    "marketing:accessibilityStatement.meta.description",
  );

  return (
    <>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.policiesAccessibility },
        ])}
      />
      <LegalDoc
        eyebrow={t("marketing:legal.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:accessibilityStatement.title"
            components={{ em: <em /> }}
          />
        }
        meta={[
          t("marketing:accessibilityStatement.meta.prepared", {
            date: format.date(PREPARED_DATE),
          }),
          t("marketing:accessibilityStatement.meta.reviewed", {
            date: format.date(LAST_REVIEWED_DATE),
          }),
          t("marketing:accessibilityStatement.meta.standard", {
            standard: t("marketing:accessibilityStatement.standard"),
          }),
        ]}
        plain={{
          title: t("marketing:legal.plainSummaryTitle"),
          text: t("marketing:accessibilityStatement.plain.text"),
        }}
        toc={toc}
        body={<AccessibilityStatementSections sections={sections} />}
      />
    </>
  );
}
