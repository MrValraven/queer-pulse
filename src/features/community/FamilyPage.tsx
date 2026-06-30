import { useRef, useState } from "react";
import { FiCompass } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn, Outro } from "../../shared/components/ui";
import {
  FORUM,
  INVITE,
  LEGAL,
  MENTORSHIP,
  SITUATIONS,
  TABS,
  TALK_CARDS,
  type TabId,
} from "./family.data";
import { FamilyTabContent } from "./FamilyTabContent";
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

      <section className={styles.talk}>
        <div className="wrap">
          <div className={styles.talkInner}>
            <div className={styles.talkLeft}>
              <h2>
                Talk to someone who's <em>been there.</em>
              </h2>
              <p>
                The Queer Parent Network connects people who are building
                families with members who've already been through it — same
                routes, similar situations. Not professionals. Just people
                who've done it and want to help.
              </p>
              <div className={styles.talkBtns}>
                <Button to={MENTORSHIP} variant="primary" size="lg">
                  Find a peer mentor
                </Button>
                <Button to={FORUM} variant="ghost-dark" size="lg">
                  Queer Parent Network →
                </Button>
              </div>
            </div>
            <div className={styles.talkCards}>
              {TALK_CARDS.map((c) => (
                <div className={styles.talkCard} key={c.name}>
                  <div
                    className={styles.tcAv}
                    style={{ background: c.bg, color: c.color }}
                  >
                    {c.initials}
                  </div>
                  <div>
                    <div className={styles.tcName}>{c.name}</div>
                    <div className={styles.tcDetail}>{c.detail}</div>
                    <div className={styles.tcNote}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.forumCta}>
        <div className="wrap">
          <div className={styles.forumCtaInner}>
            <div className={styles.forumCtaText}>
              <h3>
                Questions the page <em>doesn't answer?</em>
              </h3>
              <p>
                The Family Building forum thread is where members share current
                experience, ask questions, and support each other through a
                process that no guide can fully capture.
              </p>
            </div>
            <div className={styles.forumCtaBtns}>
              <Button to={FORUM} variant="primary">
                Open the forum thread
              </Button>
              <Button to={LEGAL} variant="ghost">
                Legal resources →
              </Button>
            </div>
          </div>
        </div>
      </section>

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
