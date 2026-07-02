import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  ClubSection,
  CommissionsSection,
  ShowcaseSection,
  RadioIntro,
} from "./CultureSections";
import { CultureRadioPanel } from "./CultureRadioPanel";
import { SubmitWorkModal } from "./CultureFormModals";
import { TABS, type TabKey } from "./culture.data";
import styles from "./CulturePage.module.css";

export function CulturePage() {
  const [tab, setTab] = useState<TabKey>("club");
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Lisbon scene & radio</div>
          <h1 className={styles.heroH}>
            Lisbon's queer <em>scene</em>.
          </h1>
          <p className={styles.lead}>
            The clubs, commissions, showcases, and radio that make up the city's
            queer cultural life — community-curated, ever-changing.
          </p>
          <div className={styles.tabs} role="tablist">
            {TABS.map((t) => (
              <button
                type="button"
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className="wrap">
          <FadeIn key={tab}>
            {tab === "club" && <ClubSection />}
            {tab === "commission" && <CommissionsSection />}
            {tab === "showcase" && <ShowcaseSection />}
            {tab === "radio" && <RadioIntro />}
          </FadeIn>
        </div>
      </div>

      {tab === "radio" && <CultureRadioPanel />}

      <Outro
        title={
          <>
            Make something <em>with us.</em>
          </>
        }
        sub="Culture isn't what happens at events. It's what we build between them — quietly, consistently, together."
      >
        <Button size="lg" onClick={() => setSubmitOpen(true)}>
          Submit your work
        </Button>
        <Button size="lg" variant="ghost-dark" to={routes.communities}>
          Explore communities
        </Button>
      </Outro>

      {submitOpen && <SubmitWorkModal onClose={() => setSubmitOpen(false)} />}
    </PageShell>
  );
}
