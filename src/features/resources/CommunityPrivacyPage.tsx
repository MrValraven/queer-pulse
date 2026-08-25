import { FiGlobe, FiUsers, FiShield } from "react-icons/fi";
import type { IconType } from "react-icons";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { TIERS, HOW_TO_KEYS } from "./communityPrivacy.data";
import styles from "./resources.module.css";

const ICONS: Record<string, IconType> = {
  globe: FiGlobe,
  users: FiUsers,
  shield: FiShield,
};

export function CommunityPrivacyPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:communityPrivacy.meta.title");
  const pageDescription = t("resources:communityPrivacy.meta.description");
  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/community-privacy" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:communityPrivacy.hero.eyebrow")}
        eyebrowDotColor="var(--violet)"
        title={
          <Translation
            i18nKey="resources:communityPrivacy.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:communityPrivacy.hero.lead")}
        anchors={[
          {
            label: t("resources:communityPrivacy.hero.anchor.tiers"),
            href: "#tiers",
          },
          {
            label: t("resources:communityPrivacy.hero.anchor.controls"),
            href: "#controls",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="tiers"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:communityPrivacy.tiers.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:communityPrivacy.tiers.lead")}
          </Reveal>
          <div>
            {TIERS.map((tier) => {
              const Icon = ICONS[tier.icon]!;
              return (
                <Reveal key={tier.titleKey} className={styles.featureRow}>
                  <span className={styles.featureIcon}>
                    <Icon aria-hidden />
                  </span>
                  <div>
                    <div className={styles.cardName} style={{ fontSize: 19 }}>
                      {t(tier.titleKey)}
                    </div>
                    <div className={styles.cardSpec} style={{ marginTop: 4 }}>
                      {t(tier.bodyKey)}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="controls"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:communityPrivacy.controls.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={styles.checklist}>
            {HOW_TO_KEYS.map((key) => (
              <Reveal
                key={key}
                className={styles.checkItem}
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div className={styles.cardSpec} style={{ flex: "none" }}>
                  {t(key)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:communityPrivacy.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:communityPrivacy.outro.sub")}
      >
        <Button to={routes.settings} variant="primary" size="lg">
          {t("resources:communityPrivacy.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
