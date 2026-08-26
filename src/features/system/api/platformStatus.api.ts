import { apiGet } from "../../../shared/api/client";

/**
 * `GET /status` — the public platform status read, mirrored from the backend's
 * `PublicStatusDto` (queerpulse-backend/src/status/dto/public-status.dto.ts).
 *
 * UNAUTHENTICATED on both ends. This is the one call the app makes that has to
 * work for someone with no session, a suspended session, or a locked-out
 * account: the platform sends no email, so without this page "the platform is
 * down", "I have been suspended" and "my account is broken" are the same
 * silence. `/system/status` is absent from `GATED_PATTERNS` in `authGate.ts`
 * for the same reason.
 */

export type PlatformStatusState = "operational" | "degraded" | "down";

export type PlatformStatusComponentId =
  "accounts" | "messaging" | "communities" | "directory" | "magazine" | "media";

export type PlatformIncidentSeverity = "minor" | "major" | "critical";

export type PlatformIncidentState = "open" | "monitoring" | "resolved";

export interface PlatformStatusComponentDTO {
  /** Stable id, never display text — translated via `system:status.live.component.*`. */
  id: PlatformStatusComponentId;
  state: PlatformStatusState;
}

export interface PlatformStatusIncidentDTO {
  id: string;
  /** Operator-authored plain text, stored in English. Never translated. */
  title: string;
  body: string;
  severity: PlatformIncidentSeverity;
  status: PlatformIncidentState;
  affectedComponents: PlatformStatusComponentId[];
  startedAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

export interface PlatformStatusDTO {
  overall: PlatformStatusState;
  components: PlatformStatusComponentDTO[];
  incidents: PlatformStatusIncidentDTO[];
  /**
   * True when the backend answered but could not read the incident table,
   * which in practice means the database is the thing that is down. The page
   * says so instead of rendering an empty list that would read as "all clear".
   */
  isIncidentHistoryUnavailable: boolean;
  checkedAt: string;
}

export function getPlatformStatus(): Promise<PlatformStatusDTO> {
  return apiGet<PlatformStatusDTO>("/status");
}
