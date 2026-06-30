import { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDrafts } from "../../app/providers/DraftsProvider";
import {
  DRAFT_TABS,
  DRAFTS,
  type Draft,
  type MetaVariant,
} from "./drafts.data";
import styles from "./DraftsPage.module.css";

/** Loading placeholder mirroring a draft .row's 3-column grid. */
function DraftRowSkeleton() {
  return (
    <div className={styles.row} aria-hidden>
      <SkeletonLine
        width={36}
        height={36}
        style={{ borderRadius: 10, flex: "none" }}
      />
      <div className={styles.info}>
        <SkeletonLine width="45%" height={15} />
        <SkeletonLine width="80%" height={12} style={{ marginTop: 8 }} />
        <SkeletonLine width="55%" height={11} style={{ marginTop: 10 }} />
      </div>
      <SkeletonLine width={80} height={28} style={{ borderRadius: 8 }} />
    </div>
  );
}

const kindClass: Record<Draft["kindVariant"], string> = {
  job: styles.kindJob!,
  pitch: styles.kindPitch!,
  grant: styles.kindGrant!,
  post: styles.kindPost!,
};

const metaClass: Record<MetaVariant, string> = {
  deadline: styles.metaDeadline!,
  pulse: styles.metaPulse!,
  stale: styles.metaStale!,
};

export function DraftsPage() {
  const { showToast } = useToast();
  const loading = useSimulatedLoad();
  const { drafts: userDrafts, removeDraft } = useDrafts();
  const [tab, setTab] = useState(0);
  const [deleted, setDeleted] = useState<Set<string>>(new Set());

  // Drafts the user actually started elsewhere (e.g. a saved invite) sit ahead
  // of the static mock list.
  const allDrafts = [...userDrafts, ...DRAFTS];
  const userDraftIds = new Set(userDrafts.map((d) => d.id));

  function runAction(d: Draft, action: Draft["actions"][number]) {
    if (action.deletes) {
      if (userDraftIds.has(d.id)) {
        removeDraft(d.id);
      } else {
        setDeleted((prev) => new Set(prev).add(d.id));
      }
      showToast("Draft deleted", "info");
    } else {
      showToast(action.label, "info");
    }
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Drafts · only visible to you</div>
          <h1 className={styles.h1}>
            Things you <em>started.</em>
          </h1>
          <p className={styles.lead}>
            Posts, articles, applications, and pitches you haven't sent yet.{" "}
            <em>Auto-saved every 8 seconds.</em> Drafts older than 90 days get a
            polite reminder, then a polite second one, then quietly delete.
          </p>
        </header>

        <div className={styles.tabs}>
          {DRAFT_TABS.map((t, i) => (
            <button
              key={t.label}
              className={`${styles.tab} ${tab === i ? styles.active : ""}`}
              onClick={() => setTab(i)}
            >
              {t.label}{" "}
              <span className={styles.tabCount}>
                {i === 0 ? t.count + userDrafts.length : t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <DraftRowSkeleton key={i} />)
        ) : allDrafts.length === 0 ? (
          <EmptyState
            icon={<FiEdit3 />}
            title="No drafts here yet"
            description="Anything you start — a post, a pitch, an application — saves here automatically until you're ready to send it. Nothing's lost while you find the words."
            action={{ label: "Start writing", to: routes.magazine }}
          />
        ) : (
          allDrafts.map((d, i) => (
            <FadeIn key={d.id} delay={Math.min(i, 8) * 60}>
              <div
                className={`${styles.row} ${deleted.has(d.id) ? styles.deleted : ""}`}
              >
                <div className={`${styles.kind} ${kindClass[d.kindVariant]}`}>
                  {d.kind}
                </div>
                <div className={styles.info}>
                  <b>{d.title}</b>
                  <span>{d.desc}</span>
                  <div className={styles.meta}>
                    {d.meta.map((m, j) => (
                      <span
                        key={j}
                        className={m.variant ? metaClass[m.variant] : undefined}
                      >
                        {m.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.progress}>
                  <div
                    className={`${styles.bar} ${d.ready ? styles.full : ""}`}
                  >
                    <span style={{ width: `${d.progress}%` }} />
                  </div>
                  {d.ready ? (
                    <span className={styles.readyLabel}>Ready</span>
                  ) : (
                    <span>{d.progress}%</span>
                  )}
                </div>
                <div className={styles.actions}>
                  {d.actions.map((a) => (
                    <button
                      key={a.label}
                      className={`${styles.action} ${a.variant === "primary" ? styles.primary : ""} ${a.variant === "danger" ? styles.danger : ""}`}
                      onClick={() => runAction(d, a)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))
        )}

        <div className={styles.dangerBlock}>
          <b>About the 90-day rule:</b> drafts you haven't touched in 87+ days
          get an email reminder, then auto-delete on day 90. You can extend any
          draft 30 days at a time.{" "}
          <em>This is to keep your drafts list honest — not to lose work.</em>
        </div>
      </div>
    </AppShell>
  );
}
