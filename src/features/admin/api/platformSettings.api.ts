import { apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";

/**
 * The three runtime platform kill switches (admin-only). Backed by a singleton
 * `platform_settings` row; every change writes one audit row per changed field.
 *
 * Changes take effect within ~10s — the backend caches the row with a short TTL
 * so the lockdown check does not cost a query on every request. The UI states
 * that rather than implying the switch is instant.
 */
export interface PlatformSettingsDTO {
  registrationEnabled: boolean;
  joinRequestsEnabled: boolean;
  lockdownEnabled: boolean;
  lockdownAllowsModerators: boolean;
  lockdownMessage: string | null;
  /** Shared by BOTH the registration and join-request closed states. */
  registrationClosedMessage: string | null;
  /** Sitewide announcement banner (ADM-25) — independent of the switches above. */
  announcementEnabled: boolean;
  announcementMessage: string | null;
  /** ISO 8601, or `null` for no auto-hide. */
  announcementExpiresAt: string | null;
  /** Bumped to a fresh UUID whenever `announcementMessage` changes. */
  announcementVersion: string;
  /** ISO 8601. When the row was last written, by anyone. */
  updatedAt: string;
}

/** One changed field. A save that flips two switches produces two of these. */
export interface PlatformSettingChangeDTO {
  id: string;
  /**
   * Who made the change, already resolved to a name by the backend. NULL when
   * there is no name left to give: the acting admin erased their account (the
   * trail deliberately outlives them), or they never had a profile row.
   */
  actor: MemberRefDTO | null;
  settingKey: string;
  oldValue: string | null;
  newValue: string | null;
  note: string | null;
  createdAt: string;
}

/** Partial update. Omitted fields are left alone; `null` clears a message. */
export interface UpdatePlatformSettingsInput {
  registrationEnabled?: boolean;
  joinRequestsEnabled?: boolean;
  lockdownEnabled?: boolean;
  lockdownAllowsModerators?: boolean;
  lockdownMessage?: string | null;
  registrationClosedMessage?: string | null;
  announcementEnabled?: boolean;
  announcementMessage?: string | null;
  /** ISO 8601; pass `null` to clear. */
  announcementExpiresAt?: string | null;
  note?: string;
}

export const getPlatformSettings = () =>
  apiGet<PlatformSettingsDTO>("/admin/platform-settings");

export const updatePlatformSettings = (body: UpdatePlatformSettingsInput) =>
  apiPatch<PlatformSettingsDTO>("/admin/platform-settings", body);

/**
 * The audit trail, newest first, in the standard `Paginated` envelope. This
 * endpoint is queried by `limit`/`offset` rather than `page` (it predates the
 * shared page-based convention); the envelope's `page`/`pageSize` are derived
 * from those by the backend, and `total` is the whole row count, which is what
 * lets the History tab say whether what it is showing is all of it.
 */
export const getPlatformSettingChanges = (limit = 50, offset = 0) =>
  apiGet<Paginated<PlatformSettingChangeDTO>>(
    `/admin/platform-settings/changes?limit=${limit}&offset=${offset}`,
  );
