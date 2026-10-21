import { useState, useSyncExternalStore } from "react";
import {
  readAnnouncement,
  SILENT_ANNOUNCEMENT,
  subscribeAnnouncements,
} from "../studioPlayerAnnouncer";

/** The player's polite line, repeated inside Now playing. The sheet is an
 *  `aria-modal` dialog, so a screen reader can skip the body-level region
 *  (StudioPlayerLiveRegion) while it is open; this one lives in the dialog.
 *  It speaks only what arrives after the sheet opened, so opening never
 *  reads the last line again. */
export function StudioNowPlayingAnnouncer() {
  const announcement = useSyncExternalStore(
    subscribeAnnouncements,
    readAnnouncement,
    () => SILENT_ANNOUNCEMENT,
  );
  const [countAtOpen] = useState(() => readAnnouncement().count);
  const isNew = announcement.count > countAtOpen;
  return (
    <div
      className="visuallyHidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span key={announcement.count}>{isNew ? announcement.message : ""}</span>
    </div>
  );
}
