import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { FiShield } from "react-icons/fi";
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
import {
  revokeOtherSessions,
  revokeSession,
  simulateOr,
} from "./api/account.api";
import { routes } from "../../app/routeMap";
import {
  ACTIVE_SESSIONS,
  TRUSTED_DEVICES,
  type Session,
  type TrustedDevice,
} from "./sessions.data";
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
  const isCurrent = session.variant === "current";
  const isSuspect = session.variant === "suspect";
  const isTrusted = session.variant === "trusted";
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
              This session
            </span>
          )}
          {isSuspect && (
            <span className={`${styles.badge} ${styles.badgeSuspect}`}>
              Review
            </span>
          )}
          {isTrusted && (
            <span className={`${styles.badge} ${styles.badgeTrusted}`}>
              Trusted
            </span>
          )}
        </div>
        <div className={`${styles.row} ${isSuspect ? styles.rowSuspect : ""}`}>
          <span>{session.loc}</span>
          <span className={styles.sep}>·</span>
          <span>
            Signed in <b>{session.signedIn}</b>
          </span>
        </div>
        <div className={styles.row}>
          <span>
            Last activity <b>{session.lastActivity}</b>
          </span>
          {session.extra && (
            <>
              <span className={styles.sep}>·</span>
              <span>{session.extra}</span>
            </>
          )}
        </div>
      </div>
      {isCurrent ? (
        <span
          className={`${styles.action} ${styles.actionCurrent}`}
          aria-hidden="true"
        >
          Current
        </span>
      ) : (
        <Button
          variant="ghost"
          className={`${styles.action} ${isSuspect ? styles.actionSuspect : ""}`}
          onClick={() => onSignOut(session.id)}
        >
          Sign out
        </Button>
      )}
    </div>
  );
}

function TrustedDeviceCard({
  device,
  onUntrust,
}: {
  device: TrustedDevice;
  onUntrust: (id: string) => void;
}) {
  return (
    <div className={styles.card}>
      <div
        className={
          device.deviceType === "mobile"
            ? `${styles.ic} ${styles.icMobile}`
            : styles.ic
        }
      >
        {device.deviceType === "mobile" ? <MobileIcon /> : <DesktopIcon />}
      </div>
      <div className={styles.details}>
        <div className={styles.metaRow}>
          <span className={styles.name}>{device.device}</span>
          <span className={`${styles.badge} ${styles.badgeTrusted}`}>
            Trusted
          </span>
        </div>
        <div className={styles.row}>
          <span>
            Trusted since <b>{device.since}</b>
          </span>
          {device.extra && (
            <>
              <span className={styles.sep}>·</span>
              <span>{device.extra}</span>
            </>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        className={styles.action}
        onClick={() => onUntrust(device.id)}
      >
        Untrust
      </Button>
    </div>
  );
}

/** Mirrors a SessionCard / TrustedDeviceCard so there's no layout shift on load. */
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

export function SessionsPage() {
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  const [signedOut, setSignedOut] = useState<Set<string>>(new Set());
  const [untrusted, setUntrusted] = useState<Set<string>>(new Set());

  async function handleSignOut(id: string) {
    // Optimistic; revert on failure so we never imply a sign-out that didn't happen.
    setSignedOut((prev) => new Set(prev).add(id));
    try {
      await simulateOr(demoMode, undefined, () => revokeSession(id));
      showToast(
        "Session ended. If we didn't recognise that device, we'll email the address on file.",
        "success",
      );
    } catch (err) {
      logError(err, { where: "SessionsPage.signOut" });
      setSignedOut((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast("We couldn't sign that session out. Try again.", "error");
    }
  }
  function handleUntrust(id: string) {
    setUntrusted((prev) => new Set(prev).add(id));
    showToast("Device removed from trusted list", "info");
  }
  async function handleSignOutAll() {
    const ids = ACTIVE_SESSIONS.filter((s) => s.variant !== "current").map(
      (s) => s.id,
    );
    setSignedOut(new Set(ids));
    try {
      await simulateOr(demoMode, undefined, revokeOtherSessions);
      showToast("All other sessions signed out", "success");
    } catch (err) {
      logError(err, { where: "SessionsPage.signOutAll" });
      setSignedOut(new Set());
      showToast("We couldn't sign the others out. Try again.", "error");
    }
  }

  const activeSessions = ACTIVE_SESSIONS.filter((s) => !signedOut.has(s.id));
  const trustedDevices = TRUSTED_DEVICES.filter((d) => !untrusted.has(d.id));

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={routes.security} className={styles.back}>
          ← Security
        </Link>

        <div className={styles.eyebrow}>Security · Active sessions</div>
        <h1 className={styles.h1}>
          Where you're <em>signed in</em> right now.
        </h1>
        <p className={styles.lead}>
          Every device with an active session. If something here looks
          unfamiliar, sign it out — and read{" "}
          <Link to={routes.accountLocked}>what to do next</Link>.
        </p>

        <div className={styles.bulkRow}>
          <p>
            You're signed in on <b>5 devices</b>.{" "}
            <b>1 is on a network we haven't seen before</b> — review it.
          </p>
          <Button variant="primary" onClick={handleSignOutAll}>
            Sign out all other sessions
          </Button>
        </div>

        <div className={styles.sectionH}>Active now</div>
        <div className={styles.list}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <SessionSkeleton key={i} />
              ))
            : activeSessions.map((s, i) => (
                <FadeIn key={s.id} delay={Math.min(i, 8) * 60}>
                  <SessionCard session={s} onSignOut={handleSignOut} />
                </FadeIn>
              ))}
        </div>

        <div className={styles.sectionH}>Trusted devices · skip 2FA</div>
        <div className={styles.list}>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <SessionSkeleton key={i} />)
          ) : trustedDevices.length === 0 ? (
            <EmptyState
              compact
              icon={<FiShield />}
              title="No trusted devices"
              description="You'll be asked for a second factor every time you sign in. Mark a device as trusted to skip 2FA on the ones you use most."
            />
          ) : (
            trustedDevices.map((d, i) => (
              <FadeIn key={d.id} delay={Math.min(i, 8) * 60}>
                <TrustedDeviceCard device={d} onUntrust={handleUntrust} />
              </FadeIn>
            ))
          )}
        </div>

        <div className={styles.footNote}>
          <b>Something looks wrong?</b> If you didn't sign in from Madrid, sign
          that session out, then{" "}
          <Link to={routes.twoFactorSetup}>re-issue your backup codes</Link>.
          When you sign an unrecognised session out, we email the address on
          file so there's an out-of-band record of what happened.
        </div>
      </div>
    </AppShell>
  );
}
