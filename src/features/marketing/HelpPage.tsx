import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, SubpageIndex } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import s from "./HelpPage.module.css";

interface QA {
  qKey: string;
  aKey: string;
  aComponents?: Record<string, ReactElement>;
}
interface Category {
  id: string;
  labelKey: string;
  headKey: string;
  qa: QA[];
}

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    labelKey: "marketing:help.category.gettingStarted.label",
    headKey: "marketing:help.category.gettingStarted.head",
    qa: [
      {
        qKey: "marketing:help.qa.invite.q",
        aKey: "marketing:help.qa.invite.a",
        aComponents: { strong: <strong /> },
      },
      {
        qKey: "marketing:help.qa.afterAccept.q",
        aKey: "marketing:help.qa.afterAccept.a",
      },
      {
        qKey: "marketing:help.qa.lisbonOnly.q",
        aKey: "marketing:help.qa.lisbonOnly.a",
      },
      {
        qKey: "marketing:help.qa.free.q",
        aKey: "marketing:help.qa.free.a",
        aComponents: { link: <Link to={routes.cinemaMembership} /> },
      },
    ],
  },
  {
    id: "account",
    labelKey: "marketing:help.category.account.label",
    headKey: "marketing:help.category.account.head",
    qa: [
      {
        qKey: "marketing:help.qa.changeName.q",
        aKey: "marketing:help.qa.changeName.a",
        aComponents: { settingsLink: <Link to={routes.settings} /> },
      },
      {
        qKey: "marketing:help.qa.privateProfile.q",
        aKey: "marketing:help.qa.privateProfile.a",
        aComponents: {
          settingsLink: <Link to={routes.settings} />,
          strong: <strong />,
        },
      },
      {
        qKey: "marketing:help.qa.deleteAccount.q",
        aKey: "marketing:help.qa.deleteAccount.a",
        aComponents: { settingsLink: <Link to={routes.settings} /> },
      },
      {
        qKey: "marketing:help.qa.levels.q",
        aKey: "marketing:help.qa.levels.a",
      },
    ],
  },
  {
    id: "gatherings",
    labelKey: "marketing:help.category.gatherings.label",
    headKey: "marketing:help.category.gatherings.head",
    qa: [
      {
        qKey: "marketing:help.qa.rsvp.q",
        aKey: "marketing:help.qa.rsvp.a",
        aComponents: {
          calendarLink: <Link to={routes.calendar} />,
          strong: <strong />,
        },
      },
      {
        qKey: "marketing:help.qa.hostGathering.q",
        aKey: "marketing:help.qa.hostGathering.a",
        aComponents: { hostLink: <Link to={routes.host} /> },
      },
      {
        qKey: "marketing:help.qa.cantMakeIt.q",
        aKey: "marketing:help.qa.cantMakeIt.a",
      },
      {
        qKey: "marketing:help.qa.waitlist.q",
        aKey: "marketing:help.qa.waitlist.a",
      },
    ],
  },
  {
    id: "safety",
    labelKey: "marketing:help.category.safety.label",
    headKey: "marketing:help.category.safety.head",
    qa: [
      {
        qKey: "marketing:help.qa.reportMember.q",
        aKey: "marketing:help.qa.reportMember.a",
      },
      {
        qKey: "marketing:help.qa.afterReport.q",
        aKey: "marketing:help.qa.afterReport.a",
        aComponents: { strong: <strong /> },
      },
      {
        qKey: "marketing:help.qa.appeal.q",
        aKey: "marketing:help.qa.appeal.a",
        aComponents: { governanceLink: <Link to={routes.governance} /> },
      },
      {
        qKey: "marketing:help.qa.blockMute.q",
        aKey: "marketing:help.qa.blockMute.a",
        aComponents: { strong: <strong /> },
      },
    ],
  },
  {
    id: "membership",
    labelKey: "marketing:help.category.membership.label",
    headKey: "marketing:help.category.membership.head",
    qa: [
      {
        qKey: "marketing:help.qa.becomeSupporter.q",
        aKey: "marketing:help.qa.becomeSupporter.a",
        aComponents: { membershipLink: <Link to={routes.cinemaMembership} /> },
      },
      {
        qKey: "marketing:help.qa.invitesWork.q",
        aKey: "marketing:help.qa.invitesWork.a",
      },
      {
        qKey: "marketing:help.qa.vouching.q",
        aKey: "marketing:help.qa.vouching.a",
      },
      {
        qKey: "marketing:help.qa.perks.q",
        aKey: "marketing:help.qa.perks.a",
      },
    ],
  },
  {
    id: "technical",
    labelKey: "marketing:help.category.technical.label",
    headKey: "marketing:help.category.technical.head",
    qa: [
      {
        qKey: "marketing:help.qa.emailNotifications.q",
        aKey: "marketing:help.qa.emailNotifications.a",
        aComponents: { settingsLink: <Link to={routes.settings} /> },
      },
      {
        qKey: "marketing:help.qa.browserSupport.q",
        aKey: "marketing:help.qa.browserSupport.a",
      },
      {
        qKey: "marketing:help.qa.somethingBroken.q",
        aKey: "marketing:help.qa.somethingBroken.a",
        aComponents: { contactLink: <Link to={routes.contact} /> },
      },
    ],
  },
];

export function HelpPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(CATEGORIES[0]!.id);
  const [open, setOpen] = useState<string | null>(`${CATEGORIES[0]!.id}-0`);
  const category = CATEGORIES.find((c) => c.id === tab)!;
  const pageTitle = t("marketing:help.meta.title");
  const pageDescription = t("marketing:help.meta.description");
  const faqEntries = CATEGORIES.flatMap((c) =>
    c.qa.map((item) => ({ question: t(item.qKey), answer: t(item.aKey) })),
  );

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd schema={buildFaqSchema(faqEntries)} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.help },
        ])}
      />
      <PageHero
        plum={false}
        eyebrow={t("marketing:help.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:help.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:help.hero.sub")}
      >
        <div className={s.tabs}>
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              className={[s.tab, tab === c.id && s.tabOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setTab(c.id);
                setOpen(`${c.id}-0`);
              }}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="wrap">
        <div className={s.body}>
          <h2 className={s.hsHead}>
            <Translation
              i18nKey={category.headKey}
              components={{ em: <em /> }}
            />
          </h2>
          <div className={s.accordion}>
            {category.qa.map((item, i) => {
              const key = `${category.id}-${i}`;
              const isOpen = open === key;
              return (
                <div key={key} className={s.accItem}>
                  <button
                    type="button"
                    className={s.accQ}
                    onClick={() => setOpen(isOpen ? null : key)}
                  >
                    {t(item.qKey)}
                    <span
                      className={[s.chevron, isOpen && s.chevronOpen]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      ›
                    </span>
                  </button>
                  {isOpen && (
                    <div className={s.accA}>
                      <Translation
                        i18nKey={item.aKey}
                        components={item.aComponents}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={s.helpContact}>
            <div>
              <h3>{t("marketing:help.stillStuck.title")}</h3>
              <p>{t("marketing:help.stillStuck.body")}</p>
            </div>
            <Button to={routes.contact}>
              {t("marketing:help.stillStuck.cta")}
            </Button>
          </div>
        </div>
      </div>

      <SubpageIndex
        title={t("marketing:help.subpageIndex.title")}
        items={[
          {
            label: t("marketing:help.subpageIndex.accessibility.label"),
            to: routes.accessibility,
            blurb: t("marketing:help.subpageIndex.accessibility.blurb"),
          },
        ]}
      />
    </PageShell>
  );
}
