import { Navigate, useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  Button,
  Eyebrow,
  SkeletonLine,
  SuccessPanel,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  useGettingStarted,
  type GettingStartedStepState,
} from "./useGettingStarted";
import { GETTING_STARTED_STEP_XP } from "./gettingStarted.data";
import { LevelXpStrip } from "./LevelXpStrip";
import { XpSourcesTeaser } from "./XpSourcesTeaser";
import { SideQuests } from "./SideQuests";
import styles from "./GettingStartedPage.module.css";

/** The progress track above the checklist — a share of steps done, with a live
 *  count beside it (and a quiet "checking…" while the signals still resolve, so
 *  it never briefly understates a member who's already done the later steps). */
function ProgressMeter({
  done,
  total,
  loading,
}: {
  done: number;
  total: number;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const pct = Math.round((done / total) * 100);
  return (
    <div className={styles.meterRow}>
      {/* While the signals are still out, `done` understates a member who has
          already finished the later steps. Rather than announce "3 of 6" and
          then correct itself to "6 of 6", the bar goes indeterminate: no
          `aria-valuenow`, no fill, `aria-busy` on. */}
      <span
        className={styles.track}
        role="progressbar"
        aria-busy={loading || undefined}
        aria-valuenow={loading ? undefined : done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={
          loading
            ? t("auth:gettingStarted.checking")
            : t("auth:gettingStarted.meterAria", { done, total })
        }
      >
        {!loading && (
          <span className={styles.fill} style={{ width: `${pct}%` }} />
        )}
      </span>
      <span className={styles.meterLabel}>
        {loading
          ? t("auth:gettingStarted.checking")
          : t("auth:gettingStarted.progress", { done, total })}
      </span>
    </div>
  );
}

/** One checklist row: a ring that becomes a jade tick when done, the step's
 *  title, its "why" (or a warm done-line), and a CTA to where it happens —
 *  swapped for a quiet "Done" tag once complete. */
function StepRow({ step }: { step: GettingStartedStepState }) {
  const { t } = useTranslation();
  const Icon = step.icon;
  // This row's signal hasn't landed yet, so it genuinely doesn't know whether
  // it's done. Hold the shape with a skeleton instead of showing a "to do" CTA
  // (and its XP prize) that flips to Done a heartbeat later.
  if (step.isPending) {
    return (
      <li className={styles.step} aria-busy>
        <span className={styles.mark} aria-hidden>
          <Icon />
        </span>
        {/* A <div> here, where the settled row uses a <span>: SkeletonLine
            renders a <div>, which is not valid inside phrasing content. */}
        <div className={styles.body}>
          <span className={styles.stepTitle}>{t(step.titleKey)}</span>
          <SkeletonLine width="60%" />
        </div>
        <SkeletonLine width={92} height={30} />
      </li>
    );
  }
  return (
    <li className={`${styles.step} ${step.done ? styles.stepDone : ""}`}>
      <span className={styles.mark} aria-hidden>
        {step.done ? <FiCheck /> : <Icon />}
      </span>
      <span className={styles.body}>
        <span className={styles.stepTitle}>{t(step.titleKey)}</span>
        <span className={styles.stepDesc}>
          {step.done ? t(step.doneKey) : t(step.descKey)}
        </span>
      </span>
      {step.done ? (
        <>
          <span className={styles.stepXpDone}>
            {t("auth:gettingStarted.stepXpEarned", {
              xp: String(GETTING_STARTED_STEP_XP),
            })}
          </span>
          <span className={styles.doneTag}>
            <FiCheck aria-hidden />
            {t("auth:gettingStarted.doneLabel")}
          </span>
        </>
      ) : (
        <>
          <span className={styles.stepXp}>
            {t("auth:gettingStarted.stepXp", {
              xp: String(GETTING_STARTED_STEP_XP),
            })}
          </span>
          <Button to={step.to} variant="ghost" size="sm">
            {t(step.ctaKey)}
          </Button>
        </>
      )}
    </li>
  );
}

/**
 * The "Getting started" checklist page — a few first moves a new member can make
 * to settle in, each auto-detected as done from their real account data. Once
 * every step is done, the list gives way to a plum celebration panel.
 *
 * Live-only: demo mode has no real first-steps to track, so it redirects home
 * (and the account-menu entry that leads here is hidden in demo).
 */
export function GettingStartedPage() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { steps, completedCount, totalCount, allDone, loading } =
    useGettingStarted();

  if (demoMode) return <Navigate to={routes.homepage} replace />;

  return (
    <AppShell>
      <main className={styles.page}>
        {/* One two-column shell for both states: finishing the checklist swaps
            what each column holds, it doesn't reflow the page. */}
        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <header className={styles.head}>
              <Eyebrow>{t("auth:gettingStarted.eyebrow")}</Eyebrow>
              <h1 className={styles.title}>
                <Translation
                  i18nKey="auth:gettingStarted.title"
                  components={{ em: <em /> }}
                />
              </h1>
              <p className={styles.lede}>
                {/* The all-done panel already says "you're all set", so the lede
                    stays the plain welcome rather than a "6 of 6" count. */}
                {!allDone && completedCount > 0
                  ? t("auth:gettingStarted.ledeProgress", {
                      done: completedCount,
                      total: totalCount,
                    })
                  : t("auth:gettingStarted.lede")}
              </p>
            </header>
            {allDone ? (
              <>
                <SuccessPanel
                  title={t("auth:gettingStarted.allDone.title")}
                  em={t("auth:gettingStarted.allDone.em")}
                  closeLabel={t("auth:gettingStarted.allDone.cta")}
                  onClose={() => {
                    void navigate(routes.feed);
                  }}
                  steps={[
                    ...steps.map((step) => t(step.titleKey)),
                    t("auth:gettingStarted.success.badge"),
                  ]}
                >
                  {t("auth:gettingStarted.allDone.body")}
                </SuccessPanel>
                <SideQuests />
              </>
            ) : (
              <>
                <ProgressMeter
                  done={completedCount}
                  total={totalCount}
                  loading={loading}
                />
                <ol className={styles.list}>
                  {steps.map((step) => (
                    <StepRow key={step.key} step={step} />
                  ))}
                </ol>
              </>
            )}
          </div>
          <aside className={styles.sideCol}>
            {allDone ? (
              <LevelXpStrip
                hint={t("auth:gettingStarted.levelStrip.hintDone")}
              />
            ) : (
              <>
                {/* `force` while steps remain: a member can finish several in
                    minutes and would otherwise read a throttled XP total. */}
                <LevelXpStrip force />
                <XpSourcesTeaser />
              </>
            )}
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
