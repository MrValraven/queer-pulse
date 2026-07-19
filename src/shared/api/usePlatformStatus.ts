import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { getPlatformStatus, type PlatformStatusDTO } from "./platformStatus.api";

/** Demo: everything open. The prototype is never "closed". */
const DEMO_STATUS: PlatformStatusDTO = {
  registrationOpen: true,
  joinRequestsOpen: true,
  locked: false,
  lockdownMessage: null,
  registrationClosedMessage: null,
};

/**
 * Lets the sign-in and request-invite pages render a closed state BEFORE the
 * visitor submits, instead of bouncing them through Google OAuth only to reject
 * them at the callback.
 *
 * This is UX only — the backend enforces every flag independently, so a stale
 * or failed read here cannot let anyone through. That is why the query fails
 * soft: `retry: false` and consumers treat an error as "assume open", since a
 * status endpoint that is briefly unreachable must not block a legitimate
 * sign-in.
 *
 * Failing soft has to include the toast path too, hence `meta.silentError`.
 * Without it a briefly-flaky status endpoint would greet a brand-new visitor
 * on a perfectly healthy platform with "Something went wrong on our end" —
 * an error about a request they never made, on a page that renders exactly the
 * same with or without the answer.
 */
export function usePlatformStatus() {
  const { demoMode } = useDemoMode();
  return useQuery<PlatformStatusDTO>({
    queryKey: ["platform-status", demoMode],
    initialData: demoMode ? DEMO_STATUS : undefined,
    meta: { silentError: true },
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      if (demoMode) return DEMO_STATUS;
      return getPlatformStatus();
    },
  });
}
