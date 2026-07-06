import { useMemo, useState } from "react";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  Outro,
  Reveal,
  SubpageIndex,
} from "../../shared/components/ui";
import { useScrollReveal } from "../../shared/hooks/useScrollReveal";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { useSimulatedLoad } from "../../shared/hooks";
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
            Grants &amp; Funding
          </Reveal>
          <Reveal as="h1" delay={60}>
            Money for <em>queer work.</em>
          </Reveal>
          <Reveal as="p" className={styles.heroSub} delay={120}>
            Community-curated guide to grants, fellowships, and funding for
            LGBTQ+ individuals and organisations — in Portugal and across
            Europe. Maintained by members who've successfully applied.
          </Reveal>
          <div className={styles.stats}>
            <HeroStat target={38} label="opportunities tracked" />
            <HeroStat target={9} label="currently open" />
            <div className={styles.stat}>
              <b>Community</b>
              <span>maintained</span>
            </div>
          </div>
        </div>
      </div>

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
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <GrantsResults
                loading={loading}
                filtered={filtered}
                onClearFilter={() => setFilter("all")}
              />
            </div>
            <GrantsSidebar />
          </div>
        </div>
      </div>

      <GrantsGuide />

      <Outro
        title={
          <>
            Your project <em>deserves support.</em>
          </>
        }
        sub="Found something that fits? Apply with confidence — and if you land it, pay it forward by adding the opportunity for the next member."
      >
        <Button to={routes.grants} size="lg">
          See open grants
        </Button>
      </Outro>

      <SubpageIndex
        title="Also in grants"
        items={[
          {
            label: "Micro Grants",
            to: routes.microGrants,
            blurb: "Small, fast community grants — apply in minutes.",
          },
        ]}
      />
    </PageShell>
  );
}
