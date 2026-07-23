import { apiGet, apiPost } from "../../../shared/api/client";
import type { NotificationKind } from "./formatNotification";

/**
 * A notification exactly as the backend serves it — the `notifications` entity,
 * raw (`GET /notifications` returns entity rows, no view mapper). Display text
 * is NOT sent: the API stays language-neutral and the frontend renders
 * `type` + `payload` through i18n. See `formatNotification`.
 *
 * `type` is widened past {@link NotificationKind} on purpose. The backend enum
 * can gain a member without a frontend deploy, and an unrecognised value must
 * degrade to the generic fallback rather than blank the row.
 */
/**
 * The member whose action triggered a person-based notification (connection
 * request/accept, vouch, introduction, event invite), resolved server-side so
 * the row can name them, show their avatar, and link to their profile. Absent
 * (or null) for system notifications and any row whose actor can't be resolved.
 */
export interface NotificationActorDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface NotificationDTO {
  /** A uuid — not a number. */
  id: string;
  userId: string;
  type: NotificationKind | (string & {});
  /** Structured jsonb. Opaque IDs only — display names come via `actor`. */
  payload: Record<string, unknown>;
  /** The backend's field. The view-model inverts this to `unread`. */
  read: boolean;
  /** ISO timestamp. */
  createdAt: string;
  /** The acting member, when the backend could resolve one. */
  actor?: NotificationActorDTO | null;
}

/**
 * Paginated list envelope the backend wraps notification rows in. This already
 * matches what `NotificationsService.list()` returns.
 */
interface NotificationsPage {
  items: NotificationDTO[];
  page: number;
  hasMore: boolean;
}

/**
 * GET /notifications — optionally filtered to unread only. The backend answers
 * with a `{ items, page, hasMore }` envelope, so we unwrap to the row array the
 * hooks expect. Tolerates a bare array too, in case the endpoint is ever
 * un-paginated.
 */
export const getNotifications = async (
  unread?: boolean,
): Promise<NotificationDTO[]> => {
  const res = await apiGet<NotificationsPage | NotificationDTO[]>(
    `/notifications${unread ? "?unread=true" : ""}`,
  );
  return Array.isArray(res) ? res : (res?.items ?? []);
};

/**
 * GET /notifications/unread-count — the true unread total for the bell badge.
 *
 * Counted server-side across every notification, so it stays correct past the
 * first page. Deriving it from the fetched feed instead would silently cap the
 * badge at the page size.
 */
export const getUnreadCount = async (): Promise<number> => {
  const res = await apiGet<{ count: number }>("/notifications/unread-count");
  return res?.count ?? 0;
};

/** POST /notifications/:id/read — mark a single notification read. */
export const markNotificationRead = (id: number | string) =>
  apiPost<{ ok: true }>(`/notifications/${id}/read`);

/** POST /notifications/read-all — mark every notification read. */
export const markAllNotificationsRead = () =>
  apiPost<{ ok: true }>("/notifications/read-all");
