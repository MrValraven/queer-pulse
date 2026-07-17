import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { FiMonitor } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  revokeOtherSessions,
  revokeSession,
  simulateOr,
} from "./api/account.api";
import { useSessions } from "./api/useSessions";
import { routes } from "../../app/routeMap";
import { type Session } from "./sessions.data";
import styles from "./SessionsPage.module.css";

function DesktopIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
function MobileIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

function SessionCard({
  session,
  onSignOut,
}: {
  session: Session;
  onSignOut: (id: string) => void;
}) {
  const { t } = useTranslation();
  const isCurrent = session.variant === "current";
  const isSuspect = session.variant === "suspect";
  const cardCls = [
    styles.card,
    isCurrent && styles.cardCurrent,
    isSuspect && styles.cardSuspect,
  ]
    .filter(Boolean)
    .join(" ");
  const icCls = [
    styles.ic,
    session.deviceType === "mobile" && styles.icMobile,
    isSuspect && styles.icSuspect,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardCls}>
      <div className={icCls}>
        {session.deviceType === "mobile" ? <MobileIcon /> : <DesktopIcon />}
      </div>
      <div className={styles.details}>
        <div className={styles.metaRow}>
          <span className={styles.name}>{session.device}</span>
          {isCurrent && (
            <span className={`${styles.badge} ${styles.badgeThis}`}>
              {t("settings:sessions.card.badgeThis")}
            </span>
          )}
          {isSuspect && (
            <span className={`${styles.badge} ${styles.badgeSuspect}`}>
              {t("settings:sessions.card.badgeReview")}
            </span>
          )}
        </div>
        <div className={`${styles.row} ${isSuspect ? styles.rowSuspect : ""}`}>
          {/* `loc` only exists in demo — the backend stores no location. */}
          {session.loc && (
            <>
              <span>{session.loc}</span>
              <span className={styles.sep}>·</span>
            </>
          )}
          <span>
            <Translation
              i18nKey="settings:sessions.card.signedIn"
              components={{ strong: <b /> }}
              values={{ when: session.signedIn }}
            />
          </span>
        </div>
        {(session.lastActivity || session.extra) && (
          <div className={styles.row}>
            {session.lastActivity && (
              <span>
                <Translation
                  i18nKey="settings:sessions.card.lastActivity"
                  components={{ strong: <b /> }}
                  values={{ when: session.lastActivity }}
                />
              </span>
            )}
            {session.lastActivity && session.extra && (
              <span className={styles.sep}>·</span>
            )}
            {session.extra && <span>{session.extra}</span>}
          </div>
        )}
      </div>
      {isCurrent ? (
        <span
          className={`${styles.action} ${styles.actionCurrent}`}
          aria-hidden="true"
        >
          {t("settings:sessions.card.current")}
        </span>
      ) : (
        <Button
          variant="ghost"
          className={`${styles.action} ${isSuspect ? styles.actionSuspect : ""}`}
          onClick={() => onSignOut(session.id)}
        >
          {t("settings:sessions.card.signOut")}
        </Button>
      )}
    </div>
  );
}

/** Mirrors a SessionCard so there's no layout shift on load. */
function SessionSkeleton() {
  return (
    <div className={styles.card}>
      <SkeletonLine width={48} height={48} style={{ borderRadius: 14 }} />
      <div className={styles.details}>
        <SkeletonLine width="45%" height={19} />
        <SkeletonLine width="70%" height={13} style={{ marginTop: 8 }} />
        <SkeletonLine width="55%" height={13} style={{ marginTop: 5 }} />
      </div>
      <SkeletonLine width={88} height={36} style={{ borderRadius: 999 }} />
    </div>
  );
}

/** The count + "sign out everything else" strip above the list. */
function BulkRow({
  others,
  onSignOutAll,
}: {
  others: number;
  onSignOutAll: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.bulkRow}>
      <p>
        {others === 0 ? (
          t("settings:sessions.bulk.onlyDevice")
        ) : (
          <Translation
            i18nKey="settings:sessions.bulk.multi"
            components={{ strong: <b /> }}
            values={{ count: others + 1 }}
          />
        )}
      </p>
      {others > 0 && (
        <Button variant="primary" onClick={onSignOutAll}>
          {t("settings:sessions.bulk.signOutAll")}
        </Button>
      )}
    </div>
  );
}

export function SessionsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { sessions, loading: fetching, failed, refetch } = useSessions();
  const simulated = useSimulatedLoad();
  // Demo keeps its simulated shimmer; live shows the real fetch state.
  const loading = demoMode ? simulated : fetching;
  const [signedOut, setSignedOut] = useState<Set<string>>(new Set());

  async function handleSignOut(id: string) {
    // Optimistic; revert on failure so we never imply a sign-out that didn't happen.
    setSignedOut((prev) => new Set(prev).add(id));
    try {
      await simulateOr(demoMode, undefined, () => revokeSession(id));
      showToast(t("settings:sessions.toast.signedOut"), "success");
      refetch();
    } catch (err) {
      logError(err, { where: "SessionsPage.signOut" });
      setSignedOut((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast(t("settings:sessions.toast.signedOutError"), "error");
    }
  }

  async function handleSignOutAll() {
    const ids = sessions
      .filter((s) => s.variant !== "current")
      .map((s) => s.id);
    setSignedOut(new Set(ids));
    try {
      await simulateOr(demoMode, undefined, revokeOtherSessions);
      showToast(t("settings:sessions.toast.signedOutAll"), "success");
      refetch();
    } catch (err) {
      logError(err, { where: "SessionsPage.signOutAll" });
      setSignedOut(new Set());
      showToast(t("settings:sessions.toast.signedOutAllError"), "error");
    }
  }

  const activeSessions = sessions.filter((s) => !signedOut.has(s.id));
  const others = activeSessions.filter((s) => s.variant !== "current").length;

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={routes.security} className={styles.back}>
          {t("settings:sessions.backToSecurity")}
        </Link>

        <div className={styles.eyebrow}>{t("settings:sessions.eyebrow")}</div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="settings:sessions.h1"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="settings:sessions.lead"
            components={{ a: <Link to={routes.accountLocked} /> }}
          />
        </p>

        {!loading && !failed && (
          <BulkRow others={others} onSignOutAll={handleSignOutAll} />
        )}

        <div className={styles.sectionH}>
          {t("settings:sessions.sectionActiveNow")}
        </div>
        <div className={styles.list}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SessionSkeleton key={i} />)
          ) : failed ? (
            <EmptyState
              compact
              icon={<FiMonitor />}
              title={t("settings:sessions.empty.error.title")}
              description={t("settings:sessions.empty.error.desc")}
            />
          ) : activeSessions.length === 0 ? (
            <EmptyState
              compact
              icon={<FiMonitor />}
              title={t("settings:sessions.empty.none.title")}
              description={t("settings:sessions.empty.none.desc")}
            />
          ) : (
            activeSessions.map((s, i) => (
              <FadeIn key={s.id} delay={Math.min(i, 8) * 60}>
                <SessionCard session={s} onSignOut={handleSignOut} />
              </FadeIn>
            ))
          )}
        </div>

        <div className={styles.footNote}>
          <Translation
            i18nKey="settings:sessions.footNote"
            components={{
              strong: <b />,
              a: <Link to={routes.accountLocked} />,
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
