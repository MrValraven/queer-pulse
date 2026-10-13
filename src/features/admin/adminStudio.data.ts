import type { StudioAccessGrantDTO } from "../studio/api/studio.types";

/** Demo grants keyed by the drawer's member id (the demo roster's ids). */
export const DEMO_STUDIO_GRANTS: Record<string, StudioAccessGrantDTO> = {
  ines: {
    userId: "ines",
    grantedAt: "2026-09-30T10:00:00.000Z",
    grantedBy: { id: "sofia", displayName: "Sofia" },
  },
};
