import type { ReactNode } from "react";

export type SessionVariant = "current" | "trusted" | "suspect" | "normal";
export type DeviceType = "desktop" | "mobile";

export interface Session {
  id: string;
  device: string;
  variant: SessionVariant;
  deviceType: DeviceType;
  loc: ReactNode;
  signedIn: string;
  lastActivity: string;
  extra?: string;
}

export interface TrustedDevice {
  id: string;
  device: string;
  deviceType: DeviceType;
  since: string;
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
    extra: "2FA on this device",
  },
  {
    id: "iphone",
    device: "iPhone 14 · QueerPulse app 2.4.1",
    variant: "trusted",
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
    extra: "2FA used — but new location",
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

export const TRUSTED_DEVICES: TrustedDevice[] = [
  {
    id: "td-macbook",
    device: "MacBook Pro · This device",
    deviceType: "desktop",
    since: "14 Mar 2026",
    extra: "Re-confirmed every 90 days",
  },
  {
    id: "td-iphone",
    device: "iPhone 14",
    deviceType: "mobile",
    since: "17 May 2026",
  },
];
