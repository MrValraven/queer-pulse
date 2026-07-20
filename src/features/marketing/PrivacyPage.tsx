import { useMemo } from "react";
import { SubpageIndex } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { POLICY_VERSION } from "../../shared/api/consent.api";
import { LegalDoc, type LegalSection } from "./LegalDoc";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import s from "./LegalDoc.module.css";

const PRIVACY_TOC = [
  { id: "who-we-are", titleKey: "privacy.whoWeAre.title" },
  { id: "what-we-collect", titleKey: "privacy.whatWeCollect.title" },
  { id: "how-we-use", titleKey: "privacy.howWeUse.title" },
  { id: "who-sees", titleKey: "privacy.whoSees.title" },
  { id: "retention", titleKey: "privacy.retention.title" },
  { id: "your-rights", titleKey: "privacy.yourRights.title" },
  { id: "cookies", titleKey: "privacy.cookiesSection.title" },
  { id: "third-parties", titleKey: "privacy.thirdParties.title" },
  { id: "changes", titleKey: "privacy.changes.title" },
  { id: "contact-privacy", titleKey: "privacy.contactSection.title" },
];

/** i18n Pattern B — see TermsPage.tsx for the same shape + rationale. */
function buildPrivacySections(t: TFunction): LegalSection[] {
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
            <li>
              <Translation
                i18nKey="marketing:privacy.whatWeCollect.account.item4"
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
          </ul>
          <h4>{t("marketing:privacy.whatWeCollect.notCollectedHeading")}</h4>
          <div className={s.highlight}>
            <p>{t("marketing:privacy.whatWeCollect.notCollectedBody")}</p>
          </div>
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
    {
      id: "retention",
      title: t("marketing:privacy.retention.title"),
      body: (
        <>
          <p>{t("marketing:privacy.retention.p1")}</p>
          <p>{t("marketing:privacy.retention.p2")}</p>
          <p>{t("marketing:privacy.retention.p3")}</p>
        </>
      ),
    },
    {
      id: "your-rights",
      title: t("marketing:privacy.yourRights.title"),
      body: (
        <>
          <p>{t("marketing:privacy.yourRights.intro")}</p>
          <ul>
            <li>
              <Translation
                i18nKey="marketing:privacy.yourRights.item1"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.yourRights.item2"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.yourRights.item3"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.yourRights.item4"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.yourRights.item5"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.yourRights.item6"
                components={{ strong: <strong /> }}
              />
            </li>
          </ul>
          <p>{t("marketing:privacy.yourRights.p1")}</p>
          <p>{t("marketing:privacy.yourRights.p2")}</p>
        </>
      ),
    },
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
          <ul>
            <li>
              <Translation
                i18nKey="marketing:privacy.thirdParties.item1"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.thirdParties.item2"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.thirdParties.item3"
                components={{ strong: <strong /> }}
              />
            </li>
          </ul>
          <p>
            <Translation
              i18nKey="marketing:privacy.thirdParties.optInIntro"
              components={{ strong: <strong /> }}
            />
          </p>
          <ul>
            <li>
              <Translation
                i18nKey="marketing:privacy.thirdParties.optItem1"
                components={{ strong: <strong /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:privacy.thirdParties.optItem2"
                components={{ strong: <strong /> }}
              />
            </li>
          </ul>
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
              // eslint-disable-next-line jsx-a11y/anchor-has-content -- false positive: an element template for <Translation>, which clones it with the translated children at render.
              components={{ a: <a href="mailto:privacy@queerpulse.pt" /> }}
            />
          </p>
        </>
      ),
    },
  ];
}

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
          t("marketing:privacy.meta.lastUpdated", { date: "10 July 2026" }),
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
