import { useState } from "react";
import { StudioShell } from "./StudioShell";
import { StudioTriageList } from "./StudioTriageList";
import { StudioTriageDetail } from "./StudioTriageDetail";
import { KPIS, TABS } from "./studioTriage.data";
import s from "./council.module.css";

export function StudioTriagePage() {
  const [tab, setTab] = useState("New");

  return (
    <StudioShell>
      <div className={s.wrap}>
        <section className={s.trH}>
          <div>
            <div className={s.eb}>
              Submission triage · the council answers every submission in 14
              days
            </div>
            <div className={s.pageH} style={{ padding: 0 }}>
              <h1>
                Inbox · <em>47</em> new this week.
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
              Every submission gets read or listened to.{" "}
              <em style={{ color: "var(--jade-light)" }}>Pass</em> takes a
              sentence — that sentence becomes the artist's answer. Median reply
              time this season: 9.4 days.
            </div>
          </div>
          <div className={s.kpiStrip}>
            {KPIS.map((k, i) => (
              <div key={i} className={s.kpiMini}>
                <div
                  className={`${s.v} ${k.jade ? "jade" : ""}`}
                  style={k.jade ? { color: "var(--jade-light)" } : undefined}
                >
                  {k.v}
                </div>
                <div className={s.l}>{k.l}</div>
              </div>
            ))}
          </div>
        </section>

        <div className={s.trTabs}>
          {TABS.map((t) => (
            <button
              type="button"
              key={t.label}
              className={[
                s.trTab,
                tab === t.label && s.trTabOn,
                t.warn && s.trTabWarn,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setTab(t.label)}
            >
              {t.label} <span className={s.ctNum}>{t.ct}</span>
            </button>
          ))}
        </div>

        <div className={s.trBody}>
          <StudioTriageList tab={tab} onBackToNew={() => setTab("New")} />
          <StudioTriageDetail />
        </div>
      </div>
    </StudioShell>
  );
}
