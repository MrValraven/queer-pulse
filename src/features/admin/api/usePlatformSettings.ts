import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Paginated } from "../../../shared/api/refs";
import {
  DEMO_PLATFORM_SETTINGS,
  DEMO_PLATFORM_SETTING_CHANGES,
} from "./platformSettings.data";
import {
  getPlatformSettingChanges,
  getPlatformSettings,
  updatePlatformSettings,
  type PlatformSettingChangeDTO,
  type PlatformSettingsDTO,
  type UpdatePlatformSettingsInput,
} from "./platformSettings.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

const SETTINGS_KEY = "platform-settings";
const CHANGES_KEY = "platform-setting-changes";

/**
 * The current kill-switch state. Demo mode returns the colocated fixture and
 * never hits the network — these are admin-only endpoints that 403 for anyone
 * else, and the maintainer demos offline.
 */
export function usePlatformSettings() {
  const { demoMode } = useDemoMode();
  return useQuery<PlatformSettingsDTO>({
    queryKey: [SETTINGS_KEY, demoMode],
    initialData: demoMode ? DEMO_PLATFORM_SETTINGS : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_PLATFORM_SETTINGS;
      return getPlatformSettings();
    },
  });
}

/**
 * The audit trail, newest first, as the `Paginated` envelope the endpoint now
 * answers with (ENG-50). The envelope, not just its `items`: `total` is the
 * whole row count, and it is the only thing that lets the History tab say
 * whether what an admin is looking at is all of it. A bare array left them
 * unable to tell a last page from a truncated one, which on an audit trail is
 * the difference between "nobody else touched this" and "somebody did and you
 * cannot see it".
 */
export function usePlatformSettingChanges() {
  const { demoMode } = useDemoMode();
  return useQuery<Paginated<PlatformSettingChangeDTO>>({
    queryKey: [CHANGES_KEY, demoMode],
    initialData: demoMode ? DEMO_PLATFORM_SETTING_CHANGES : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_PLATFORM_SETTING_CHANGES;
      return getPlatformSettingChanges();
    },
  });
}

/**
 * Flip one or more switches. Demo mode is a no-op — the page keeps its local
 * optimistic state so the toggles still feel live offline, exactly as the
 * moderation queue does.
 *
 * Both queries are invalidated on settle: a failed save rolls the UI back to
 * server truth, and a successful one refreshes the audit trail the History tab
 * reads.
 */
export function useUpdatePlatformSettings() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, UpdatePlatformSettingsInput>({
    demoMode,
    demoLatencyMs: 0,
    // AdminSettingsAccess + LockdownBanner toast their own error, so silence the
    // global duplicate.
    meta: { silentError: true },
    demoResult: () => undefined,
    live: async (input) => {
      await updatePlatformSettings(input);
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] });
      void queryClient.invalidateQueries({ queryKey: [CHANGES_KEY] });
    },
  });
}
