import { useState } from "react";
import { FiClock, FiColumns } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { AppCardSkeleton } from "./ApplicationStatusSkeleton";
import {
  APPS,
  BADGE_CLASS,
  STAGE_CLASS,
  LOGO_CLASS,
  type Application,
  type Cat,
  type ActionKind,
} from "./applicationStatus.data";
import { ApplicationModal } from "./ApplicationModals";
import { CompareOffersModal } from "./CompareOffersModal";
import styles from "./ApplicationStatusPage.module.css";

interface OpenModal {
  action: ActionKind;
  appId: string;
}

/** A single application row: logo, details, stage tracker, badge, and actions. */
function AppCard({
  app: a,
  muted,
  onAction,
}: {
  app: Application;
  muted?: boolean;
  onAction: (kind: ActionKind) => void;
}) {
  const activeIdx = a.stages.findIndex((s) => s.state === "active");
  const activeStage = activeIdx >= 0 ? a.stages[activeIdx] : undefined;
  return (
    <div
      className={[
        styles.app,
        muted && styles.appMuted,
        a.accent === "offer" && styles.appOffer,
        a.accent === "overdue" && styles.appOverdue,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          styles.appLogo,
          LOGO_CLASS[a.logoTint] && styles[LOGO_CLASS[a.logoTint]],
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {a.logo}
      </div>
      <div className={styles.appMid}>
        <h3>{a.title}</h3>
        <div className={styles.appCo}>{a.company}</div>
        <div className={styles.appMeta}>
          {a.meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
          {a.deadline && (
            <span
              className={[
                styles.appDeadline,
                a.deadline.urgent && styles.appDeadlineUrgent,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <FiClock size={12} aria-hidden /> {a.deadline.text}
            </span>
          )}
        </div>
        {activeIdx >= 0 && (
          <div className={styles.stageStep}>
            Step {activeIdx + 1} of {a.stages.length}
            <span className={styles.stageStepLabel}>
              {" "}
              · {activeStage?.label}
            </span>
          </div>
        )}
        {a.stages.length > 0 && (
          <div className={styles.stages}>
            {a.stages.map((s, si) => (
              <div
                key={si}
                className={[
                  styles.stage,
                  STAGE_CLASS[s.state] && styles[STAGE_CLASS[s.state]],
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={styles.stageBar} />
                <div className={styles.stageL}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {activeStage?.hint && (
          <p className={styles.stageHint}>
            <span className={styles.stageHintK}>What this means</span>
            {activeStage.hint}
          </p>
        )}
        <p className={styles.appStatus}>{a.status}</p>
      </div>
      <div className={styles.appRight}>
        <span
          className={`${styles.appBadge} ${styles[BADGE_CLASS[a.badge.kind]]}`}
        >
          {a.badge.pulse && <span className={styles.pulse} />}
          {a.badge.label}
        </span>
        {a.actions.map((act) =>
          act.muted ? (
            <button
              key={act.label}
              type="button"
              className={`${styles.appAction} ${styles.appActionMuted}`}
              onClick={() => onAction(act.kind)}
            >
              {act.label}
            </button>
          ) : (
            <Button
              key={act.label}
              size="md"
              variant={act.solid ? "primary" : "ghost"}
              onClick={() => onAction(act.kind)}
            >
              {act.label}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}

interface Group {
  id: string;
  title?: string;
  hint?: string;
  muted?: boolean;
  compare?: boolean;
  items: Application[];
}

export function ApplicationStatusPage() {
  const loading = useSimulatedLoad();
  const [apps, setApps] = useState<Application[]>(APPS);
  const [tab, setTab] = useState<Cat | "all">("all");
  const [open, setOpen] = useState<OpenModal | null>(null);
  const [comparing, setComparing] = useState(false);

  const byCat = (cat: Cat) => apps.filter((a) => a.cat === cat);
  const offers = apps.filter((a) => a.cat === "offer" && a.offer);
  const canCompare = offers.length >= 2;
  const count = (cat: Cat) => byCat(cat).length;
  const activeCount = count("active");
  const sentCount = apps.filter((a) => a.cat !== "draft").length;

  const tabs: { id: Cat | "all"; label: string; count: number }[] = [
    { id: "all", label: "All", count: apps.length },
    { id: "active", label: "Active", count: activeCount },
    { id: "offer", label: "Offers", count: count("offer") },
    { id: "closed", label: "Closed", count: count("closed") },
    { id: "draft", label: "Drafts", count: count("draft") },
  ];

  // On "All", group so the ongoing, important work sits above drafts and closed.
  const groups: Group[] =
    tab === "all"
      ? [
          {
            id: "offer",
            title: "Offers — your decision",
            compare: true,
            items: byCat("offer"),
          },
          { id: "active", title: "In progress", items: byCat("active") },
          {
            id: "draft",
            title: "Drafts",
            hint: "Unfinished — wrap these up before they close.",
            muted: true,
            items: byCat("draft"),
          },
          {
            id: "closed",
            title: "Closed & withdrawn",
            hint: "No action needed — kept for your records.",
            muted: true,
            items: byCat("closed"),
          },
        ].filter((g) => g.items.length > 0)
      : [
          {
            id: tab,
            compare: tab === "offer",
            items: apps.filter((a) => a.cat === tab),
          },
        ];

  const patch = (id: string, p: Partial<Application>) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...p } : a)));

  const openApp = open && apps.find((a) => a.id === open.appId);

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
              Track every application, see how long companies have sat on yours,
              and know when to follow up.
            </p>
          </div>
          <div>
            <div className={styles.counter}>
              <em>{activeCount}</em>{" "}
              <span className={styles.counterSent}>/ {sentCount} sent</span>
            </div>
            <div className={styles.counterL}>Active applications</div>
          </div>
        </div>

        <div className={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tab, tab === t.id && styles.tabActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setTab(t.id)}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.legend}>
          <span className={styles.legendLabel}>Tracker key</span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendDone}`} /> Done
            — this step is complete
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendActive}`} />{" "}
            You are here — current step
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendUpcoming}`} />{" "}
            Upcoming — not started yet
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendClosed}`} />{" "}
            Closed — ended or withdrawn
          </span>
        </div>

        <div className={styles.list} aria-busy={loading}>
          {loading ? (
            <div className={styles.groupItems}>
              {Array.from({ length: 4 }).map((_, i) => (
                <AppCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.id} className={styles.group}>
                {(g.title || (g.compare && canCompare)) && (
                  <div
                    className={[
                      styles.groupHead,
                      g.muted && styles.groupHeadMuted,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {g.title && (
                      <span className={styles.groupTitle}>{g.title}</span>
                    )}
                    <span className={styles.groupCount}>{g.items.length}</span>
                    {g.hint && (
                      <span className={styles.groupHint}>{g.hint}</span>
                    )}
                    {g.compare && canCompare && (
                      <Button
                        size="md"
                        variant="ghost"
                        className={styles.compareBtn}
                        onClick={() => setComparing(true)}
                      >
                        <FiColumns
                          size={15}
                          aria-hidden
                          style={{ marginRight: 6 }}
                        />{" "}
                        Compare offers
                      </Button>
                    )}
                  </div>
                )}
                <div className={styles.groupItems}>
                  {g.items.map((a, i) => (
                    <FadeIn key={a.id} delay={Math.min(i, 8) * 60}>
                      <AppCard
                        app={a}
                        muted={g.muted}
                        onAction={(kind) =>
                          setOpen({ action: kind, appId: a.id })
                        }
                      />
                    </FadeIn>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {comparing && (
        <CompareOffersModal
          offers={offers}
          onClose={() => setComparing(false)}
          onRespond={(appId) => {
            setComparing(false);
            setOpen({ action: "offer", appId });
          }}
        />
      )}

      {open && openApp && (
        <ApplicationModal
          action={open.action}
          app={openApp}
          onClose={() => setOpen(null)}
          onPatch={patch}
        />
      )}
    </PageShell>
  );
}
