import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  Outro,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { useConnect } from "../../app/providers/ConnectProvider";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import styles from "./resources.module.css";

interface Right {
  badge: "protected" | "know" | "practical";
  titleKey: string;
  bodyKey: string;
  linkKey: string;
  to: string;
}

/**
 * i18n Pattern A — platform-authored legal guidance chrome, resolved via
 * `t()` in RightsSection. Real-world proper nouns inside the body strings
 * (ACT, SNS, ILGA Portugal) stay untranslated as part of the catalog value
 * itself. This is legal information — flagged for native review.
 */
const WORKPLACE: Right[] = [
  {
    badge: "protected",
    titleKey: "resources:legal.workplace.dismissal.title",
    bodyKey: "resources:legal.workplace.dismissal.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.library,
  },
  {
    badge: "protected",
    titleKey: "resources:legal.workplace.harassment.title",
    bodyKey: "resources:legal.workplace.harassment.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.library,
  },
  {
    badge: "know",
    titleKey: "resources:legal.workplace.pronouns.title",
    bodyKey: "resources:legal.workplace.pronouns.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.library,
  },
  {
    badge: "practical",
    titleKey: "resources:legal.workplace.complaint.title",
    bodyKey: "resources:legal.workplace.complaint.body",
    linkKey: "resources:legal.link.getTemplate",
    to: routes.library,
  },
];

const HOUSING: Right[] = [
  {
    badge: "protected",
    titleKey: "resources:legal.housing.rental.title",
    bodyKey: "resources:legal.housing.rental.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.library,
  },
  {
    badge: "practical",
    titleKey: "resources:legal.housing.samesex.title",
    bodyKey: "resources:legal.housing.samesex.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.library,
  },
  {
    badge: "practical",
    titleKey: "resources:legal.housing.eviction.title",
    bodyKey: "resources:legal.housing.eviction.body",
    linkKey: "resources:legal.link.findSupport",
    to: routes.changemakers,
  },
];

const HEALTHCARE: Right[] = [
  {
    badge: "protected",
    titleKey: "resources:legal.healthcare.sns.title",
    bodyKey: "resources:legal.healthcare.sns.body",
    linkKey: "resources:legal.link.transHubGuide",
    to: routes.transHub,
  },
  {
    badge: "protected",
    titleKey: "resources:legal.healthcare.refusal.title",
    bodyKey: "resources:legal.healthcare.refusal.body",
    linkKey: "resources:legal.link.reportRefusal",
    to: routes.report,
  },
  {
    badge: "practical",
    titleKey: "resources:legal.healthcare.prep.title",
    bodyKey: "resources:legal.healthcare.prep.body",
    linkKey: "resources:legal.link.prepGuide",
    to: routes.wellbeing,
  },
];

/**
 * Mock lawyer directory. In live mode this is a fetched, vetted directory —
 * name/spec/tags/loc are content, left in English per the scope rule.
 */
const LAWYERS = [
  {
    name: "Sofia Mendonça",
    spec: "Labour law specialist · discrimination, constructive dismissal, workplace harassment.",
    tags: ["Workplace", "PT · EN", "No-win no-fee available"],
    loc: "Chiado",
  },
  {
    name: "Ricardo Faria",
    spec: "Civil & tenancy law · rental discrimination, same-sex property rights, housing disputes.",
    tags: ["Housing", "PT"],
    loc: "Baixa · Online",
  },
  {
    name: "Ana Beatriz Leal",
    spec: "Healthcare & administrative law · trans legal name change, SNS complaints, discrimination in healthcare.",
    tags: ["Trans rights", "Healthcare", "PT · FR"],
    loc: "Avenidas Novas",
  },
];

const badgeClass = {
  protected: styles.badgeProtected,
  know: styles.badgeKnow,
  practical: styles.badgeKnow,
};

function LawyerSkeleton() {
  // Mirrors the lawyer card: name, spec, two tags, footer row (loc + cta).
  return (
    <div className={styles.card}>
      <SkeletonLine width="55%" height={19} />
      <SkeletonLine width="100%" height={13} style={{ marginTop: 8 }} />
      <SkeletonLine width="85%" height={13} style={{ marginTop: 6 }} />
      <div className={styles.tags}>
        <SkeletonLine width={70} height={20} />
        <SkeletonLine width={54} height={20} />
      </div>
      <div className={styles.cardFoot}>
        <SkeletonLine width="30%" height={13} />
        <SkeletonLine width="40%" height={13} />
      </div>
    </div>
  );
}

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
                {t(right.linkKey)}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LegalPage() {
  const { t } = useTranslation();
  const { openConnect } = useConnect();
  const loading = useSimulatedLoad();
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

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="lawyers"
        style={{ borderBottom: "none" }}
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:legal.lawyers.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:legal.lawyers.lead")}
          </Reveal>
          <div className={styles.grid} aria-busy={loading}>
            {loading
              ? Array.from({ length: LAWYERS.length }).map((_, i) => (
                  <LawyerSkeleton key={i} />
                ))
              : LAWYERS.map((lawyer, index) => (
                  <FadeIn
                    key={lawyer.name}
                    className={styles.card}
                    delay={Math.min(index, 8) * 60}
                  >
                    <div className={styles.cardName} style={{ fontSize: 19 }}>
                      {lawyer.name}
                    </div>
                    <div className={styles.cardSpec}>{lawyer.spec}</div>
                    <div className={styles.tags}>
                      {lawyer.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className={styles.cardFoot}>
                      <span className={styles.cardLoc}>{lawyer.loc}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        className={styles.cardCta}
                        onClick={() => openConnect()}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openConnect();
                          }
                        }}
                      >
                        {t("resources:legal.lawyers.requestConsultationCta")}
                      </span>
                    </div>
                  </FadeIn>
                ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:legal.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:legal.outro.sub")}
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          {t("resources:legal.outro.requestInviteCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
