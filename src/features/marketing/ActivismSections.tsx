import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  START_STEPS,
  SKILLS_CARDS,
  ORGS,
  VOLUNTEER_ROLES,
  OPEN_LETTER_SIGNATURES,
  OPEN_LETTER_TARGET,
} from "./activism.data";
import s from "./ActivismPage.module.css";

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
            <Translation
              i18nKey="marketing:activism.local.letter.body"
              components={{ b: <b /> }}
              values={{
                signatures: fmt.number(OPEN_LETTER_SIGNATURES),
                target: fmt.number(OPEN_LETTER_TARGET),
              }}
            />
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
      <div className={s.orgList}>
        {/* name/desc are partner-org profile copy — content, left in English */}
        {ORGS.map((o, i) => (
          <Reveal
            key={o.name}
            as={Link}
            to={routes.partners}
            className={s.orgRow}
            delay={i * 55}
          >
            <span
              className={s.orgAv}
              style={{ background: o.bg, color: o.color }}
            >
              {o.av}
            </span>
            <div>
              <div className={s.orgName}>{o.name}</div>
              <div className={s.orgDesc}>{o.desc}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function VolunteerSection() {
  const { t } = useTranslation();
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
      <div className={s.actionGrid}>
        {/* title/pill/body are volunteer-opportunity postings — content, left in English */}
        {VOLUNTEER_ROLES.map((v, i) => (
          <Reveal
            key={v.title}
            as={Link}
            to={routes.volunteer}
            className={s.actionCard}
            delay={i * 60}
          >
            <div className={s.acHead}>
              <div className={s.acTitle}>{v.title}</div>
              <span className={s.acPill}>{v.pill}</span>
            </div>
            <div className={s.acBody}>{v.body}</div>
            <span className={s.acLink}>
              {t("marketing:activism.volunteer.expressInterestCta")}
            </span>
          </Reveal>
        ))}
      </div>
      <Reveal style={{ marginTop: 28 }} delay={60}>
        <Button variant="ghost" to={routes.volunteer}>
          {t("marketing:activism.volunteer.seeAllCta")}
        </Button>
      </Reveal>
    </section>
  );
}
