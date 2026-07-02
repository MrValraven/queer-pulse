import { useRef, useState } from "react";
import { FiCompass } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn, Outro } from "../../shared/components/ui";
import { INVITE, SITUATIONS, TABS, type TabId } from "./family.data";
import { FamilyTabContent } from "./FamilyTabContent";
import { FamilyTalkSection } from "./FamilyTalkSection";
import { ParentNetwork } from "./ParentNetwork";
import styles from "./FamilyPage.module.css";

export function FamilyPage() {
  const [active, setActive] = useState<TabId>("adoption");
  const [selectedSit, setSelectedSit] = useState<number | null>(null);
  // Low-pressure entry: this is a sensitive topic, so picking a situation is
  // always optional. "Just exploring" lets people read everything without
  // declaring anything about themselves.
  const [exploring, setExploring] = useState(false);
  const tabNavRef = useRef<HTMLDivElement>(null);

  const scrollToTabs = () => {
    const el = tabNavRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const selectSituation = (index: number, tab: TabId) => {
    setSelectedSit(index);
    setExploring(false);
    setActive(tab);
    scrollToTabs();
  };

  const browseFreely = () => {
    setExploring(true);
    setSelectedSit(null);
    scrollToTabs();
  };

  const tab = TABS.find((t) => t.id === active) ?? TABS[0]!;

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Family Building · Portugal</div>
          <h1>
            Building your family, <em>your way.</em>
          </h1>
          <p className={styles.heroSub}>
            Practical, honest information about adoption, assisted reproduction,
            co-parenting, and legal parenthood in Portugal — from the community,
            for the community.
          </p>
          <div className={styles.legalNote}>
            <span className={styles.legalDot} />
            Community information, not legal advice. Laws change — always verify
            with a specialist.
          </div>
        </div>
      </div>

      <section className={styles.sitSection}>
        <div className="wrap">
          <div className={styles.sitLabelRow}>
            <h2>
              Where are you <em>starting from?</em>
            </h2>
            <p>
              Optional — pick a situation to highlight what's most relevant, or
              just browse everything below. No need to decide anything to read.
            </p>
          </div>
          <div className={styles.sitGrid}>
            {SITUATIONS.map((s, i) => (
              <button
                key={s.name}
                type="button"
                className={[styles.sitCard, selectedSit === i && styles.sitSel]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectSituation(i, s.tab)}
              >
                <div className={styles.sitName}>{s.name}</div>
                <div className={styles.sitDesc}>{s.desc}</div>
                <div className={styles.sitTo}>{s.to}</div>
              </button>
            ))}
          </div>
          <div className={styles.browseRow}>
            <button
              type="button"
              className={[styles.browseBtn, exploring && styles.browseBtnActive]
                .filter(Boolean)
                .join(" ")}
              onClick={browseFreely}
            >
              <FiCompass aria-hidden />
              I'm just exploring — show me everything
            </button>
          </div>
        </div>
      </section>

      <div className={styles.tabNav} ref={tabNavRef}>
        <div className={styles.tabNavInner}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tabBtn, active === t.id && styles.tabBtnActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <FadeIn key={active}>
        <FamilyTabContent tab={tab} />
      </FadeIn>

      <FamilyTalkSection />

      <ParentNetwork />

      <Outro
        title={
          <>
            Your family is <em>real.</em>
          </>
        }
        sub="Whatever route you take, whatever shape it takes. The community is here."
      >
        <Button to={INVITE} variant="primary" size="lg">
          Join QueerPulse
        </Button>
      </Outro>
    </PageShell>
  );
}
