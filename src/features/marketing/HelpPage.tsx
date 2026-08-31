import { useState, type ReactElement } from "react";
import { AnimatePresence, m } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
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
        qKey: "marketing:help.qa.unknownSession.q",
        aKey: "marketing:help.qa.unknownSession.a",
        aComponents: {
          sessionsLink: <Link to={routes.sessions} />,
          contactLink: <Link to={`${routes.contact}?topic=account`} />,
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
  const { reducedMotion } = useMotionPrefs();
  // A link may address one category directly (`/about/help#account`), so a page
  // that sends someone here for a specific answer lands them on it.
  const { hash } = useLocation();
  const requestedCategory = hash.replace("#", "");
  const initialCategory = CATEGORIES.some(
    (candidate) => candidate.id === requestedCategory,
  )
    ? requestedCategory
    : CATEGORIES[0]!.id;
  const [tab, setTab] = useState(initialCategory);
  const [open, setOpen] = useState<string | null>(`${initialCategory}-0`);
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
                      <FiChevronRight aria-hidden />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        key="answer"
                        className={s.accReveal}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: reducedMotion ? 0 : 0.24,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <div className={s.accA}>
                          <Translation
                            i18nKey={item.aKey}
                            components={item.aComponents}
                          />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
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
    </PageShell>
  );
}
