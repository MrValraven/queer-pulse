import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  type TabId,
  type TagKind,
  TAB_KEYS,
  buildPanels,
} from "./hateCrime.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./HateCrimePage.module.css";

const MENTAL = routes.mentalHealth;
const FORUM = routes.forum;
const LEGAL = routes.legal;

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
  const { t } = useTranslation();
  return (
    <div className={styles.tabBar}>
      <div className={styles.tbInner}>
        {TAB_KEYS.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            className={[
              styles.tabBtn,
              tab === tabItem.id && styles.tabBtnActive,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(tabItem.id)}
          >
            {t(tabItem.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HateCrimePanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>("immediate");
  const panels = useMemo(() => buildPanels(t, { MENTAL, FORUM, LEGAL }), [t]);

  return (
    <>
      <HateCrimeTabBar tab={tab} setTab={setTab} />
      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              {panels[tab].map((b, i) => {
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
                      {b.paragraphs.map((p, j) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                  );
                return (
                  <div className={styles.hcs} key={i}>
                    <div className={styles.hcsNum}>{b.number}</div>
                    <div className={styles.hcsBody}>
                      <div className={styles.hcsTitle}>{b.title}</div>
                      <div className={styles.hcsDesc}>{b.description}</div>
                      {b.tag && (
                        <span
                          className={`${styles.hcsTag} ${styles[TAG_CLASS[b.tag.kind]]}`}
                        >
                          {b.tag.label}
                        </span>
                      )}
                      {b.link && (
                        <Link to={b.link.href} className={styles.hcsLink}>
                          {b.link.label} <FiArrowRight aria-hidden />
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
      </div>
    </>
  );
}

function HateCrimeSidebar() {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>
          {t("safety:hateCrime.sidebar.emergencyTitle")}
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>
            {t("safety:hateCrime.sidebar.emergencyServices")}
          </div>
          <div className={styles.sbcNum}>112</div>
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>
            {t("safety:hateCrime.sidebar.apav.org")}
          </div>
          <div className={styles.sbcRole}>
            {t("safety:hateCrime.sidebar.apav.role")}
          </div>
          <div className={styles.sbcNum}>116 006</div>
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>
            {t("safety:hateCrime.sidebar.sosRacismo")}
          </div>
          <div className={styles.sbcNum}>21 314 85 82</div>
        </div>
      </div>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>
          {t("safety:hateCrime.sidebar.legalTitle")}
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>
            {t("safety:hateCrime.sidebar.ilga.org")}
          </div>
          <div className={styles.sbcRole}>
            {t("safety:hateCrime.sidebar.ilga.role")}
          </div>
          <div className={styles.sbcNum}>213 887 615</div>
          <span className={styles.sbcAnon}>
            {t("safety:hateCrime.sidebar.ilga.anon")}
          </span>
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>
            {t("safety:hateCrime.sidebar.provedor.org")}
          </div>
          <div className={styles.sbcRole}>
            {t("safety:hateCrime.sidebar.provedor.role")}
          </div>
          {/* eslint-disable-next-line local/no-literal-string -- real-world organisation URL, not translatable text */}
          <div className={styles.sbcNum}>provedor-jus.pt</div>
        </div>
        <div className={styles.sbcItem}>
          <div className={styles.sbcOrg}>
            {t("safety:hateCrime.sidebar.ilgaEurope.org")}
          </div>
          <div className={styles.sbcRole}>
            {t("safety:hateCrime.sidebar.ilgaEurope.role")}
          </div>
          {/* eslint-disable-next-line local/no-literal-string -- real-world organisation URL, not translatable text */}
          <div className={styles.sbcNum}>ilga-europe.org</div>
        </div>
      </div>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>
          {t("safety:hateCrime.sidebar.onTitle")}
        </div>
        <div className={styles.sbcItem}>
          <Link to={LEGAL} className={styles.sbcLink}>
            {t("safety:hateCrime.sidebar.legalResourcesCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
        <div className={styles.sbcItem}>
          <Link to={MENTAL} className={styles.sbcLink}>
            {t("safety:hateCrime.sidebar.mentalHealthCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.solidarity} className={styles.sbcLink}>
            {t("safety:hateCrime.sidebar.solidarityCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.report} className={styles.sbcLink}>
            {t("safety:hateCrime.sidebar.reportCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
