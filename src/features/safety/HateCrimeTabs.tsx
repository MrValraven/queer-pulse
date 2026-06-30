import { useState } from "react";
import { Link } from "react-router-dom";
import { type TabId, type TagKind, TABS, buildPanels } from "./hateCrime.data";
import { routes } from "../../app/routeMap";
import styles from "./HateCrimePage.module.css";

const MENTAL = routes.mentalHealth;
const FORUM = routes.forum;
const LEGAL = routes.legal;

const PANELS = buildPanels({ MENTAL, FORUM, LEGAL });

const TAG_CLASS: Record<TagKind, string> = {
  immediate: "tagImmediate",
  optional: "tagOptional",
  recommended: "tagRecommended",
};

export function HateCrimeTabBar({
  tab,
  setTab,
}: {
  tab: TabId;
  setTab: (t: TabId) => void;
}) {
  return (
    <div className={styles.tabBar}>
      <div className={styles.tbInner}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={[styles.tabBtn, tab === t.id && styles.tabBtnActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HateCrimePanel() {
  const [tab, setTab] = useState<TabId>("immediate");

  return (
    <>
      <HateCrimeTabBar tab={tab} setTab={setTab} />
      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              {PANELS[tab].map((b, i) => {
                if (b.kind === "preamble")
                  return (
                    <p className={styles.preamble} key={i}>
                      {b.text}
                    </p>
                  );
                if (b.kind === "sectionHead")
                  return (
                    <div className={styles.sectionHead} key={i}>
                      {b.node}
                    </div>
                  );
                if (b.kind === "note")
                  return (
                    <p className={styles.note} key={i}>
                      {b.text}
                    </p>
                  );
                if (b.kind === "def")
                  return (
                    <div className={styles.defBox} key={i}>
                      <h4>{b.h4}</h4>
                      {b.paras.map((p, j) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                  );
                return (
                  <div className={styles.hcs} key={i}>
                    <div className={styles.hcsNum}>{b.num}</div>
                    <div className={styles.hcsBody}>
                      <div className={styles.hcsTitle}>{b.title}</div>
                      <div className={styles.hcsDesc}>{b.desc}</div>
                      {b.tag && (
                        <span
                          className={`${styles.hcsTag} ${styles[TAG_CLASS[b.tag.kind]]}`}
                        >
                          {b.tag.label}
                        </span>
                      )}
                      {b.link && (
                        <Link to={b.link.href} className={styles.hcsLink}>
                          {b.link.label}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <HateCrimeSidebar />
          </div>
        </div>
      </main>
    </>
  );
}

function HateCrimeSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>Emergency &amp; immediate</div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>Emergency services</div>
          <div className={styles.sbcNum}>112</div>
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>APAV Victim Support</div>
          <div className={styles.sbcRole}>24h confidential</div>
          <div className={styles.sbcNum}>116 006</div>
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>
            SOS Racismo (also covers identity)
          </div>
          <div className={styles.sbcNum}>21 314 85 82</div>
        </div>
      </div>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>Legal &amp; advocacy</div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>ILGA Portugal</div>
          <div className={styles.sbcRole}>
            Free legal accompaniment, hate crime monitoring
          </div>
          <div className={styles.sbcNum}>213 887 615</div>
          <span className={styles.sbcAnon}>Anonymous reporting</span>
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>Provedor de Justiça</div>
          <div className={styles.sbcRole}>
            Ombudsman — if authorities fail to act
          </div>
          <div className={styles.sbcNum}>provedor-jus.pt</div>
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>ILGA Europe</div>
          <div className={styles.sbcRole}>EU-level legal support</div>
          <div className={styles.sbcNum}>ilga-europe.org</div>
        </div>
      </div>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>On QueerPulse</div>
        <div className={styles.sbcItem}>
          <Link to={LEGAL} className={styles.sbcLink}>
            Legal Resources →
          </Link>
        </div>
        <div className={styles.sbcItem}>
          <Link to={MENTAL} className={styles.sbcLink}>
            Mental Health →
          </Link>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.solidarity} className={styles.sbcLink}>
            Solidarity Pricing →
          </Link>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.report} className={styles.sbcLink}>
            Report to QueerPulse →
          </Link>
        </div>
      </div>
    </aside>
  );
}
