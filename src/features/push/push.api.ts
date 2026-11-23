import { apiDelete, apiGet, apiPost } from "../../shared/api/client";

export interface PushSubscribePayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * This device's push endpoint as last seen by the subscription sync or a
 * successful subscribe, held in memory so Quick Exit can read it
 * synchronously and send it with its logout (the backend then drops the push
 * row in the same request). Null until a sync or subscribe has run on this
 * page.
 */
let thisDevicePushEndpoint: string | null = null;

/** Remember (or, with null, forget) this device's push endpoint. */
export function rememberThisDevicePushEndpoint(endpoint: string | null): void {
  thisDevicePushEndpoint = endpoint;
}

/** This device's push endpoint, when this page has learned it. */
export function readThisDevicePushEndpoint(): string | null {
  return thisDevicePushEndpoint;
}

/** POST /push/subscribe — register this device for Web Push. */
export const subscribePush = async (payload: PushSubscribePayload) => {
  const result = await apiPost<{ ok: true }>("/push/subscribe", payload);
  rememberThisDevicePushEndpoint(payload.endpoint);
  return result;
};

/**
 * POST /push/unsubscribe: drop this device's subscription when the member turns
 * push off. Sign-out does not call it: `POST /auth/logout` carries the endpoint
 * and removes the row in the same request.
 */
export const unsubscribePush = async (endpoint: string) => {
  const result = await apiPost<{ ok: true }>("/push/unsubscribe", {
    endpoint,
  });
  if (thisDevicePushEndpoint === endpoint) rememberThisDevicePushEndpoint(null);
  return result;
};

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
