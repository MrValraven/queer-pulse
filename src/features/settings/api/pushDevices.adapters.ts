import type { TFunction } from "../../../shared/i18n/types";
import type { Formatters } from "../../../shared/i18n/format";
import {
  deviceKindFromUserAgent,
  deviceLabelFromUserAgent,
} from "../../../shared/lib/deviceUserAgent";
import { relativeAgo } from "../../../shared/lib/relativeAgo";
import type { PushSubscriptionResponse } from "../../push/push.api";
import type { PushDevice } from "../pushDevices.data";

/**
 * Maps a live `PushSubscriptionResponse` onto the page's local `PushDevice`
 * shape — the same type `PushDevicesPage` already renders in demo mode.
 *
 * `GET /push/subscriptions` deliberately omits the Web Push credentials
 * (`endpoint` / `p256dh` / `auth`), so the device label is derived from the
 * raw `userAgent` alone, the same way `sessions.adapters.ts` derives a
 * session's device label (shared parsing in `shared/lib/deviceUserAgent.ts`).
 */

const PUSH_DEVICE_AGO_KEYS = {
  justNow: "settings:pushDevices.ago.justNow",
  unknown: "settings:pushDevices.ago.unknown",
};

export function pushSubscriptionResponseToDevice(
  dto: PushSubscriptionResponse,
  t: TFunction,
  fmt: Formatters,
  now?: number,
): PushDevice {
  const userAgent = dto.userAgent ?? "";
  return {
    id: dto.id,
    device: deviceLabelFromUserAgent(userAgent),
    deviceType: deviceKindFromUserAgent(userAgent),
    registeredAgo: relativeAgo(dto.createdAt, t, fmt, PUSH_DEVICE_AGO_KEYS, now),
    lastUsedAgo: dto.lastUsedAt
      ? relativeAgo(dto.lastUsedAt, t, fmt, PUSH_DEVICE_AGO_KEYS, now)
      : undefined,
  };
}
