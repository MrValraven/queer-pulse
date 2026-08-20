import { apiDelete, apiGet, apiPost } from "../../shared/api/client";

export interface PushSubscribePayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** POST /push/subscribe — register this device for Web Push. */
export const subscribePush = (payload: PushSubscribePayload) =>
  apiPost<{ ok: true }>("/push/subscribe", payload);

/** POST /push/unsubscribe — drop this device's subscription. */
export const unsubscribePush = (endpoint: string) =>
  apiPost<{ ok: true }>("/push/unsubscribe", { endpoint });

/** POST /push/test — send this member a single test push to their devices. */
export const testPush = () => apiPost<{ ok: true }>("/push/test", {});

/**
 * One push subscription (device), verbatim from `GET /push/subscriptions`.
 *
 * The backend deliberately omits the Web Push credentials (`endpoint`,
 * `p256dh`, `auth`) from this shape — they're delivery secrets, not
 * information a member needs to recognise "which device is this". See
 * `queerpulse-backend/src/push/push-response.ts`.
 */
export interface PushSubscriptionResponse {
  id: string;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

/** GET /push/subscriptions — every device registered for the caller's pushes, newest first. */
export const listPushSubscriptions = () =>
  apiGet<PushSubscriptionResponse[]>("/push/subscriptions");

/**
 * DELETE /push/subscriptions/:id — remotely revoke one device's push
 * subscription (e.g. a lost/stolen phone the member can no longer unsubscribe
 * from itself). Scoped server-side to the caller's own subscriptions.
 */
export const revokePushSubscription = (id: string) =>
  apiDelete<void>(`/push/subscriptions/${id}`);
