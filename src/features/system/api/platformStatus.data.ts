import type { PlatformStatusDTO } from "./platformStatus.api";

/**
 * Demo fallback for `usePlatformStatus`. The demo build has no backend to
 * probe, and the demo status page already tells its own richer story through
 * the fixtures in `status.data.ts`, so the only honest answer here is a calm
 * all-clear. Kept so the hook keeps its demo/live pair rather than firing a
 * network call the demo build cannot make.
 */
export const DEMO_PLATFORM_STATUS: PlatformStatusDTO = {
  overall: "operational",
  components: [
    { id: "accounts", state: "operational" },
    { id: "messaging", state: "operational" },
    { id: "communities", state: "operational" },
    { id: "directory", state: "operational" },
    { id: "magazine", state: "operational" },
    { id: "media", state: "operational" },
  ],
  incidents: [],
  isIncidentHistoryUnavailable: false,
  checkedAt: new Date().toISOString(),
};
