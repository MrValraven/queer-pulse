import { useCallback, useState } from "react";
import { postDismissAnnouncement } from "../../api/platformStatus.api";
import { logError } from "../../observability/logger";

const LOCAL_STORAGE_KEY = "qp.announcement.dismissedVersion.v1";

/**
 * Signed-out visitors have no member row to attach a server-side dismissal
 * to, so their dismissal lives in `localStorage` instead — keyed by the
 * announcement's OWN version, not a plain boolean, so a brand-new
 * announcement always shows again even to someone who dismissed a previous
 * one. Best-effort: a read/write failure (private browsing, storage full)
 * just means the banner reappears next visit, which is harmless.
 */
function readLocallyDismissedVersion(): string | null {
  try {
    return window.localStorage.getItem(LOCAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLocallyDismissedVersion(version: string): void {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, version);
  } catch {
    // Best-effort only — see the doc comment above.
  }
}

/**
 * Dismissal state for the sitewide announcement banner (ADM-25).
 *
 * - Signed in, live: the source of truth is the server
 *   (`PlatformStatusDTO.announcementDismissed`); dismissing POSTs to
 *   `/announcement/:version/dismiss` (fire-and-forget — the click already
 *   hid the banner locally, so a failed request is logged, not surfaced).
 * - Signed out, or demo mode: no member to attach server state to, so
 *   dismissal is a `localStorage` flag keyed by `announcementVersion`. Demo
 *   mode additionally skips the write (the maintainer demos offline, and
 *   `usePlatformStatus`'s demo fixture never enables the banner anyway).
 *
 * Either way, an in-memory flag makes the dismiss itself feel instant instead
 * of waiting on a round-trip or a query refetch.
 */
export function useAnnouncementDismissal(
  version: string | null,
  serverDismissed: boolean,
  loggedIn: boolean,
  demoMode: boolean,
) {
  const [locallyDismissedVersion, setLocallyDismissedVersion] = useState(
    () => readLocallyDismissedVersion(),
  );

  const dismissed =
    version === null ||
    version === locallyDismissedVersion ||
    (loggedIn && serverDismissed);

  const dismiss = useCallback(() => {
    if (version === null) return;
    setLocallyDismissedVersion(version);
    if (loggedIn) {
      if (!demoMode) {
        void postDismissAnnouncement(version).catch((error: unknown) => {
          logError(error, { scope: "announcement.dismiss" });
        });
      }
      return;
    }
    if (!demoMode) {
      writeLocallyDismissedVersion(version);
    }
  }, [version, loggedIn, demoMode]);

  return { dismissed, dismiss };
}
