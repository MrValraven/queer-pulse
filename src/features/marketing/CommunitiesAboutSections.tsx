import { Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COMMUNITY_PILLARS,
  COMMUNITY_STEPS,
  type CommunityBlock,
} from "./communitiesAbout.data";
import styles from "./CommunitiesAboutPage.module.css";

function BlockGrid({ items }: { items: CommunityBlock[] }) {
  const { t } = useTranslation();
  return (
    <ul className={styles.grid}>
      {items.map(({ icon: Icon, titleKey, bodyKey }, index) => (
        <Reveal
          key={titleKey}
          as="li"
          className={styles.card}
          delay={Math.min(index, 8) * 60}
        >
          <Icon className={styles.icon} aria-hidden />
          <h3 className={styles.cardTitle}>{t(titleKey)}</h3>
          <p className={styles.cardBody}>{t(bodyKey)}</p>
        </Reveal>
      ))}
    </ul>
  );
}

export function WhatSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <Reveal as="h2" className={styles.sectionTitle}>
        {t("marketing:communitiesAbout.what.title")}
      </Reveal>
      <BlockGrid items={COMMUNITY_PILLARS} />
    </section>
  );
}

export function HowSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <Reveal as="h2" className={styles.sectionTitle}>
        {t("marketing:communitiesAbout.how.title")}
      </Reveal>
      <BlockGrid items={COMMUNITY_STEPS} />
    </section>
  );
}

export function WhySection() {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <Reveal as="h2" className={styles.sectionTitle}>
        {t("marketing:communitiesAbout.why.title")}
      </Reveal>
      <Reveal as="p" className={styles.lede} delay={60}>
        {t("marketing:communitiesAbout.why.body")}
      </Reveal>
    </section>
  );
}
