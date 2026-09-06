import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import {
  FiArrowLeft,
  FiChevronRight,
  FiLogOut,
  FiMonitor,
  FiSmartphone,
} from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  postLogoutAll,
  revokeOtherSessions,
  revokeSession,
  simulateOr,
} from "./api/account.api";
import { useSessions } from "./api/useSessions";
import { routes } from "../../app/routeMap";
import { type Session } from "./sessions.data";
import styles from "./SessionsPage.module.css";

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
        {/* Same icon set as PushDevicesPage, rather than a second hand-drawn
            pair of SVGs for the same two device types. */}
        {session.deviceType === "mobile" ? (
          <FiSmartphone aria-hidden />
        ) : (
          <FiMonitor aria-hidden />
        )}
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
          {/* `location` only exists in demo — the backend stores no location. */}
          {session.location && (
            <>
              <span>{session.location}</span>
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
        {isCurrent && (
          <div className={styles.currentNote}>
            {t("settings:sessions.card.currentDeviceNote")}
          </div>
        )}
        {session.userAgent && (
          /* The raw User-Agent, one disclosure below the line a member
             actually reads. It used to BE that line, which is why nobody could
             tell their own laptop from an intruder's. Kept reachable rather
             than deleted: it is the only thing precise enough to distinguish
             two devices that share a coarse label, and the only thing worth
             pasting into a support message.

             A native <details> rather than a state-driven toggle — the summary
             text is the control's accessible name, expansion is announced with
             no aria wiring, and it costs no JavaScript. */
          <details className={styles.uaDisclosure}>
            <summary className={styles.uaSummary}>
              <FiChevronRight aria-hidden />
              {t("settings:sessions.card.technicalDetail")}
            </summary>
            <p className={styles.uaValue}>{session.userAgent}</p>
          </details>
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

/**
 * The count + the two bulk controls above the list.
 *
 * Two, and they have to read as two different acts. "Sign out the other
 * devices" leaves this one signed in, which is what a member tidying up an old
 * laptop wants. "Sign out everywhere" ends this session too, which is what a
 * member who thinks someone else is in their account wants, and until PRD-308
 * that second one did not exist: they had to run the first control here and
 * then go and find the sign-out item in the account menu, and knowing to do
 * both was left to them. The copy names the difference outright rather than
 * relying on "all" versus "other".
 */
function BulkRow({
  others,
  onSignOutOthers,
  onSignOutEverywhere,
}: {
  others: number;
  onSignOutOthers: () => void;
  onSignOutEverywhere: () => void;
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
      <div className={styles.bulkActions}>
        {others > 0 && (
          <Button variant="ghost" onClick={onSignOutOthers}>
            {t("settings:sessions.bulk.signOutOthers")}
          </Button>
        )}
        <Button variant="primary" onClick={onSignOutEverywhere}>
          <FiLogOut aria-hidden className={styles.bulkActionIcon} />
          {t("settings:sessions.bulk.signOutEverywhere")}
        </Button>
      </div>
    </div>
  );
}

export function SessionsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { sessions, loading: fetching, failed, refetch } = useSessions();
  const simulated = useSimulatedLoad();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  // Demo keeps its simulated shimmer; live shows the real fetch state.
  const loading = demoMode ? simulated : fetching;
  const [signedOut, setSignedOut] = useState<Set<string>>(new Set());
  const [isConfirmingEverywhere, setIsConfirmingEverywhere] = useState(false);
  const [isSigningOutEverywhere, setIsSigningOutEverywhere] = useState(false);

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

  /**
   * "Sign out everywhere", one act: `POST /auth/logout-all` ends every session
   * the account holds and clears this browser's auth and CSRF cookies, then
   * the client drops its own session state and lands the member on the
   * homepage, exactly where the account menu's sign-out leaves them.
   *
   * Order matters. The server call goes FIRST and its result is checked,
   * because clearing local state on a request that never landed would show a
   * signed-out UI over sessions that are all still live: the opposite of what
   * this control promises, to the member least able to afford it. Demo mode
   * has no backend, so it just signs out locally.
   */
  async function handleSignOutEverywhere() {
    setIsSigningOutEverywhere(true);
    try {
      const isDone = demoMode ? true : await postLogoutAll();
      if (!isDone) {
        showToast(
          t("settings:sessions.toast.signedOutEverywhereError"),
          "error",
        );
        return;
      }
      setIsConfirmingEverywhere(false);
      signOut();
      void navigate(routes.homepage, { replace: true });
      showToast(t("settings:sessions.toast.signedOutEverywhere"), "success");
    } catch (err) {
      logError(err, { where: "SessionsPage.signOutEverywhere" });
      showToast(t("settings:sessions.toast.signedOutEverywhereError"), "error");
    } finally {
      setIsSigningOutEverywhere(false);
    }
  }

  const activeSessions = sessions.filter((s) => !signedOut.has(s.id));
  const others = activeSessions.filter((s) => s.variant !== "current").length;

  return (
    <AppShell>
      <div className={styles.page}>
        {/* Back to the pane this page is opened from: Settings → Account,
            which holds the "Active sessions" card. The security hub at
            /account/security also links here; going back to the pane keeps one
            predictable target whichever way the member arrived. */}
        <Link to={`${routes.settings}?pane=account`} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("settings:sessions.backToAccount")}
        </Link>

        <div className={styles.eyebrow}>{t("settings:sessions.eyebrow")}</div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="settings:sessions.h1"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          {/* "What to do next" is the help page's account section, which
              answers an unfamiliar device. It is NOT /system/account-locked:
              that page states the account is locked, which it isn't. */}
          <Translation
            i18nKey="settings:sessions.lead"
            components={{ a: <Link to={`${routes.help}#account`} /> }}
          />
        </p>

        {!loading && !failed && (
          <BulkRow
            others={others}
            onSignOutOthers={() => void handleSignOutAll()}
            onSignOutEverywhere={() => setIsConfirmingEverywhere(true)}
          />
        )}

        {/* The same confirm dialog the rest of Settings uses for a destructive
            action, in its `destructive` tone. This one ends the member's own
            session, so it cannot be an undo-able toast. */}
        <ConfirmDialog
          open={isConfirmingEverywhere}
          onClose={() => setIsConfirmingEverywhere(false)}
          onConfirm={() => void handleSignOutEverywhere()}
          tone="destructive"
          loading={isSigningOutEverywhere}
          title={t("settings:sessions.everywhere.confirmTitle")}
          description={t("settings:sessions.everywhere.confirmBody")}
          confirmLabel={t("settings:sessions.everywhere.confirmCta")}
        />

        <div className={styles.sectionH}>
          {t("settings:sessions.sectionActiveNow")}
        </div>
        <div className={styles.list}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SessionSkeleton key={i} />)
          ) : failed ? (
            // A failed read gets a retry, not just a sentence: the member's
            // only other move is a full page reload (DES-22).
            <LoadErrorState
              compact
              onRetry={refetch}
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
                <SessionCard
                  session={s}
                  onSignOut={(sessionId) => void handleSignOut(sessionId)}
                />
              </FadeIn>
            ))
          )}
        </div>

        <div className={styles.footNote}>
          <Translation
            i18nKey="settings:sessions.footNote"
            components={{
              strong: <b />,
              // Reporting a compromised account goes to the contact form
              // with its topic preselected, so it reaches ops as an inquiry.
              a: <Link to={`${routes.contact}?topic=account`} />,
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
