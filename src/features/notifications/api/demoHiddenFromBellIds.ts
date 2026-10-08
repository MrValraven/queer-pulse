import type { Notification } from "../notifications.types";

/**
 * Demo rows the member hid from the nav bell this session.
 *
 * Demo mode has no server to remember a hide, and the demo feed is rebuilt
 * from the mock on every refetch: reopening the bell after the 30s stale time,
 * or any read or delete invalidating `["notifications"]`. The demo branches of
 * `useNotifications` and `useUnreadCount` read this set, so a hidden row stays
 * hidden and read until the page reloads, the same lifetime as the rest of the
 * demo's state. Live mode never touches it.
 */
export const demoHiddenFromBellIds = new Set<Notification["id"]>();
