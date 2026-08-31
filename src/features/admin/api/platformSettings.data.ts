import type { Paginated } from "../../../shared/api/refs";
import type {
  PlatformSettingChangeDTO,
  PlatformSettingsDTO,
} from "./platformSettings.api";

/**
 * The one admin in the demo trail. A `MemberRefDTO`, matching what the backend
 * now resolves `actorId` into (ENG-43): the History tab used to print the raw
 * uuid, which answered nobody's question.
 */
const DEMO_ACTOR = {
  slug: "ana-ferreira",
  firstName: "Ana",
  lastName: "Ferreira",
  avatarUrl: null,
};

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
};

/**
 * A plausible trail so the History tab has something to render offline, in the
 * same `Paginated` envelope the live endpoint now answers with (ENG-50), so the
 * demo path exercises the same shape the live one does.
 */
export const DEMO_PLATFORM_SETTING_CHANGES: Paginated<PlatformSettingChangeDTO> =
  {
    items: [
      {
        id: "chg-3",
        actor: DEMO_ACTOR,
        settingKey: "lockdownEnabled",
        oldValue: "true",
        newValue: "false",
        note: "Spam wave cleared.",
        createdAt: "2026-07-18T09:14:00.000Z",
      },
      {
        id: "chg-2",
        actor: DEMO_ACTOR,
        settingKey: "joinRequestsEnabled",
        oldValue: "true",
        newValue: "false",
        note: "Spam wave: pausing intake.",
        createdAt: "2026-07-18T08:02:00.000Z",
      },
      {
        id: "chg-1",
        actor: DEMO_ACTOR,
        settingKey: "lockdownEnabled",
        oldValue: "false",
        newValue: "true",
        note: "Spam wave: pausing intake.",
        createdAt: "2026-07-18T08:02:00.000Z",
      },
    ],
    total: 3,
    page: 1,
    pageSize: 50,
  };
