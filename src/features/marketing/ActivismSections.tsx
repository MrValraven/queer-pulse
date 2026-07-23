import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { usePartners } from "./api/usePartners";
import { useOpportunities } from "./api/useOpportunities";
import {
  START_STEPS,
  SKILLS_CARDS,
  OPEN_LETTER_SIGNATURES,
  OPEN_LETTER_TARGET,
} from "./activism.data";
import s from "./ActivismPage.module.css";

/** How many partners / opportunities the activism teasers surface before the
 *  "see all" link takes over — the full lists live on /about/partners and
 *  /about/volunteer. */
const TEASER_COUNT = 4;

export function StartSection() {
  const { t } = useTranslation();
  return (
    <section className={s.section} id="start">
      <Reveal as="h2">
        <Translation
          i18nKey="marketing:activism.start.title"
          components={{ em: <em /> }}
        />
      </Reveal>
      <Reveal as="p" delay={60}>
        {t("marketing:activism.start.p1")}
      </Reveal>
      <Reveal as="p" delay={100}>
        {t("marketing:activism.start.p2")}
      </Reveal>
      <div className={s.actionGrid}>
        {START_STEPS.map((c, i) => (
          <Reveal key={c.num} className={s.actionCard} delay={i * 60}>
            <div className={s.acNum}>{c.num}</div>
            <div className={s.acTitle}>{t(c.titleKey)}</div>
            <div className={s.acBody}>{t(c.bodyKey)}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function LocalSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  return (
    <section className={s.section} id="local">
      <Reveal as="h2">
        <Translation
          i18nKey="marketing:activism.local.title"
          components={{ em: <em /> }}
        />
      </Reveal>
      <Reveal as="p" delay={60}>
        {t("marketing:activism.local.p1")}
      </Reveal>
      <Reveal as="p" delay={100}>
        <Translation
          i18nKey="marketing:activism.local.p2"
          components={{ b: <b /> }}
        />
      </Reveal>
      <Reveal className={s.banner} delay={140}>
        <span className={s.ibDot} />
        <div>
          <div className={s.ibHead}>
            {t("marketing:activism.local.banner.title")}
          </div>
          <p>{t("marketing:activism.local.banner.body")}</p>
        </div>
      </Reveal>
      <Reveal
        as={Link}
        to={routes.openLetter}
        className={`${s.banner} ${s.bannerLink}`}
        delay={180}
      >
        <span className={s.ibDot} />
        <div>
          <div className={s.ibHead}>
            {t("marketing:activism.local.letter.title")}
          </div>
          <p>
            {/* The open letter is mock-only (no backend endpoint), so the
                fabricated signature count is shown only when the platform is
                populated (demo). Live mode gets the count-less variant. */}
            {demoMode ? (
              <Translation
                i18nKey="marketing:activism.local.letter.body"
                components={{ b: <b /> }}
                values={{
                  signatures: fmt.number(OPEN_LETTER_SIGNATURES),
                  target: fmt.number(OPEN_LETTER_TARGET),
                }}
              />
            ) : (
              t("marketing:activism.local.letter.bodyLive")
            )}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

export function SkillsSection() {
  const { t } = useTranslation();
  return (
    <section className={s.section} id="skills">
      <Reveal as="h2">
        <Translation
          i18nKey="marketing:activism.skills.title"
          components={{ em: <em /> }}
        />
      </Reveal>
      <Reveal as="p" delay={60}>
        {t("marketing:activism.skills.p1")}
      </Reveal>
      <div className={s.actionGrid}>
        {SKILLS_CARDS.map((c, i) => (
          <Reveal key={c.titleKey} className={s.actionCard} delay={i * 60}>
            <div className={s.acNum}>
              <FiStar />
            </div>
            <div className={s.acTitle}>{t(c.titleKey)}</div>
            <div className={s.acBody}>{t(c.bodyKey)}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function MobiliseSection() {
  return (
    <section className={s.section} id="mobilise">
      <Reveal as="h2">
        <Translation
          i18nKey="marketing:activism.mobilise.title"
          components={{ em: <em /> }}
        />
      </Reveal>
      <Reveal as="p" delay={60}>
        <Translation
          i18nKey="marketing:activism.mobilise.p1"
          components={{ b: <b /> }}
        />
      </Reveal>
      <Reveal as="p" delay={100}>
        <Translation
          i18nKey="marketing:activism.mobilise.p2"
          components={{ b: <b /> }}
        />
      </Reveal>
      <Reveal as="p" delay={140}>
        <Translation
          i18nKey="marketing:activism.mobilise.p3"
          components={{ b: <b /> }}
        />
      </Reveal>
    </section>
  );
}

export function FeelSection() {
  const { t } = useTranslation();
  return (
    <section className={s.section} id="feel">
      <Reveal as="h2">
        <Translation
          i18nKey="marketing:activism.feel.title"
          components={{ em: <em /> }}
        />
      </Reveal>
      <Reveal as="p" delay={60}>
        {t("marketing:activism.feel.p1")}
      </Reveal>
      <Reveal as="p" delay={100}>
        {t("marketing:activism.feel.p2")}
      </Reveal>
      <Reveal className={`${s.banner} ${s.bannerCoral}`} delay={140}>
        <span className={s.ibDot} />
        <div>
          <div className={s.ibHead}>
            {t("marketing:activism.feel.banner.title")}
          </div>
          <p>{t("marketing:activism.feel.banner.body")}</p>
        </div>
      </Reveal>
    </section>
  );
}

export function OrgsSection() {
  const { t } = useTranslation();
  // Live-aware: real approved partners in live mode, the demo registry when the
  // platform is populated. An empty (unpopulated) platform shows no orgs — the
  // heading + intro stay, since they're platform-authored chrome.
  const { items } = usePartners();
  const orgs = items.slice(0, TEASER_COUNT);
  return (
    <section className={s.section} id="orgs">
      <Reveal as="h2">
        <Translation
          i18nKey="marketing:activism.orgs.title"
          components={{ em: <em /> }}
        />
      </Reveal>
      <Reveal as="p" delay={60}>
        {t("marketing:activism.orgs.p1")}
      </Reveal>
      {orgs.length > 0 && (
        <div className={s.orgList}>
          {/* name/desc are the partner org's own authored profile copy */}
          {orgs.map((org, index) => (
            <Reveal
              key={org.slug}
              as={Link}
              to={`${routes.partner}/${org.slug}`}
              className={s.orgRow}
              delay={index * 55}
            >
              <span
                className={s.orgAv}
                style={{ background: org.bg, color: org.color }}
              >
                {org.av}
              </span>
              <div>
                <div className={s.orgName}>{org.name}</div>
                <div className={s.orgDesc}>{org.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

export function VolunteerSection() {
  const { t } = useTranslation();
  // Live-aware: real open opportunities in live mode, the demo registry when
  // populated. Unpopulated → no cards, but heading + intro + "see all" stay.
  const { items } = useOpportunities();
  const roles = items.slice(0, TEASER_COUNT);
  return (
    <section className={s.section} id="volunteer">
      <Reveal as="h2">
        <Translation
          i18nKey="marketing:activism.volunteer.title"
          components={{ em: <em /> }}
        />
      </Reveal>
      <Reveal as="p" delay={60}>
        {t("marketing:activism.volunteer.p1")}
      </Reveal>
      {roles.length > 0 && (
        <div className={s.actionGrid}>
          {/* role/org/desc are the posting org's own authored copy */}
          {roles.map((role, index) => (
            <Reveal
              key={role.slug}
              as={Link}
              to={`${routes.volunteer}/opportunity/${role.slug}`}
              className={s.actionCard}
              delay={index * 60}
            >
              <div className={s.acHead}>
                <div className={s.acTitle}>{role.role}</div>
                <span className={s.acPill}>{role.time}</span>
              </div>
              <div className={s.acBody}>
                {role.org} · {role.desc}
              </div>
              <span className={s.acLink}>
                {t("marketing:activism.volunteer.expressInterestCta")}
              </span>
            </Reveal>
          ))}
        </div>
      )}
      <Reveal style={{ marginTop: 28 }} delay={60}>
        <Button variant="ghost" to={routes.volunteer}>
          {t("marketing:activism.volunteer.seeAllCta")}
        </Button>
      </Reveal>
    </section>
  );
}
