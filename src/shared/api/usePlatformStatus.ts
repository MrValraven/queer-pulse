import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  getPlatformStatus,
  type PlatformStatusDTO,
} from "./platformStatus.api";

/**
 * Demo: everything open. The prototype is never "closed". `guidelinesVersion`
 * is a static literal here (no backend to read it from in demo mode) — that
 * is expected demo-fallback duplication, not the drift this field exists to
 * remove, since `postCompleteOnboarding` is never called in demo mode anyway.
 */
const DEMO_STATUS: PlatformStatusDTO = {
  registrationOpen: true,
  joinRequestsOpen: true,
  locked: false,
  lockdownMessage: null,
  registrationClosedMessage: null,
  // Demo has no backend to read the real current version from; kept in step
  // with the backend's own demo/live default by convention, not by import.
  guidelinesVersion: "1.0",
  // Same for the Terms and Privacy revisions (ID-14): demo mode records no
  // acceptance and posts no consent, so these only ever feed copy.
  termsVersion: "2.4",
  privacyPolicyVersion: "3.4",
  // Demo mode never shows the sitewide announcement banner by default — the
  // Admin Settings page's demo fixture (`DEMO_PLATFORM_SETTINGS`) is the
  // source of truth for previewing it while demoing.
  announcementEnabled: false,
  announcementMessage: null,
  announcementVersion: null,
  announcementDismissed: false,
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
