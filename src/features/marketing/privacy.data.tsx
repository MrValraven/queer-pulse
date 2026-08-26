import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import type { LegalSection } from "./LegalDoc";
import s from "./LegalDoc.module.css";

/**
 * One `<strong>`-led bullet. A plain function rather than a component, because
 * this module also exports the table of contents and the section builder and a
 * PascalCase component beside them trips `react-refresh/only-export-components`.
 */
function leadBullet(key: string) {
  return (
    <li key={key}>
      <Translation
        i18nKey={`marketing:privacy.${key}`}
        components={{ strong: <strong /> }}
      />
    </li>
  );
}

/**
 * The retention periods that a sweeper actually enforces. Every one is cited in
 * `queerpulse-backend/docs/ops/retention-periods.md` §1. Do not add a period
 * here that no scheduled job clears.
 */
const RETENTION_CLEARS_KEYS = [
  "gathering",
  "notifications",
  "push",
  "cardVerification",
  "export",
  "sessions",
  "invites",
  "housing",
].map((id) => `retention.clears.${id}`);

/** The seven GDPR rights, and the route by which each is actually exercised. */
const RIGHTS_KEYS = [1, 2, 3, 4, 5, 6, 7].map((n) => `yourRights.item${n}`);
const RIGHTS_HOW_KEYS = [
  "access",
  "rectification",
  "erasure",
  "objection",
  "portability",
  "restriction",
  "withdrawConsent",
].map((id) => `yourRights.how.${id}`);

/**
 * The sub-processors, in the order the copy lists them. Taken from
 * `queerpulse-backend/docs/ops/sub-processors-and-processing.md`. Two rules:
 * never add a processor the code does not call, and never write that any of
 * them is bound by contract. No Data Processing Agreement is recorded in
 * either repository, so that claim is unverifiable today.
 */
const SUB_PROCESSOR_KEYS = [
  "google",
  "railway",
  "tigris",
  "vercel",
  "openFreeMap",
  "openStreetMap",
  "googleMaps",
  "klipy",
  "pushService",
].map((id) => `thirdParties.${id}`);

export const PRIVACY_TOC = [
  { id: "who-we-are", titleKey: "privacy.whoWeAre.title" },
  { id: "what-we-collect", titleKey: "privacy.whatWeCollect.title" },
  { id: "sensitive-identity", titleKey: "privacy.sensitive.title" },
  { id: "how-we-use", titleKey: "privacy.howWeUse.title" },
  { id: "who-sees", titleKey: "privacy.whoSees.title" },
  { id: "retention", titleKey: "privacy.retention.title" },
  { id: "your-rights", titleKey: "privacy.yourRights.title" },
  { id: "cookies", titleKey: "privacy.cookiesSection.title" },
  { id: "third-parties", titleKey: "privacy.thirdParties.title" },
  { id: "changes", titleKey: "privacy.changes.title" },
  { id: "contact-privacy", titleKey: "privacy.contactSection.title" },
];

/** Who we are, what we collect, and the sensitive-data promise. */
function coreSections(t: TFunction): LegalSection[] {
  return [
    {
      id: "who-we-are",
      title: t("marketing:privacy.whoWeAre.title"),
      body: (
        <>
          <p>{t("marketing:privacy.whoWeAre.p1")}</p>
          <p>{t("marketing:privacy.whoWeAre.p2")}</p>
        </>
      ),
    },
    {
      id: "what-we-collect",
      title: t("marketing:privacy.whatWeCollect.title"),
      body: (
        <>
          <h4>{t("marketing:privacy.whatWeCollect.accountHeading")}</h4>
          <ul>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.account.item1"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.account.item2"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.account.item3"
                components={{ strong: <strong /> }}
              />
            </li>
          </ul>
          <h4>{t("marketing:privacy.whatWeCollect.signInHeading")}</h4>
          <p>
            <Translation
              i18nKey="marketing:privacy.whatWeCollect.signInBody"
              components={{ strong: <strong /> }}
            />
          </p>
          <h4>{t("marketing:privacy.whatWeCollect.deviceHeading")}</h4>
          <ul>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.device.item1"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.device.item2"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.device.item3"
                components={{ strong: <strong /> }}
              />
            </li>
          </ul>
          <h4>{t("marketing:privacy.whatWeCollect.activityHeading")}</h4>
          <ul>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.activity.item1"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.activity.item2"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.activity.item3"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.activity.item4"
                components={{ strong: <strong /> }}
              />
            </li>
          </ul>
          <h4>{t("marketing:privacy.whatWeCollect.notCollectedHeading")}</h4>
          <div className={s.highlight}>
            <p>{t("marketing:privacy.whatWeCollect.notCollectedBody")}</p>
          </div>
        </>
      ),
    },
    {
      id: "sensitive-identity",
      title: t("marketing:privacy.sensitive.title"),
      body: (
        <>
          <p>{t("marketing:privacy.sensitive.p1")}</p>
          <div className={s.highlight}>
            <p>
              <Translation
                i18nKey="marketing:privacy.sensitive.p2"
                components={{ strong: <strong /> }}
              />
            </p>
          </div>
          <p>{t("marketing:privacy.sensitive.p3")}</p>
          <p>
            <Translation
              i18nKey="marketing:privacy.sensitive.p4"
              components={{ strong: <strong /> }}
            />
          </p>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: t("marketing:privacy.howWeUse.title"),
      body: (
        <>
          <p>{t("marketing:privacy.howWeUse.intro")}</p>
          <ul>
            <li>{t("marketing:privacy.howWeUse.item1")}</li>
            <li>{t("marketing:privacy.howWeUse.item2")}</li>
            <li>{t("marketing:privacy.howWeUse.item3")}</li>
            <li>{t("marketing:privacy.howWeUse.item4")}</li>
            <li>{t("marketing:privacy.howWeUse.item5")}</li>
            <li>{t("marketing:privacy.howWeUse.item6")}</li>
          </ul>
          <p>{t("marketing:privacy.howWeUse.p1")}</p>
        </>
      ),
    },
    {
      id: "who-sees",
      title: t("marketing:privacy.whoSees.title"),
      body: (
        <>
          <p>
            <Translation
              i18nKey="marketing:privacy.whoSees.p1"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>
            <Translation
              i18nKey="marketing:privacy.whoSees.p2"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>
            <Translation
              i18nKey="marketing:privacy.whoSees.p3"
              components={{ strong: <strong /> }}
            />
          </p>
          <p>
            <Translation
              i18nKey="marketing:privacy.whoSees.p4"
              components={{ strong: <strong /> }}
            />
          </p>
        </>
      ),
    },
  ];
}

/** Retention windows and the member's data rights. */
function rightsSections(t: TFunction): LegalSection[] {
  return [
    {
      id: "retention",
      title: t("marketing:privacy.retention.title"),
      body: (
        <>
          <p>{t("marketing:privacy.retention.p1")}</p>

          <h4>{t("marketing:privacy.retention.clearsHeading")}</h4>
          <p>{t("marketing:privacy.retention.p3")}</p>
          <ul>{RETENTION_CLEARS_KEYS.map(leadBullet)}</ul>

          <h4>{t("marketing:privacy.retention.deleteHeading")}</h4>
          <p>{t("marketing:privacy.retention.p2")}</p>
          <p>{t("marketing:privacy.retention.deleted.keptIntro")}</p>
          <ul>
            {leadBullet("retention.deleted.keptModeration")}
            {/* `retention.p4` is the email-fingerprint claim, verified accurate
                against the backend. It reads as the second of the three kept
                things, so it lives here rather than as a loose paragraph. Do
                not reword it. */}
            {leadBullet("retention.p4")}
            {leadBullet("retention.deleted.keptContent")}
          </ul>

          <h4>{t("marketing:privacy.retention.beyondHeading")}</h4>
          <p>{t("marketing:privacy.retention.beyond.body")}</p>
        </>
      ),
    },
    {
      id: "your-rights",
      title: t("marketing:privacy.yourRights.title"),
      body: (
        <>
          <p>{t("marketing:privacy.yourRights.intro")}</p>
          <ul>{RIGHTS_KEYS.map(leadBullet)}</ul>

          {/* The request form itself accepts Articles 15, 16, 17 and 21 only.
              Restriction and portability are still real rights, exercised
              through the form's free text and through the self-service export,
              so the page says how to reach each one rather than quietly
              dropping the two the form has no radio button for. */}
          <h4>{t("marketing:privacy.yourRights.howHeading")}</h4>
          <ul>{RIGHTS_HOW_KEYS.map(leadBullet)}</ul>

          <p>{t("marketing:privacy.yourRights.p1")}</p>
          <p>{t("marketing:privacy.yourRights.slaExtension")}</p>
          <p>{t("marketing:privacy.yourRights.responseChannel")}</p>
          <p>{t("marketing:privacy.yourRights.p2")}</p>
        </>
      ),
    },
  ];
}

/** Cookies, third parties, changes, and how to reach the privacy team. */
function policySections(t: TFunction): LegalSection[] {
  return [
    {
      id: "cookies",
      title: t("marketing:privacy.cookiesSection.title"),
      body: (
        <>
          <p>{t("marketing:privacy.cookiesSection.p1")}</p>
          <p>{t("marketing:privacy.cookiesSection.p2")}</p>
          <p>
            <Translation
              i18nKey="marketing:privacy.cookiesSection.p3"
              components={{ strong: <strong />, em: <em /> }}
            />
          </p>
        </>
      ),
    },
    {
      id: "third-parties",
      title: t("marketing:privacy.thirdParties.title"),
      body: (
        <>
          <p>{t("marketing:privacy.thirdParties.intro")}</p>
          <ul>{SUB_PROCESSOR_KEYS.map(leadBullet)}</ul>
          <p>{t("marketing:privacy.thirdParties.embeds")}</p>
          <p>
            <Translation
              i18nKey="marketing:privacy.thirdParties.optInIntro"
              components={{ strong: <strong /> }}
            />
          </p>
          <ul>{leadBullet("thirdParties.optItem1")}</ul>
          {/* Deliberately unfilled. Processing regions and the transfer
              safeguard for anything outside the EEA are a factual matter a
              person has to confirm with each provider; a guess here would be a
              claim about where members' data lives. The label is carried by
              the words "To be confirmed", never by the panel's colour alone. */}
          <div className={s.highlight}>
            <p>
              <strong>
                {t("marketing:privacy.thirdParties.transfersLabel")}
              </strong>{" "}
              {t("marketing:privacy.thirdParties.transfers")}
            </p>
          </div>
          <p>{t("marketing:privacy.thirdParties.outro")}</p>
        </>
      ),
    },
    {
      id: "changes",
      title: t("marketing:privacy.changes.title"),
      body: (
        <>
          <p>{t("marketing:privacy.changes.p1")}</p>
          <p>{t("marketing:privacy.changes.p2")}</p>
        </>
      ),
    },
    {
      id: "contact-privacy",
      title: t("marketing:privacy.contactSection.title"),
      body: (
        <>
          <p>
            <Translation
              i18nKey="marketing:privacy.contactSection.body"
              // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- false positive: an element template for <Translation>, which clones it with the translated children (its accessible name) at render.
              components={{ a: <a href="mailto:hello@queerpulse.com" /> }}
            />
          </p>
        </>
      ),
    },
  ];
}

/** i18n Pattern B — see TermsPage.tsx for the same shape + rationale. */
export function buildPrivacySections(t: TFunction): LegalSection[] {
  return [...coreSections(t), ...rightsSections(t), ...policySections(t)];
}
