import { useState, type ReactNode } from "react";
import { FiArrowRight, FiBriefcase } from "react-icons/fi";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  Outro,
  Reveal,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useConnect } from "../../app/providers/useConnect";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import { CrisisStrip } from "./CrisisStrip";
import { SuggestEditTrigger } from "./SuggestEditTrigger";
import { CardGrid, ResourceCard, ResourceCardSkeleton } from "./ResourceCard";
import { useResourceListings } from "./api/useResourceListings";
import { contactHrefForListing } from "./api/resources.adapters";
import { SuggestResourceModal } from "./SuggestResourceModal";
import { GuideRatingWidget } from "./GuideRatingWidget";
import styles from "./resources.module.css";

interface Right {
  badge: "protected" | "know" | "practical";
  /** CNT-18 rating key — the i18n dot-path prefix minus `.title` (e.g.
   *  `legal.workplace.dismissal`), so `GuideRatingWidget` addresses the same
   *  guide the titleKey/bodyKey render. */
  contentKey: string;
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
    contentKey: "legal.workplace.dismissal",
    titleKey: "resources:legal.workplace.dismissal.title",
    bodyKey: "resources:legal.workplace.dismissal.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "protected",
    contentKey: "legal.workplace.harassment",
    titleKey: "resources:legal.workplace.harassment.title",
    bodyKey: "resources:legal.workplace.harassment.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "know",
    contentKey: "legal.workplace.pronouns",
    titleKey: "resources:legal.workplace.pronouns.title",
    bodyKey: "resources:legal.workplace.pronouns.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "practical",
    contentKey: "legal.workplace.complaint",
    titleKey: "resources:legal.workplace.complaint.title",
    bodyKey: "resources:legal.workplace.complaint.body",
    linkKey: "resources:legal.link.getTemplate",
    to: routes.resources,
  },
];

const HOUSING: Right[] = [
  {
    badge: "protected",
    contentKey: "legal.housing.rental",
    titleKey: "resources:legal.housing.rental.title",
    bodyKey: "resources:legal.housing.rental.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "practical",
    contentKey: "legal.housing.samesex",
    titleKey: "resources:legal.housing.samesex.title",
    bodyKey: "resources:legal.housing.samesex.body",
    linkKey: "resources:legal.link.readGuide",
    to: routes.resources,
  },
  {
    badge: "practical",
    contentKey: "legal.housing.eviction",
    titleKey: "resources:legal.housing.eviction.title",
    bodyKey: "resources:legal.housing.eviction.body",
    linkKey: "resources:legal.link.findSupport",
    to: routes.changemakers,
  },
];

const HEALTHCARE: Right[] = [
  {
    badge: "protected",
    contentKey: "legal.healthcare.sns",
    titleKey: "resources:legal.healthcare.sns.title",
    bodyKey: "resources:legal.healthcare.sns.body",
    linkKey: "resources:legal.link.transHubGuide",
    to: routes.transHub,
  },
  {
    badge: "protected",
    contentKey: "legal.healthcare.refusal",
    titleKey: "resources:legal.healthcare.refusal.title",
    bodyKey: "resources:legal.healthcare.refusal.body",
    linkKey: "resources:legal.link.reportRefusal",
    to: routes.report,
  },
  {
    badge: "practical",
    contentKey: "legal.healthcare.prep",
    titleKey: "resources:legal.healthcare.prep.title",
    bodyKey: "resources:legal.healthcare.prep.body",
    linkKey: "resources:legal.link.prepGuide",
    to: routes.wellbeing,
  },
];

/**
 * Mock lawyer directory — demo-only. There is NO lawyer-directory backend yet,
 * so live mode must not render these fabricated, "consultation-bookable"
 * profiles; it shows an honest coming-soon instead (see the `#lawyers` section).
 * Names/spec/tags/loc are content, left in English per the scope rule.
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
                {t(right.linkKey)}{" "}
                <FiArrowRight aria-hidden />
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
  const { demoMode } = useDemoMode();
  const { openConnect } = useConnect();
  const loading = useSimulatedLoad();
  const { listings, isLoading: listingsLoading } = useResourceListings(
    "legal_aid",
  );
  const [suggestOpen, setSuggestOpen] = useState(false);
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
          {!demoMode ? (
            listingsLoading ? (
              <CardGrid busy>
                {Array.from({ length: 3 }).map((_, index) => (
                  <ResourceCardSkeleton key={index} />
                ))}
              </CardGrid>
            ) : listings.length > 0 ? (
              <>
                <CardGrid>
                  {listings.map((listing, index) => (
                    <ResourceCard
                      key={listing.id}
                      name={listing.title}
                      spec={listing.description}
                      tags={listing.region ? [listing.region] : []}
                      loc={listing.region ?? ""}
                      nameSize={19}
                      ctaLabel={t("resources:directory.contactCta")}
                      onCta={() => {
                        const href = contactHrefForListing(listing);
                        if (href) {
                          window.open(
                            href,
                            listing.website ? "_blank" : "_self",
                          );
                        }
                      }}
                      animation="fade"
                      delay={Math.min(index, 8) * 60}
                    />
                  ))}
                </CardGrid>
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <Button variant="ghost" onClick={() => setSuggestOpen(true)}>
                    {t("resources:suggest.cta")}
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<FiBriefcase />}
                title={t("resources:legal.lawyers.live.title")}
                description={t("resources:legal.lawyers.live.body")}
                action={{
                  label: t("resources:suggest.cta"),
                  onClick: () => setSuggestOpen(true),
                }}
              />
            )
          ) : (
          <CardGrid busy={loading}>
            {loading
              ? Array.from({ length: LAWYERS.length }).map((_, index) => (
                  <ResourceCardSkeleton key={index} />
                ))
              : LAWYERS.map((lawyer, index) => (
                  <ResourceCard
                    key={lawyer.name}
                    name={lawyer.name}
                    spec={lawyer.spec}
                    tags={lawyer.tags}
                    loc={lawyer.loc}
                    nameSize={19}
                    ctaLabel={t("resources:legal.lawyers.requestConsultationCta")}
                    onCta={() => openConnect()}
                    animation="fade"
                    delay={Math.min(index, 8) * 60}
                  />
                ))}
          </CardGrid>
          )}
          {suggestOpen && (
            <SuggestResourceModal
              category="legal_aid"
              onClose={() => setSuggestOpen(false)}
            />
          )}
        </div>
      </section>

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
