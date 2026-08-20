import type { DeviceKind } from "../../shared/lib/deviceUserAgent";

/**
 * Demo fallback for `PushDevicesPage`. Live mode fetches the real
 * `GET /push/subscriptions` instead (see `api/usePushDevices.ts`) and maps it
 * onto this same shape (see `api/pushDevices.adapters.ts`) so the page code
 * never branches on demo vs. live.
 */

export interface PushDevice {
  id: string;
  device: string;
  deviceType: DeviceKind;
  registeredAgo: string;
  /** Absent when the backend has never sent this device a push yet. */
  lastUsedAgo?: string;
}

export const DEMO_PUSH_DEVICES: PushDevice[] = [
  {
    id: "iphone",
    device: "iPhone · Safari",
    deviceType: "mobile",
    registeredAgo: "23 days ago",
    lastUsedAgo: "40 minutes ago",
  },
  {
    id: "macbook",
    device: "macOS · Chrome",
    deviceType: "desktop",
    registeredAgo: "3 months ago",
    lastUsedAgo: "2 hours ago",
  },
  {
    id: "ipad",
    device: "iPad · Safari",
    deviceType: "mobile",
    registeredAgo: "6 months ago",
  },
];
