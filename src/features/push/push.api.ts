import { apiPost } from "../../shared/api/client";

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
