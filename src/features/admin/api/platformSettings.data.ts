import type {
  PlatformSettingChangeDTO,
  PlatformSettingsDTO,
} from "./platformSettings.api";

/** Demo seed: everything open, no lockdown — the normal operating state. */
export const DEMO_PLATFORM_SETTINGS: PlatformSettingsDTO = {
  registrationEnabled: true,
  joinRequestsEnabled: true,
  lockdownEnabled: false,
  lockdownAllowsModerators: false,
  lockdownMessage: null,
  registrationClosedMessage: null,
  announcementEnabled: false,
  announcementMessage: null,
  announcementExpiresAt: null,
  announcementVersion: "00000000-0000-0000-0000-000000000000",
  updatedAt: "2026-07-18T09:14:00.000Z",
  updatedBy: null,
};

/** A plausible trail so the History tab has something to render offline. */
export const DEMO_PLATFORM_SETTING_CHANGES: PlatformSettingChangeDTO[] = [
  {
    id: "chg-3",
    actorId: "admin-1",
    settingKey: "lockdownEnabled",
    oldValue: "true",
    newValue: "false",
    note: "Spam wave cleared.",
    createdAt: "2026-07-18T09:14:00.000Z",
  },
  {
    id: "chg-2",
    actorId: "admin-1",
    settingKey: "joinRequestsEnabled",
    oldValue: "true",
    newValue: "false",
    note: "Spam wave: pausing intake.",
    createdAt: "2026-07-18T08:02:00.000Z",
  },
  {
    id: "chg-1",
    actorId: "admin-1",
    settingKey: "lockdownEnabled",
    oldValue: "false",
    newValue: "true",
    note: "Spam wave: pausing intake.",
    createdAt: "2026-07-18T08:02:00.000Z",
  },
];
