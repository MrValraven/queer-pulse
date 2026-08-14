import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COMMUNITY_PILLARS, COMMUNITY_STEPS } from "./communitiesAbout.data";
import styles from "./CommunitiesAboutPage.module.css";

/**
 * "What a community is here" — the foundational idea, told as three feature
 * cards. Each pairs a tinted icon chip with a title and a short body so the
 * three pillars read as one set without any two looking identical in weight.
 */
export function WhatSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <Reveal as="h2" className={styles.sectionTitle}>
        {t("marketing:communitiesAbout.what.title")}
      </Reveal>
      <ul className={styles.pillars}>
        {COMMUNITY_PILLARS.map(({ icon: Icon, titleKey, bodyKey }, index) => (
          <Reveal
            key={titleKey}
            as="li"
            className={styles.pillar}
            delay={Math.min(index, 8) * 60}
          >
            <span className={styles.pillarChip} aria-hidden>
              <Icon />
            </span>
            <h3 className={styles.pillarTitle}>{t(titleKey)}</h3>
            <p className={styles.pillarBody}>{t(bodyKey)}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/**
 * "How it works" — a sequence, so it is drawn as connected, numbered steps
 * (Find → Welcome → Belong) rather than three identical cards. The numeral is
 * decorative; the ordered list carries the real semantics for assistive tech.
 */
export function HowSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <Reveal as="h2" className={styles.sectionTitle}>
        {t("marketing:communitiesAbout.how.title")}
      </Reveal>
      <ol className={styles.steps}>
        {COMMUNITY_STEPS.map(({ icon: Icon, titleKey, bodyKey }, index) => (
          <Reveal
            key={titleKey}
            as="li"
            className={styles.step}
            delay={Math.min(index, 8) * 80}
          >
            <span className={styles.stepMark} aria-hidden>
              {index + 1}
            </span>
            <div className={styles.stepText}>
              <h3 className={styles.stepTitle}>
                <Icon className={styles.stepIcon} aria-hidden />
                {t(titleKey)}
              </h3>
              <p className={styles.stepBody}>{t(bodyKey)}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/**
 * "Why communities matter" — the emotional anchor, promoted from a plain
 * paragraph to a large centered serif pull-quote with the house coral `<em>`
 * emphasis, so the page lands on a feeling rather than another list.
 */
export function WhySection() {
  const { t } = useTranslation();
  return (
    <section className={styles.whySection}>
      <Reveal as="p" className={styles.whyEyebrow}>
        {t("marketing:communitiesAbout.why.title")}
      </Reveal>
      <Reveal as="blockquote" className={styles.whyQuote} delay={80}>
        <Translation
          i18nKey="marketing:communitiesAbout.why.body"
          components={{ em: <em /> }}
        />
      </Reveal>
    </section>
  );
}
