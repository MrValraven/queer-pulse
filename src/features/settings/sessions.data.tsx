import type { ReactNode } from "react";

/**
 * Demo fallback for `SessionsPage`. Live mode fetches the real
 * `GET /account/sessions` instead (see `api/useSessions.ts`); this mock is the
 * demo branch only, and is the richer of the two shapes — the backend's
 * refresh-token store has no location column, so `location` is optional and
 * simply absent in live mode rather than invented (see
 * `api/sessions.adapters.ts`).
 */

export type SessionVariant = "current" | "suspect" | "normal";
export type DeviceType = "desktop" | "mobile";

export interface Session {
  id: string;
  device: string;
  variant: SessionVariant;
  deviceType: DeviceType;
  /** Where the session was seen. Demo-only — the backend stores no geo/IP. */
  location?: ReactNode;
  /** When this device signed in. */
  signedIn: string;
  /**
   * Roughly when this device was last seen. Live mode derives it from the
   * session's last token rotation, and leaves it undefined when that would only
   * restate `signedIn` (see `api/sessions.adapters.ts`).
   */
  lastActivity?: string;
  /**
   * The raw User-Agent the device sent at sign-in, shown only inside the card's
   * expandable "technical detail" disclosure.
   *
   * `device` is the line a member actually reads; this is the string that line
   * was derived from, kept reachable for the one case where it matters — a
   * member comparing two devices that produce the same coarse label, or
   * pasting the exact string into a support message. Undefined when the client
   * sent no UA, which collapses the disclosure entirely rather than showing an
   * empty one.
   */
  userAgent?: string;
  extra?: string;
}

export const ACTIVE_SESSIONS: Session[] = [
  {
    id: "macbook",
    device: "MacBook Pro · Safari 18",
    variant: "current",
    deviceType: "desktop",
    location: (
      <>
        🇵🇹 <b>Lisbon</b>, Portugal · <b>home network</b> · 192.168.•••
      </>
    ),
    signedIn: "4 hours ago",
    lastActivity: "2 min ago",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  },
  {
    id: "iphone",
    device: "iPhone 14 · QueerPulse app 2.4.1",
    variant: "normal",
    deviceType: "mobile",
    location: (
      <>
        🇵🇹 <b>Lisbon</b>, Portugal · <b>MEO mobile</b>
      </>
    ),
    signedIn: "23 days ago",
    lastActivity: "40 min ago",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  },
  {
    id: "imac",
    device: "Studio iMac · Chrome 138",
    variant: "normal",
    deviceType: "desktop",
    location: (
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
    location: (
      <>
        🇪🇸 <b>Madrid</b>, Spain · <b>unfamiliar network</b>
      </>
    ),
    signedIn: "14h ago",
    lastActivity: "11h ago",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
    extra: "New location",
  },
  {
    id: "ipad",
    device: "iPad Pro · Safari 18",
    variant: "normal",
    deviceType: "mobile",
    location: (
      <>
        🇵🇹 <b>Lisbon</b>, Portugal · <b>home</b>
      </>
    ),
    signedIn: "2 months ago",
    lastActivity: "last Sunday",
  },
];
