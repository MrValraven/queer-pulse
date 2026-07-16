import type { ReactNode } from "react";

/**
 * Demo fallback for `SessionsPage`. Live mode fetches the real
 * `GET /account/sessions` instead (see `api/useSessions.ts`); this mock is the
 * demo branch only, and is the richer of the two shapes — the backend's
 * refresh-token store has no location or last-activity column, so `loc` and
 * `lastActivity` are optional and simply absent in live mode rather than
 * invented (see `api/sessions.adapters.ts`).
 */

export type SessionVariant = "current" | "suspect" | "normal";
export type DeviceType = "desktop" | "mobile";

export interface Session {
  id: string;
  device: string;
  variant: SessionVariant;
  deviceType: DeviceType;
  /** Where the session was seen. Demo-only — the backend stores no geo/IP. */
  loc?: ReactNode;
  signedIn: string;
  /** Demo-only — the backend stores no last-seen timestamp. */
  lastActivity?: string;
  extra?: string;
}

export const ACTIVE_SESSIONS: Session[] = [
  {
    id: "macbook",
    device: "MacBook Pro · Safari 18",
    variant: "current",
    deviceType: "desktop",
    loc: (
      <>
        🇵🇹 <b>Lisbon</b>, Portugal · <b>home network</b> · 192.168.•••
      </>
    ),
    signedIn: "4 hours ago",
    lastActivity: "2 min ago",
  },
  {
    id: "iphone",
    device: "iPhone 14 · QueerPulse app 2.4.1",
    variant: "normal",
    deviceType: "mobile",
    loc: (
      <>
        🇵🇹 <b>Lisbon</b>, Portugal · <b>MEO mobile</b>
      </>
    ),
    signedIn: "23 days ago",
    lastActivity: "40 min ago",
  },
  {
    id: "imac",
    device: "Studio iMac · Chrome 138",
    variant: "normal",
    deviceType: "desktop",
    loc: (
      <>
        🇵🇹 <b>Atelier Pulso office, Largo do Carmo</b>
      </>
    ),
    signedIn: "8 days ago",
    lastActivity: "this morning, 9:14",
  },
  {
    id: "firefox",
    device: "Unknown · Firefox 132 · macOS",
    variant: "suspect",
    deviceType: "desktop",
    loc: (
      <>
        🇪🇸 <b>Madrid</b>, Spain · <b>unfamiliar network</b>
      </>
    ),
    signedIn: "14h ago",
    lastActivity: "11h ago",
    extra: "New location",
  },
  {
    id: "ipad",
    device: "iPad Pro · Safari 18",
    variant: "normal",
    deviceType: "mobile",
    loc: (
      <>
        🇵🇹 <b>Lisbon</b>, Portugal · <b>home</b>
      </>
    ),
    signedIn: "2 months ago",
    lastActivity: "last Sunday",
  },
];
