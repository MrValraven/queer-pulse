import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import styles from "./ApplicationStatusPage.module.css";

type Cat = "active" | "offer" | "closed" | "draft";
type StageState = "" | "done" | "active" | "rejected";
type BadgeKind = "in-review" | "interview" | "offer" | "rejected" | "draft";
type LogoTint = "" | "jade" | "plum" | "draft";

interface Stage {
  label: string;
  state: StageState;
}
interface Application {
  cat: Cat;
  logo: string;
  logoTint: LogoTint;
  title: string;
  company: React.ReactNode;
  meta: string[];
  stages: Stage[];
  status: React.ReactNode;
  badge: { kind: BadgeKind; label: string; pulse?: boolean };
  actions: { label: string; muted?: boolean }[];
}

const BADGE_CLASS: Record<BadgeKind, string> = {
  "in-review": "badgeInReview",
  interview: "badgeInterview",
  offer: "badgeOffer",
  rejected: "badgeRejected",
  draft: "badgeDraft",
};
const STAGE_CLASS: Record<StageState, string> = {
  "": "",
  done: "stageDone",
  active: "stageActive",
  rejected: "stageRejected",
};
const LOGO_CLASS: Record<LogoTint, string> = {
  "": "",
  jade: "logoJade",
  plum: "logoPlum",
  draft: "logoDraft",
};

const APPS: Application[] = [
  { cat: "active", logo: "AP", logoTint: "", title: "Junior Graphic Designer", company: <>Atelier Pulso · Lisbon · Hybrid</>, meta: ["€26–32k", "Full-time", "Closes 24 Jun"], stages: [{ label: "Submitted", state: "done" }, { label: "In review", state: "active" }, { label: "Interview", state: "" }, { label: "Decision", state: "" }], status: <><b>In review by Marta R.</b> · <span className={styles.ago}>submitted 4 hours ago</span> · they reply within 10 days</>, badge: { kind: "in-review", label: "In review", pulse: true }, actions: [{ label: "Message recruiter →" }, { label: "View submission", muted: true }] },
  { cat: "active", logo: "PM", logoTint: "jade", title: "Senior Product Designer", company: <>Pixel Mode Studio · Lisbon / Porto · Remote OK</>, meta: ["€45–55k", "Full-time", "Equity"], stages: [{ label: "Submitted", state: "done" }, { label: "Review", state: "done" }, { label: "Interview · 2/3", state: "active" }, { label: "Decision", state: "" }], status: <><b>Round 2 scheduled · Wed 11 Jun, 16:00</b> with João (CTO) and Liv (Design lead) · <span className={styles.ago}>arranged 2 days ago</span></>, badge: { kind: "interview", label: "Interview", pulse: true }, actions: [{ label: "Add to calendar →" }, { label: "View company", muted: true }] },
  { cat: "offer", logo: "EQ", logoTint: "plum", title: "Editorial Lead, Magazine", company: <>Equip Editions · Lisbon · 4 days/week</>, meta: ["€38–44k pro-rata", "Part-time"], stages: [{ label: "Submitted", state: "done" }, { label: "Review", state: "done" }, { label: "Interview", state: "done" }, { label: "Offer · respond by 14 Jun", state: "active" }], status: <><b>Offer received · €42k + 25 days holiday</b> · <span className={styles.ago}>3 days ago</span> · respond by Sat 14 Jun</>, badge: { kind: "offer", label: "Offer · respond" }, actions: [{ label: "Open conversation →" }, { label: "Negotiate help", muted: true }] },
  { cat: "active", logo: "BV", logoTint: "", title: "Community Manager", company: <>Bairro Vivo · Lisbon · In-person</>, meta: ["€24–28k", "Full-time"], stages: [{ label: "Submitted", state: "done" }, { label: "In review · 11 days", state: "active" }, { label: "Interview", state: "" }, { label: "Decision", state: "" }], status: <>Submitted <b>28 May</b> · their stated turnaround is 10 days — gentle follow-up might be reasonable.</>, badge: { kind: "in-review", label: "In review · slow" }, actions: [{ label: "Follow up →" }, { label: "Withdraw", muted: true }] },
  { cat: "active", logo: "NV", logoTint: "jade", title: "UX Researcher (12-mo contract)", company: <>Novamente Saúde · Remote · Health sector</>, meta: ["€34–40k", "Contract"], stages: [{ label: "Submitted yesterday", state: "done" }, { label: "Auto-screening", state: "active" }, { label: "Interview", state: "" }, { label: "Decision", state: "" }], status: <>Their inbox is open and they reply quickly. Verified queer-friendly by 4 members.</>, badge: { kind: "in-review", label: "Just sent", pulse: true }, actions: [{ label: "View details →" }] },
  { cat: "closed", logo: "SL", logoTint: "", title: "Brand Designer", company: <>Solar Lisboa · Lisbon · In-person</>, meta: ["€30–36k"], stages: [{ label: "Submitted", state: "done" }, { label: "Review", state: "done" }, { label: "Interview", state: "done" }, { label: "Not this time", state: "rejected" }], status: <>They went with someone with more motion experience. <b>Left a kind, specific note</b> — worth reading.</>, badge: { kind: "rejected", label: "Closed · 21 May" }, actions: [{ label: "Read their note →" }] },
  { cat: "closed", logo: "VS", logoTint: "plum", title: "Marketing Coordinator", company: <>Vinhos do Sul · Lisbon</>, meta: ["€28k"], stages: [{ label: "Submitted", state: "done" }, { label: "Withdrew · 8 May", state: "rejected" }, { label: "—", state: "" }, { label: "—", state: "" }], status: <>You withdrew this one — accepted the Pixel Mode interview instead.</>, badge: { kind: "rejected", label: "Withdrawn" }, actions: [] },
  { cat: "draft", logo: "CL", logoTint: "draft", title: "Communications Manager", company: <>Clube das Letras · Lisbon · Hybrid</>, meta: ["€32–38k"], stages: [], status: <>Draft started <b>2 days ago</b> · 60% complete · closes <b>18 Jun</b> — don't forget.</>, badge: { kind: "draft", label: "Draft · 60%" }, actions: [{ label: "Resume application →" }] },
];

const TABS: { id: Cat | "all"; label: string; count: number }[] = [
  { id: "all", label: "All", count: 8 },
  { id: "active", label: "Active", count: 5 },
  { id: "offer", label: "Offers", count: 1 },
  { id: "closed", label: "Closed", count: 2 },
  { id: "draft", label: "Drafts", count: 1 },
];

export function ApplicationStatusPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Cat | "all">("all");
  const items = APPS.filter((a) => tab === "all" || a.cat === tab);

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.head}>
          <div>
            <div className={styles.eyebrow}>Your jobs</div>
            <h1 className={styles.h1}>
              Where everything <em>stands.</em>
            </h1>
            <p className={styles.sub}>
              Track every application, see how long companies have sat on yours, and
              know when to follow up.
            </p>
          </div>
          <div>
            <div className={styles.counter}>
              <em>5</em> <span className={styles.counterSent}>/ 8 sent</span>
            </div>
            <div className={styles.counterL}>Active applications</div>
          </div>
        </div>

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tab, tab === t.id && styles.tabActive].filter(Boolean).join(" ")}
              onClick={() => setTab(t.id)}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {items.map((a, i) => (
            <div className={styles.app} key={i}>
              <div className={[styles.appLogo, LOGO_CLASS[a.logoTint] && styles[LOGO_CLASS[a.logoTint]]].filter(Boolean).join(" ")}>
                {a.logo}
              </div>
              <div className={styles.appMid}>
                <h3>{a.title}</h3>
                <div className={styles.appCo}>{a.company}</div>
                <div className={styles.appMeta}>
                  {a.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                {a.stages.length > 0 && (
                  <div className={styles.stages}>
                    {a.stages.map((s, si) => (
                      <div key={si} className={[styles.stage, STAGE_CLASS[s.state] && styles[STAGE_CLASS[s.state]]].filter(Boolean).join(" ")}>
                        <div className={styles.stageBar} />
                        <div className={styles.stageL}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <p className={styles.appStatus}>{a.status}</p>
              </div>
              <div className={styles.appRight}>
                <span className={`${styles.appBadge} ${styles[BADGE_CLASS[a.badge.kind]]}`}>
                  {a.badge.pulse && <span className={styles.pulse} />}
                  {a.badge.label}
                </span>
                {a.actions.map((act) => (
                  <button
                    key={act.label}
                    type="button"
                    className={[styles.appAction, act.muted && styles.appActionMuted].filter(Boolean).join(" ")}
                    onClick={() => showToast("Opening…", "info")}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
