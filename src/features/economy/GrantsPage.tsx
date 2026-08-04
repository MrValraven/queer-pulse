import { useMemo, useState } from "react";
import { FiDollarSign } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FeatureHelp,
  Outro,
  Reveal,
  SubpageIndex,
} from "../../shared/components/ui";
import { useScrollReveal } from "../../shared/hooks/useScrollReveal";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GRANTS, FILTERS } from "./grants.data";
import { GrantsResults, GrantsGuide } from "./GrantsSections";
import { GrantsSidebar } from "./GrantsSidebar";
import styles from "./GrantsPage.module.css";

function HeroStat({ target, label }: { target: number; label: string }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const value = useCountUp(target, { active: isVisible });
  return (
    <div className={styles.stat} ref={ref}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export function GrantsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(
    () =>
      filter === "all" ? GRANTS : GRANTS.filter((g) => g.cats.includes(filter)),
    [filter],
  );

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.eye}>
            {t("economy:grants.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="economy:grants.hero.title"
              components={{ em: <em /> }}
            />{" "}
            <FeatureHelp id="economy.grants" />
          </Reveal>
          <Reveal as="p" className={styles.heroSub} delay={120}>
            {t("economy:grants.hero.lead")}
          </Reveal>
          {/* The tracked/open counts are demo-only fiction — live mode has no
              grant database to count yet, so the fabricated metrics are hidden. */}
          {demoMode && (
            <div className={styles.stats}>
              <HeroStat
                target={38}
                label={t("economy:grants.hero.stat.tracked")}
              />
              <HeroStat target={9} label={t("economy:grants.hero.stat.open")} />
              <div className={styles.stat}>
                <b>{t("economy:grants.hero.stat.communityLabel")}</b>
                <span>{t("economy:grants.hero.stat.maintained")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {demoMode && (
        <div className={styles.bar}>
          <div className="wrap">
            <div className={styles.barInner}>
              {FILTERS.map((f) => (
                <button
                  type="button"
                  key={f.value}
                  className={[
                    styles.chip,
                    filter === f.value && styles.chipActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setFilter(f.value)}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              {/* The tracked grants are demo-only fiction — live mode has no
                  backend feed yet, so it shows an honest coming-soon state. */}
              {demoMode ? (
                <GrantsResults
                  loading={loading}
                  filtered={filtered}
                  onClearFilter={() => setFilter("all")}
                />
              ) : (
                <EmptyState
                  icon={<FiDollarSign />}
                  title={t("economy:grants.emptyLive.title")}
                  description={t("economy:grants.emptyLive.description")}
                />
              )}
            </div>
            <GrantsSidebar />
          </div>
        </div>
      </div>

      <GrantsGuide />

      <Outro
        title={
          <Translation
            i18nKey="economy:grants.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:grants.outro.sub")}
      >
        <Button to={routes.grants} size="lg">
          {t("economy:grants.outro.cta")}
        </Button>
      </Outro>

      <SubpageIndex
        title={t("economy:grants.subpages.title")}
        items={[
          {
            label: t("economy:grants.subpages.microGrants.label"),
            to: routes.microGrants,
            blurb: t("economy:grants.subpages.microGrants.blurb"),
          },
        ]}
      />
    </PageShell>
  );
}
