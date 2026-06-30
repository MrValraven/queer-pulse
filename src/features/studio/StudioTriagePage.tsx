import { useMemo, useState } from "react";
import { FiInbox } from "react-icons/fi";
import { ImageSlot, FadeIn, EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { StudioShell } from "./StudioShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { KPIS, TABS, SUBS, FILE, WF } from "./studioTriage.data";
import s from "./council.module.css";

function SubmissionRowSkeleton() {
  return (
    <div className={s.subRow}>
      <div className={s.subTop}>
        <span className={s.skel} style={{ width: 48, height: 48 }} />
        <div>
          <div className={s.skel} style={{ width: "60%", height: 17 }} />
          <div
            className={s.skel}
            style={{ width: "40%", height: 12, marginTop: 8 }}
          />
          <div
            className={s.skel}
            style={{ width: 120, height: 16, marginTop: 10, borderRadius: 999 }}
          />
        </div>
        <div className={s.skel} style={{ width: 40, height: 28 }} />
      </div>
      <div
        className={s.skel}
        style={{ width: "85%", height: 13, marginTop: 14 }}
      />
    </div>
  );
}

export function StudioTriagePage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("New");
  const [active, setActive] = useState(0);
  const loading = useSimulatedLoad();

  const subs = useMemo(() => {
    switch (tab) {
      case "Yours":
        return SUBS.filter((sub) =>
          sub.badges.some((b) => b.cls === "claimed"),
        );
      case "At deadline":
        return SUBS.filter((sub) => {
          const day = parseInt(sub.day.replace(/\D/g, ""), 10);
          return sub.of && day >= 11;
        });
      case "Shortlisted":
      case "Answered":
        return [];
      default:
        return SUBS;
    }
  }, [tab]);

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
          <section className={s.subList}>
            {loading ? (
              Array.from({ length: SUBS.length }).map((_, i) => (
                <SubmissionRowSkeleton key={i} />
              ))
            ) : subs.length === 0 ? (
              <EmptyState
                compact
                icon={<FiInbox />}
                title="Nothing in this queue"
                description={
                  <>
                    No submissions sit in <em>{tab.toLowerCase()}</em> right
                    now. When something lands, you'll find it waiting here.
                  </>
                }
                action={{ label: "Back to new", onClick: () => setTab("New") }}
              />
            ) : (
              subs.map((sub, i) => (
                <FadeIn key={i} delay={Math.min(i, 8) * 60}>
                  <div
                    className={[s.subRow, active === i && s.subRowActive]
                      .filter(Boolean)
                      .join(" ")}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(i);
                      }
                    }}
                  >
                    <div className={s.subTop}>
                      <span className={s.srCov}>
                        <ImageSlot
                          src={sub.image}
                          tint={sub.tint}
                          width={48}
                          height={48}
                          radius={8}
                          placeholder=""
                        />
                      </span>
                      <div>
                        <h3>
                          {sub.titlePre}
                          {sub.titleEm && <em>{sub.titleEm}</em>}
                        </h3>
                        <div className={s.subWho}>{sub.who}</div>
                        <div className={s.badges}>
                          {sub.badges.map((b) => (
                            <span
                              key={b.label}
                              className={
                                b.cls === "first"
                                  ? s.first
                                  : b.cls === "claimed"
                                    ? s.claimed
                                    : undefined
                              }
                            >
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={s.deadline}>
                        <b>{sub.day}</b>
                        {sub.of && "of 14 to answer"}
                      </div>
                    </div>
                    <div className={s.subNote}>{sub.note}</div>
                    <div className={s.metaStrip}>
                      {sub.meta.map((m, j) => (
                        <span key={j}>{m}</span>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ))
            )}
          </section>

          <aside className={s.aside}>
            <h2>
              The piano <em>I waited for</em>
            </h2>
            <div className={s.asideWho}>Renato V. · Porto · single · 4:40</div>

            <div className={s.playerMini}>
              <div className={s.pmWf}>
                {WF.map((h, i) => (
                  <span
                    key={i}
                    className={i < 6 ? s.played : undefined}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className={s.pmCtrl}>
                <button className={s.pmPlay} aria-label="Play">
                  <svg viewBox="0 0 12 14" fill="currentColor">
                    <path d="M1 1l10 6-10 6z" />
                  </svg>
                </button>
                <div className={s.pmTimes}>
                  <span className="e" style={{ color: "var(--accent)" }}>
                    1:48
                  </span>
                  <span>4:40</span>
                </div>
              </div>
            </div>

            <div className={s.claimRow}>
              <div className="av">SM</div>
              <div className={s.text}>
                <b>Claimed by Sara M.</b>
                You're answering this one.{" "}
                <em>D. Okoye second-reading queued.</em>
              </div>
            </div>

            <div className={s.detailBlock}>
              <h4>The file</h4>
              <div className={s.dGrid}>
                {FILE.map(([k, v], i) => (
                  <span key={i} style={{ display: "contents" }}>
                    <span className={s.k}>{k}</span>
                    <span className={s.v}>{v}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className={s.detailBlock}>
              <h4>What other curators flagged (3)</h4>
              <p style={{ fontStyle: "italic", color: "rgba(247,243,238,.6)" }}>
                D. Okoye: "the bridge at 2:14 is the thing." · João R.: "PT
                feels regional — Porto, not Lisbon." · Yara R.: "i'd put this on
                the standards collection in a year, easily."
              </p>
            </div>

            <h3 className={s.shortlistH}>
              Your <em>answer</em>
            </h3>
            <div className={s.decision}>
              <h4>
                If you pass — write one sentence. This goes to Renato as the
                answer.
              </h4>
              <textarea placeholder="A small sentence that explains the no. We never send a form letter, ever." />
              <div
                className="hint"
                style={{
                  fontSize: 11.5,
                  color: "rgba(247,243,238,.5)",
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  marginTop: 8,
                }}
              >
                Required for pass.{" "}
                <em style={{ color: "var(--accent)" }}>Not required</em> for
                slate.
              </div>
              <div
                className="actions"
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >
                <button
                  className={s.bt}
                  onClick={() => showToast("Held for a second read", "info")}
                >
                  Hold &amp; second-read
                </button>
                <button
                  className={s.bt}
                  onClick={() =>
                    showToast(
                      "Passed with your sentence — sent to Renato",
                      "success",
                    )
                  }
                >
                  Pass · with the sentence
                </button>
                <button
                  className={`${s.bt} ${s.btP}`}
                  onClick={() =>
                    showToast("Added to the next slate", "success")
                  }
                >
                  ＋ Add to next slate
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </StudioShell>
  );
}
