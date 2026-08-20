import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { listPushSubscriptions } from "../../push/push.api";
import { DEMO_PUSH_DEVICES, type PushDevice } from "../pushDevices.data";
import { pushSubscriptionResponseToDevice } from "./pushDevices.adapters";

/** `language` is joined in — the adapted "registered X ago" strings are
 * locale-dependent (`fmt.relativeTime`), so a language switch must invalidate
 * the cached result rather than keep showing the previous language's phrasing. */
export function pushDevicesQueryKey(language: string) {
  return ["push", "subscriptions", language] as const;
}

export interface PushDevicesResult {
  devices: PushDevice[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when the live fetch failed — the page says so instead of showing nothing. */
  failed: boolean;
  /** Re-fetch after a remove, so the list reflects the server, not our guess. */
  refetch: () => void;
}

/** Stable empty array so the "no data yet" case doesn't churn identity every render. */
const EMPTY_DEVICES: PushDevice[] = [];

/**
 * Data source for `PushDevicesPage`.
 *
 * Demo mode returns the page's own `DEMO_PUSH_DEVICES` mock unchanged. Live
 * mode calls `GET /push/subscriptions` and maps each row onto the page's
 * `PushDevice` shape. Unpaginated by design, mirroring `useSessions` — a
 * member has, at most, a handful of registered devices.
 */
export function usePushDevices(): PushDevicesResult {
  const { demoMode } = useDemoMode();
  const { language, t } = useTranslation();
  const fmt = useFormat();

  const query = useQuery<PushDevice[]>({
    queryKey: pushDevicesQueryKey(language),
    enabled: !demoMode,
    queryFn: async () => {
      const rows = await listPushSubscriptions();
      return rows.map((row) => pushSubscriptionResponseToDevice(row, t, fmt));
    },
  });

  if (demoMode) {
    return {
      devices: DEMO_PUSH_DEVICES,
      loading: false,
      failed: false,
      refetch: () => {},
    };
  }
  return {
    devices: query.data ?? EMPTY_DEVICES,
    loading: query.isPending,
    failed: query.isError,
    refetch: () => void query.refetch(),
  };
}
