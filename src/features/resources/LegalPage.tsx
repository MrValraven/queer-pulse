import { type ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { CrisisStrip } from "./CrisisStrip";
import { SuggestEditTrigger } from "./SuggestEditTrigger";
import { LegalLawyersSection } from "./LegalLawyersSection";
import { GuideRatingWidget } from "./GuideRatingWidget";
import { HEALTHCARE, HOUSING, WORKPLACE, type Right } from "./legal.data";
import styles from "./resources.module.css";

const badgeClass = {
  protected: styles.badgeProtected,
  know: styles.badgeKnow,
  practical: styles.badgeKnow,
};

function RightsSection({
  id,
  title,
  leadKey,
  cream,
  rights,
}: {
  id: string;
  title: ReactNode;
  leadKey: string;
  cream?: boolean;
  rights: Right[];
}) {
  const { t } = useTranslation();
  const badgeLabel: Record<Right["badge"], string> = {
    protected: t("resources:legal.badge.protected"),
    know: t("resources:legal.badge.know"),
    practical: t("resources:legal.badge.practical"),
  };
  return (
    <section
      className={`${styles.section} ${cream ? styles.sectionCream : styles.sectionPaper}`}
      id={id}
    >
      <div className="wrap">
        <Reveal as="h2">{title}</Reveal>
        <Reveal as="p" className={styles.leadP}>
          {t(leadKey)}
        </Reveal>
        <div className={styles.grid}>
          {rights.map((right, index) => (
            <Reveal
              key={right.titleKey}
              className={styles.rightCard}
              delay={index * 55}
            >
              <span className={`${styles.badge} ${badgeClass[right.badge]}`}>
                {badgeLabel[right.badge]}
              </span>
              <div className={styles.rightTitle}>{t(right.titleKey)}</div>
              <div className={styles.rightBody}>{t(right.bodyKey)}</div>
              <Link to={right.to} className={styles.rightLink}>
                {t(right.linkKey)} <FiArrowRight aria-hidden />
              </Link>
              <GuideRatingWidget contentKey={right.contentKey} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LegalPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:legal.meta.title");
  const pageDescription = t("resources:legal.meta.description");
  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.legal },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:legal.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:legal.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:legal.hero.lead")}
        anchors={[
          {
            label: t("resources:legal.hero.anchor.workplace"),
            href: "#workplace",
          },
          { label: t("resources:legal.hero.anchor.housing"), href: "#housing" },
          {
            label: t("resources:legal.hero.anchor.healthcare"),
            href: "#healthcare",
          },
          { label: t("resources:legal.hero.anchor.lawyers"), href: "#lawyers" },
        ]}
        backLink={{
          to: routes.safety,
          label: t("resources:legal.hero.backLink"),
          tone: "dark",
        }}
      />

      <CrisisStrip />

      <RightsSection
        id="workplace"
        title={
          <Translation
            i18nKey="resources:legal.workplace.title"
            components={{ em: <em /> }}
          />
        }
        leadKey="resources:legal.workplace.lead"
        rights={WORKPLACE}
      />
      <RightsSection
        id="housing"
        cream
        title={
          <Translation
            i18nKey="resources:legal.housing.title"
            components={{ em: <em /> }}
          />
        }
        leadKey="resources:legal.housing.lead"
        rights={HOUSING}
      />
      <RightsSection
        id="healthcare"
        title={
          <Translation
            i18nKey="resources:legal.healthcare.title"
            components={{ em: <em /> }}
          />
        }
        leadKey="resources:legal.healthcare.lead"
        rights={HEALTHCARE}
      />

      <LegalLawyersSection />

      <SuggestEditTrigger subject={pageTitle} context="legal" />

      <Outro
        title={
          <Translation
            i18nKey="resources:legal.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:legal.outro.sub")}
      >
        <Button to={requestInvitePath("legal")} variant="primary" size="lg">
          {t("resources:legal.outro.requestInviteCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
