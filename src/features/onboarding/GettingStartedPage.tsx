import { Navigate, useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, Eyebrow, SuccessPanel } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useGettingStarted, type GettingStartedStepState } from "./useGettingStarted";
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
      <span
        className={styles.track}
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={t("auth:gettingStarted.meterAria", { done, total })}
      >
        <span className={styles.fill} style={{ width: `${pct}%` }} />
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
        <span className={styles.doneTag}>
          <FiCheck aria-hidden />
          {t("auth:gettingStarted.doneLabel")}
        </span>
      ) : (
        <Button to={step.to} variant="ghost" size="sm">
          {t(step.ctaKey)}
        </Button>
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
        <header className={styles.head}>
          <Eyebrow>{t("auth:gettingStarted.eyebrow")}</Eyebrow>
          <h1 className={styles.title}>
            <Translation
              i18nKey="auth:gettingStarted.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lede}>{t("auth:gettingStarted.lede")}</p>
        </header>

        {allDone ? (
          <SuccessPanel
            title={t("auth:gettingStarted.allDone.title")}
            em={t("auth:gettingStarted.allDone.em")}
            closeLabel={t("auth:gettingStarted.allDone.cta")}
            onClose={() => {
              void navigate(routes.feed);
            }}
            steps={steps.map((step) => t(step.titleKey))}
          >
            {t("auth:gettingStarted.allDone.body")}
          </SuccessPanel>
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
      </main>
    </AppShell>
  );
}
