import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * The member's new-device sign-in alert switch.
 *
 * Deliberately its own endpoint pair rather than another
 * `NotificationPreferenceCategory`: those categories are content-volume
 * controls ("gathering invites", "replies to my threads") stored in
 * `notification_preferences`, and a security alert is not content. This one
 * lives on `member_preferences` beside the other account-level switches, which
 * is also why it sits on the Account pane next to Active sessions rather than
 * on the Notifications pane.
 *
 * The switch governs DELIVERY only. Turning it off stops the backend emitting
 * the alert, so no bell row is written and no push is sent; the session itself
 * and its device label are still recorded, and `/account/sessions` still lists
 * every device. Going quiet never costs the member the record.
 */
export interface LoginAlertsDTO {
  enabled: boolean;
}

/**
 * Alerts default ON for a member who has never opened settings. Mirrors the
 * backend's `DEFAULT_LOGIN_ALERTS_ENABLED`, and is what the toggle renders
 * before the first fetch resolves so the row never flickers from off to on.
 */
export const DEFAULT_LOGIN_ALERTS_ENABLED = true;

/** GET /me/login-alerts — never 404s; synthesises the default when unset. */
export const getLoginAlerts = () => apiGet<LoginAlertsDTO>("/me/login-alerts");

/** PUT /me/login-alerts — echoes back what was actually stored. */
export const putLoginAlerts = (enabled: boolean) =>
  apiPut<LoginAlertsDTO>("/me/login-alerts", { enabled });
