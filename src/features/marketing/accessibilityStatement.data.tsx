import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import type { LegalSection } from "./LegalDoc";
import s from "./LegalDoc.module.css";

/**
 * The published accessibility statement (LG-01).
 *
 * WHY IT EXISTS. QueerPulse publishes it by choice, because members rely on it.
 * Portugal transposed the European Accessibility Act (Directive (EU) 2019/882)
 * as Decreto-Lei n.º 82/2022, and two provisions of that decree-law very likely
 * put this platform outside its reach today: Article 2(3) lists the covered
 * services (electronic communications, audiovisual media access, parts of
 * passenger transport, consumer banking and finance, e-books, e-commerce, 112
 * handling) and a non-commercial community platform is on none of them, while
 * Article 2(5)(b) exempts microenterprises providing those services outright.
 * The reasoning, the sources and the
 * questions still open for a lawyer are written up in
 * `queerpulse-backend/docs/ops/accessibility-legal-basis.md`.
 *
 * The `legal` section on the page says all of this in public, and the
 * `enforcement` section gives a route that actually works. If either is edited,
 * re-read the decree-law rather than the previous draft:
 * https://diariodarepublica.pt/dr/detalhe/decreto-lei/82-2022-204379872
 *
 * EVERY CLAIM IN THIS DOCUMENT IS BACKED BY SOMETHING IN THIS REPOSITORY.
 * Before editing a sentence here, re-check its source:
 *
 * - the lint gate: `eslint.a11y.config.js` + `scripts/report-a11y.mjs`
 *   (BUDGET = 0, run first in `pnpm build`), and the nine `jsx-a11y` rules
 *   promoted to "error" in `eslint.config.js`
 * - the axe pass: `src/test/a11y.test.tsx` (11 routes, QUARANTINED empty,
 *   `color-contrast` disabled only because jsdom has no layout engine)
 * - the browser contrast pass: `e2e/contrast.spec.ts` (6 routes)
 * - the measured palette: `docs/production-readiness/contrast-audit.md`
 * - the known shortfalls: `src/features/settings/AccessibilityPrefSections.tsx`
 *   (the Coming soon toggles) and `src/shared/lib/focusFirstError.ts` (one
 *   call site so far)
 *
 * An accessibility statement that overclaims is worse than no statement, both
 * legally and for the people relying on it. Do not add a line that nothing in
 * the codebase supports.
 */
export const ACCESSIBILITY_STATEMENT_TOC = [
  { id: "commitment", titleKey: "accessibilityStatement.commitment.title" },
  { id: "scope", titleKey: "accessibilityStatement.scope.title" },
  { id: "legal", titleKey: "accessibilityStatement.legal.title" },
  { id: "status", titleKey: "accessibilityStatement.status.title" },
  { id: "works", titleKey: "accessibilityStatement.works.title" },
  { id: "shortfalls", titleKey: "accessibilityStatement.shortfalls.title" },
  { id: "prepared", titleKey: "accessibilityStatement.prepared.title" },
  { id: "feedback", titleKey: "accessibilityStatement.feedback.title" },
  { id: "enforcement", titleKey: "accessibilityStatement.enforcement.title" },
];

/** The contact form, opened with the Accessibility topic already chosen. */
export const ACCESSIBILITY_FEEDBACK_PATH = `${routes.contact}?topic=accessibility`;

/**
 * The two external sources the legal section rests on.
 *
 * Both are the bodies' own pages rather than a summary of them, so a reader who
 * doubts a sentence on this page can check it at the source, and so nothing
 * here goes stale when a phone number or an address changes. We deliberately
 * publish no postal address, phone number or email for IDiPD: none has been
 * verified by anyone here, and a wrong one sends a person who is already stuck
 * somewhere that cannot help them.
 */
const DECREE_LAW_URL =
  "https://diariodarepublica.pt/dr/detalhe/decreto-lei/82-2022-204379872";
const IDIPD_URL = "https://idipd.mtsss.gov.pt/";

/** Anchor template for an external source, cloned with its text at render. */
function externalLink(href: string) {
  // Element template, not a rendered anchor: `Translation` clones it with the
  // catalog's inner text as children, which neither rule can see. This is the
  // known false positive documented in `eslint.config.js`.
  // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label
  return <a href={href} target="_blank" rel="noopener noreferrer" />;
}

/** Working days we aim to answer an access report within. Stated in the copy
 *  via `{days}`, so the number lives in one place. */
const RESPONSE_TARGET_WORKING_DAYS = 10;

/**
 * One `<strong>`-led bullet, the shape every list item in this document takes.
 *
 * A plain function rather than a component: this module also exports the table
 * of contents and the section builder, and a PascalCase component sitting
 * beside them trips `react-refresh/only-export-components`.
 */
function leadBullet(i18nKey: string) {
  return (
    <li key={i18nKey}>
      <Translation
        i18nKey={`marketing:accessibilityStatement.${i18nKey}`}
        components={{ strong: <strong /> }}
      />
    </li>
  );
}

/**
 * The one bullet shape that also carries an outbound source link. Kept separate
 * from `leadBullet` so that one stays usable as a bare `.map` callback.
 */
function leadBulletWithSource(i18nKey: string, tag: string, href: string) {
  return (
    <li key={i18nKey}>
      <Translation
        i18nKey={`marketing:accessibilityStatement.${i18nKey}`}
        components={{ strong: <strong />, [tag]: externalLink(href) }}
      />
    </li>
  );
}

/** The two reasons Decreto-Lei 82/2022 very likely does not reach us. */
const LEGAL_REASON_IDS = ["services", "microenterprise"].map(
  (id) => `legal.${id}`,
);

/** What is in place today. Each maps to a `works.<id>` catalog key. */
const WORKING_TODAY_IDS = [
  "keyboard",
  "dialogs",
  "forms",
  "landmarks",
  "motion",
  "status",
  "language",
].map((id) => `works.${id}`);

/** The known shortfalls, in the order they are worth reading. */
const SHORTFALL_IDS = [
  "colour",
  "preferences",
  "textSize",
  "focusAfterError",
  "sample",
  "assistiveTech",
  "pdf",
  "language",
].map((id) => `shortfalls.${id}`);

/** How the statement was prepared, method by method. */
const PREPARATION_METHOD_IDS = ["lint", "axe", "contrast"].map(
  (id) => `prepared.${id}`,
);

/** Commitment, scope, and the honest conformance status. */
function statusSections(t: TFunction): LegalSection[] {
  return [
    {
      id: "commitment",
      title: t("marketing:accessibilityStatement.commitment.title"),
      body: (
        <>
          <p>{t("marketing:accessibilityStatement.commitment.p1")}</p>
          <p>{t("marketing:accessibilityStatement.commitment.p2")}</p>
          <p>{t("marketing:accessibilityStatement.commitment.p3")}</p>
          <p>{t("marketing:accessibilityStatement.commitment.p4")}</p>
        </>
      ),
    },
    {
      id: "scope",
      title: t("marketing:accessibilityStatement.scope.title"),
      body: (
        <>
          <p>{t("marketing:accessibilityStatement.scope.p1")}</p>
          <p>{t("marketing:accessibilityStatement.scope.p2")}</p>
          <p>{t("marketing:accessibilityStatement.scope.p3")}</p>
        </>
      ),
    },
    {
      // Where the law stands. This section is the one place on the page that
      // makes a legal claim, so every sentence in it names the article it
      // rests on and the decree-law is linked at the source. It says the
      // platform is very likely OUT of scope, which is the honest reading of
      // Article 2(3) and Article 2(5)(b), and it names paid ticketing as the
      // trigger to go and read the law again rather than as a prediction.
      id: "legal",
      title: t("marketing:accessibilityStatement.legal.title"),
      body: (
        <>
          <p>
            <Translation
              i18nKey="marketing:accessibilityStatement.legal.p1"
              components={{ lei: externalLink(DECREE_LAW_URL) }}
            />
          </p>
          <ul>{LEGAL_REASON_IDS.map(leadBullet)}</ul>
          <p>{t("marketing:accessibilityStatement.legal.p2")}</p>
          <p>{t("marketing:accessibilityStatement.legal.p3")}</p>
          {/* The non-advice line. Carried by the words "Not legal advice", so
              it never depends on the panel's colour alone. */}
          <div className={s.highlight}>
            <p>
              <strong>
                {t("marketing:accessibilityStatement.legal.disclaimerLabel")}
              </strong>{" "}
              {t("marketing:accessibilityStatement.legal.disclaimer")}
            </p>
          </div>
        </>
      ),
    },
    {
      id: "status",
      title: t("marketing:accessibilityStatement.status.title"),
      body: (
        <>
          <p>
            <Translation
              i18nKey="marketing:accessibilityStatement.status.p1"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>{t("marketing:accessibilityStatement.status.p2")}</p>
        </>
      ),
    },
  ];
}

/** What is in place today, and what is known to fall short. */
function findingsSections(t: TFunction): LegalSection[] {
  return [
    {
      id: "works",
      title: t("marketing:accessibilityStatement.works.title"),
      body: (
        <>
          <p>{t("marketing:accessibilityStatement.works.intro")}</p>
          <ul>{WORKING_TODAY_IDS.map(leadBullet)}</ul>
        </>
      ),
    },
    {
      id: "shortfalls",
      title: t("marketing:accessibilityStatement.shortfalls.title"),
      body: (
        <>
          <p>{t("marketing:accessibilityStatement.shortfalls.intro")}</p>
          <ul>{SHORTFALL_IDS.map(leadBullet)}</ul>
        </>
      ),
    },
  ];
}

/** Method, the feedback route that actually works, and the escalation path. */
function processSections(t: TFunction): LegalSection[] {
  return [
    {
      id: "prepared",
      title: t("marketing:accessibilityStatement.prepared.title"),
      body: (
        <>
          <p>{t("marketing:accessibilityStatement.prepared.p1")}</p>
          <ul>{PREPARATION_METHOD_IDS.map(leadBullet)}</ul>
          <p>{t("marketing:accessibilityStatement.prepared.p2")}</p>
        </>
      ),
    },
    {
      id: "feedback",
      title: t("marketing:accessibilityStatement.feedback.title"),
      body: (
        <>
          <p>{t("marketing:accessibilityStatement.feedback.p1")}</p>
          <p>
            <Translation
              i18nKey="marketing:accessibilityStatement.feedback.p2"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>
            {t("marketing:accessibilityStatement.feedback.p3", {
              days: String(RESPONSE_TARGET_WORKING_DAYS),
            })}
          </p>
          <p>
            <Button variant="primary" to={ACCESSIBILITY_FEEDBACK_PATH}>
              {t("marketing:accessibilityStatement.feedback.cta")}
            </Button>
          </p>
        </>
      ),
    },
    {
      id: "enforcement",
      title: t("marketing:accessibilityStatement.enforcement.title"),
      // The escalation ladder, in the order most likely to help: us first
      // (POST /inquiries really does store the report), then IDiPD, which
      // Article 36 makes the body that forwards a misdirected complaint on,
      // then the Article 28 sectoral regulator, flagged as possibly not open
      // to this reader at all. Decreto-Lei 82/2022 gives e-commerce services
      // to ANACOM under Article 28(1)(a); ASAE's remit under 28(1)(g) is
      // products, so do not swap the name.
      body: (
        <>
          <p>{t("marketing:accessibilityStatement.enforcement.p1")}</p>
          <ul>
            {leadBullet("enforcement.tellUs")}
            {leadBulletWithSource("enforcement.idipd", "idipd", IDIPD_URL)}
            {leadBullet("enforcement.regulator")}
          </ul>
          <p>{t("marketing:accessibilityStatement.enforcement.p2")}</p>
        </>
      ),
    },
  ];
}

/** Every section of the statement, in reading order. */
export function buildAccessibilityStatementSections(
  t: TFunction,
): LegalSection[] {
  return [...statusSections(t), ...findingsSections(t), ...processSections(t)];
}
