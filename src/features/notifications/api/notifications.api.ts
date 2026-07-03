import { apiGet, apiPost } from "../../../shared/api/client";
import type { NotifType } from "../notifications.types";

/**
 * A notification as returned by the backend. Only the fields the API actually
 * serves; the richer prototype view-model (avatars, action buttons, icon
 * glyphs) is layered on in the adapter, defaulting anything the API omits.
 */
export interface NotificationDTO {
  id: number | string;
  /** Semantic category; the frontend maps each to a tab + icon. */
  type: NotifType;
  unread: boolean;
  /** Plain-text body of the notification. */
  text: string;
  /** Sub-line ("Event · Gathering", "Private message", …). */
  meta?: string;
  /** Relative or absolute time label the row shows ("2 min ago"). */
  time?: string;
  /** ISO timestamp, if the API sends one instead of a pre-formatted label. */
  createdAt?: string;
}

/** GET /notifications — optionally filtered to unread only. */
export const getNotifications = (unread?: boolean) =>
  apiGet<NotificationDTO[]>(`/notifications${unread ? "?unread=true" : ""}`);

/** POST /notifications/:id/read — mark a single notification read. */
export const markNotificationRead = (id: number | string) =>
  apiPost<{ ok: true }>(`/notifications/${id}/read`);

/** POST /notifications/read-all — mark every notification read. */
export const markAllNotificationsRead = () =>
  apiPost<{ ok: true }>("/notifications/read-all");
