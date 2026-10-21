import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  readAnnouncement,
  SILENT_ANNOUNCEMENT,
  subscribeAnnouncements,
} from "./studioPlayerAnnouncer";

/** The player's one polite live region. It portals to <body>, outside the
 *  bar, so a closing bar or an inert page never silences it. */
export function StudioPlayerLiveRegion() {
  const announcement = useSyncExternalStore(
    subscribeAnnouncements,
    readAnnouncement,
    () => SILENT_ANNOUNCEMENT,
  );
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="visuallyHidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-studio-player-announcer=""
    >
      <span key={announcement.count}>{announcement.message}</span>
    </div>,
    document.body,
  );
}
