import { useState } from "react";
import { StudioShell } from "./StudioShell";
import { StudioTriageList } from "./StudioTriageList";
import { StudioTriageDetail } from "./StudioTriageDetail";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KPIS, TABS } from "./studioTriage.data";
import s from "./council.module.css";

export function StudioTriagePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("new");

  return (
    <StudioShell>
      <div className={s.wrap}>
        <section className={s.trH}>
          <div>
            <div className={s.eb}>{t("studio:triage.header.eyebrow")}</div>
            <div className={s.pageH} style={{ padding: 0 }}>
              <h1>
                <Translation
                  i18nKey="studio:triage.header.title"
                  components={{ em: <em /> }}
                  values={{ count: 47 }}
                />
              </h1>
            </div>
            <div
              className="sub"
              style={{
                fontSize: 14,
                color: "rgba(247,243,238,.55)",
                lineHeight: 1.6,
                maxWidth: "56ch",
                marginTop: 10,
              }}
            >
              <Translation
                i18nKey="studio:triage.header.sub"
                components={{
                  em: <em style={{ color: "var(--jade-light)" }} />,
                }}
                values={{ days: "9.4" }}
              />
            </div>
          </div>
          <div className={s.kpiStrip}>
            {KPIS.map((kpi, kpiIndex) => (
              <div key={kpiIndex} className={s.kpiMini}>
                <div
                  className={`${s.v} ${kpi.jade ? "jade" : ""}`}
                  style={kpi.jade ? { color: "var(--jade-light)" } : undefined}
                >
                  {kpi.v}
                </div>
                <div className={s.l}>{t(kpi.labelKey)}</div>
              </div>
            ))}
          </div>
        </section>

        <div className={s.trTabs}>
          {TABS.map((tabOption) => (
            <button
              type="button"
              key={tabOption.id}
              className={[
                s.trTab,
                tab === tabOption.id && s.trTabOn,
                tabOption.warn && s.trTabWarn,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setTab(tabOption.id)}
            >
              {t(tabOption.labelKey)}{" "}
              <span className={s.ctNum}>{tabOption.ct}</span>
            </button>
          ))}
        </div>

        <div className={s.trBody}>
          <StudioTriageList tab={tab} onBackToNew={() => setTab("new")} />
          <StudioTriageDetail />
        </div>
      </div>
    </StudioShell>
  );
}
