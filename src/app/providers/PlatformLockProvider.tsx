import { useCallback, useEffect, useState, type ReactNode } from "react";
import { setOnPlatformLocked } from "../../shared/api/client";
import { getPlatformStatus } from "../../shared/api/platformStatus.api";
import { MaintenanceScreen } from "../../shared/components/system/MaintenanceScreen";
import { useAuth } from "./authContext";

/** How often, while locked, to ask the public status endpoint if it is over. */
const POLL_MS = 30_000;

/**
 * Renders the maintenance screen when the backend reports a platform lockdown.
 *
 * The session is deliberately left alone — cookies are untouched, so lifting
 * the lockdown restores everyone with no re-authentication. That is why this is
 * a render gate rather than a sign-out. This depends on the backend's
 * `AuthController` staying `@LockdownExempt()`: `AuthProvider` is a plain
 * `useEffect`, not a react-query query, so nothing here can retry a failed
 * session read. Were that exemption ever dropped, `fetchMe()` would 503,
 * `loggedIn` would flip false, and the member would be dumped on the sign-in
 * page — while this screen's own copy promises "You're still signed in."
 *
 * The admin guard is the important part. An admin's requests never receive
 * PLATFORM_LOCKED (the backend bypasses them on role), so in normal operation
 * this never fires for them. But if it ever did — a stale flag, a race during a
 * role change — the maintenance screen would trap the one person who can lift
 * the lockdown, turning it into a one-way door recoverable only by editing the
 * database.
 *
 * Moderators are deliberately NOT exempted, despite counting as staff
 * elsewhere. They cannot lift a lockdown (`/admin/platform-settings` is
 * admin-only), and with `lockdownAllowsModerators` at its `false` default the
 * backend 503s their requests anyway — so exempting them protects nothing and
 * costs them the explanation, leaving them on blank, erroring pages instead.
 *
 * Recovery is automatic: while locked every child is unmounted, so no query is
 * left mounted to refetch and notice the lockdown lifting. Hence the poll below.
 */
export function PlatformLockProvider({ children }: { children: ReactNode }) {
  const { role, checking } = useAuth();
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setOnPlatformLocked((msg) => {
      setMessage(msg);
      setLocked(true);
    });
  }, []);

  // While locked, ask the public status endpoint (which is @LockdownExempt on
  // the backend, so it answers during a lockdown) whether it is over yet, and
  // let everyone back in when it says so. One cheap request every 30s beats
  // blindly retrying every cached app query — during an outage that difference
  // is the whole point. Errors are swallowed: still down, try again next tick.
  useEffect(() => {
    if (!locked) return;
    let cancelled = false;
    const id = setInterval(() => {
      void getPlatformStatus()
        .then((status) => {
          if (!cancelled && !status.locked) setLocked(false);
        })
        .catch(() => {});
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [locked]);

  const retry = useCallback(() => {
    // Just clear it: unlocking remounts the whole tree, and that remount IS the
    // refetch — every query the member's page actually uses mounts fresh. If
    // the lockdown is still on, the next failed request re-locks via the
    // callback, so they are never stranded on a screen that has stopped
    // reflecting reality.
    setLocked(false);
  }, []);

  // `role` is null while the session is still being read, so an admin who
  // somehow caught a 503 mid-check would flash the maintenance screen.
  if (locked && !checking && role !== "admin") {
    return <MaintenanceScreen message={message} onRetry={retry} />;
  }
  return <>{children}</>;
}
