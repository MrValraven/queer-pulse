import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import { formatRelative } from "../../../shared/lib/date";
import {
  getMagazineNotifications,
  markMagazineNotificationsRead,
  type MagazineNotificationDto,
} from "./pieces.api";
import { DESK_NOTIFICATIONS, type DeskNotification } from "../desk/deskNotifications.data";

/**
 * Canonical desk-notification row — the shape `DeskNotifications` renders,
 * shared by demo and live so the component never branches on `demoMode`.
 * Demo tone `'good'` and live tone `'normal'` both converge on `'normal'`
 * here; only `'warn'` gets the coral accent. `route` is a real FE path when
 * the row has somewhere honest to send an editor, or `""` when it doesn't
 * (some demo rows aren't linked to a specific piece) — the caller treats a
 * non-empty `route` as navigable. `when` is always a ready-to-render display
 * string (demo ships one already; live's ISO timestamp is run through the
 * shared `formatRelative` helper below).
 */
export interface DeskNotificationView {
  id: string;
  who: string;
  what: string;
  when: string;
  route: string;
  tone: "normal" | "warn";
  isUnread: boolean;
}

/** Demo rows use an enum `route` key, not a URL (Phase 1 had nothing to link
 *  to). Only `pitches` has a standing real route (`/magazine/pitches`); the
 *  rest fall back to `""` (non-navigable) rather than guessing a piece id
 *  from free-form demo copy. */
const DEMO_ROUTE_TO_PATH: Record<DeskNotification["route"], string> = {
  piece: "",
  money: "",
  pitches: "/magazine/pitches",
  after: "",
};

// Demo mode has no read-cursor backend, so its rows always read as unread —
// matches the panel's old always-shown badge count in demo.
function mapDemoNotification(notification: DeskNotification, index: number): DeskNotificationView {
  return {
    id: `demo-notification-${index}`,
    who: notification.who,
    what: notification.what,
    when: notification.when,
    route: DEMO_ROUTE_TO_PATH[notification.route],
    tone: notification.tone === "warn" ? "warn" : "normal",
    isUnread: true,
  };
}

function mapLiveNotification(
  dto: MagazineNotificationDto,
  formatters: Formatters,
): DeskNotificationView {
  return {
    id: dto.id,
    who: dto.who,
    what: dto.what,
    when: formatRelative(dto.when, formatters) || dto.when,
    route: dto.route,
    tone: dto.tone,
    isUnread: dto.isUnread,
  };
}

type RawNotificationsFeed =
  | { kind: "demo"; rows: DeskNotification[] }
  | { kind: "live"; rows: MagazineNotificationDto[] };

/**
 * The desk bell's "Since Friday" activity panel. Demo mode reads the static
 * `DESK_NOTIFICATIONS` fixture; live mode calls
 * `GET /magazine/admin/notifications` (newest-first, ~20 rows, built from the
 * real `magazine_piece_event` log). The view mapping runs outside the query
 * function (using the current `useFormat()` formatters) so a language switch
 * re-renders "when" immediately instead of waiting on a cache invalidation.
 * `unreadCount` drives the sidebar bell badge; `markAllRead` advances the
 * viewer's server-side read cursor (a no-op in demo mode, which has none) and
 * refetches so the badge actually clears.
 */
export function useMagazineNotifications() {
  const { demoMode } = useDemoMode();
  const formatters = useFormat();
  const queryClient = useQueryClient();

  const query = useQuery<RawNotificationsFeed>({
    queryKey: ["magazine-notifications", demoMode],
    queryFn: async () => {
      if (demoMode) return { kind: "demo", rows: DESK_NOTIFICATIONS };
      return { kind: "live", rows: await getMagazineNotifications() };
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markMagazineNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-notifications"] });
    },
  });

  function markAllRead() {
    if (demoMode) return;
    markReadMutation.mutate();
  }

  if (!query.data) {
    return {
      notifications: [] as DeskNotificationView[],
      unreadCount: 0,
      isLoading: query.isLoading,
      isError: query.isError,
      markAllRead,
    };
  }

  const notifications =
    query.data.kind === "demo"
      ? query.data.rows.map(mapDemoNotification)
      : query.data.rows.map((dto) => mapLiveNotification(dto, formatters));
  const unreadCount = notifications.filter((notification) => notification.isUnread).length;

  return { notifications, unreadCount, isLoading: false, isError: query.isError, markAllRead };
}
