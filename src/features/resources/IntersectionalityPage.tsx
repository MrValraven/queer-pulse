import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  CLASS_INFO,
  CLASS_VOICE,
  COMMUNITY_INFO,
  FAITH_INFO,
  FAITH_VOICES,
  NAV,
  RACE_INFO,
  RACE_VOICES,
  type Voice,
} from "./intersectionality.data";
import { FadeIn, Reveal } from "../../shared/components/ui";
import { ResourceHero } from "./ResourceHero";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import {
  InfoCards,
  VoiceCard,
  VoiceCardSkeleton,
} from "./IntersectionalityCards";
import { IntersectionalityFooter } from "./IntersectionalityFooter";
import styles from "./IntersectionalityPage.module.css";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 110,
    behavior: "smooth",
  });
}

interface VoiceGridProps {
  voices: Voice[];
  isLoading: boolean;
  className?: string;
}

/**
 * The member quotes are invented demo content (PRD-451), so this grid only
 * renders in demo mode. Live mode shows the section's info cards alone.
 */
function VoiceGrid({ voices, isLoading, className }: VoiceGridProps) {
  const { demoMode } = useDemoMode();
  if (!demoMode) return null;
  return (
    <div className={[styles.voiceGrid, className].filter(Boolean).join(" ")}>
      {voices.map((voice, index) =>
        isLoading ? (
          <VoiceCardSkeleton key={voice.name} />
        ) : (
          <FadeIn key={voice.name} delay={Math.min(index, 8) * 60}>
            <VoiceCard v={voice} />
          </FadeIn>
        ),
      )}
    </div>
  );
}

export function IntersectionalityPage() {
  const loading = useSimulatedLoad();
  const { t } = useTranslation();
  const pageTitle = t("resources:intersectionality.meta.title");
  const pageDescription = t("resources:intersectionality.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/intersectionality" },
        ])}
      />
      <ResourceHero
        backLink={{
          to: routes.resources,
          label: t("resources:intersectionality.hero.backLabel"),
          tone: "dark",
        }}
        eyebrowVariant="label"
        eyebrowColor="var(--jade)"
        eyebrow={t("resources:intersectionality.hero.cat")}
        titleWeight="light"
        title={
          <Translation
            i18nKey="resources:intersectionality.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:intersectionality.hero.sub")}
        extras={
          <div className={styles.opening}>
            <div className={styles.openingBar} />
            <p className={styles.openingText}>
              <strong>{t("resources:intersectionality.opening.strong")}</strong>{" "}
              {t("resources:intersectionality.opening.text")}
            </p>
          </div>
        }
      />

      <div className={styles.ixNav}>
        <div className={styles.ixNavInner}>
          {NAV.map((navItem) => (
            <button
              key={navItem.id}
              type="button"
              className={styles.ixNavBtn}
              onClick={() => scrollToSection(navItem.id)}
            >
              {t(navItem.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <Reveal as="section" className={styles.sec} id="race">
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="resources:intersectionality.race.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("resources:intersectionality.race.intro")}</p>
          </div>
          <VoiceGrid voices={RACE_VOICES} isLoading={loading} />
          <InfoCards cards={RACE_INFO} loading={loading} animate={!loading} />
        </div>
      </Reveal>

      <Reveal as="section" className={`${styles.sec} ${styles.alt}`} id="faith">
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="resources:intersectionality.faith.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("resources:intersectionality.faith.intro")}</p>
          </div>
          <VoiceGrid voices={FAITH_VOICES} isLoading={loading} />
          <InfoCards cards={FAITH_INFO} loading={loading} animate={!loading} />
        </div>
      </Reveal>

      <Reveal as="section" className={styles.sec} id="class">
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="resources:intersectionality.class.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("resources:intersectionality.class.intro")}</p>
          </div>
          <div className={styles.note}>
            <div className={styles.noteBar} />
            <div className={styles.noteText}>
              <strong>
                {t("resources:intersectionality.class.note.strong")}
              </strong>{" "}
              {t("resources:intersectionality.class.note.text")}
            </div>
          </div>
          <InfoCards cards={CLASS_INFO} loading={loading} animate={!loading} />
          <VoiceGrid
            voices={[CLASS_VOICE]}
            isLoading={loading}
            className={styles.voiceGridTop}
          />
        </div>
      </Reveal>

      <Reveal
        as="section"
        className={`${styles.sec} ${styles.alt}`}
        id="community"
      >
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="resources:intersectionality.community.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("resources:intersectionality.community.intro")}</p>
          </div>
          <InfoCards
            cards={COMMUNITY_INFO}
            loading={loading}
            animate={!loading}
          />
        </div>
      </Reveal>

      <IntersectionalityFooter />
    </PageShell>
  );
}
