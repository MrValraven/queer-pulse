import { apiGet } from "../../../shared/api/client";
import {
  STUDIO_PLAYS_DAYS,
  type StudioArtistPlaysDTO,
  type StudioMilestoneCardDTO,
  type StudioMilestonesResponseDTO,
  type StudioPlacementsPageDTO,
  type StudioTopSupportersDTO,
} from "./studioDashboard.types";

// One raw call per new read of the Studio dashboard upgrade, Part 1
// (QUEERPULSE-STUDIO-DASHBOARD-UPGRADE-CONTRACT-PART-1-2026-10-26.md, sections
// 2 to 4): where a persona's music lives, its milestones, and the card a
// shared milestone link reads. The extended stats read stays in studio.api.ts.
// Part 2 (QUEERPULSE-STUDIO-DASHBOARD-UPGRADE-CONTRACT-PART-2-2026-10-27.md,
// sections 7 and 8) adds the 28 days of plays and the top supporters.

const segment = (id: string) => encodeURIComponent(id);

/** GET /studio/artists/:subprofileId/placements. Page one carries no cursor. */
export const getStudioArtistPlacements = (
  subprofileId: string,
  cursor: string | null,
) =>
  apiGet<StudioPlacementsPageDTO>(
    `/studio/artists/${segment(subprofileId)}/placements${
      cursor === null ? "" : `?cursor=${encodeURIComponent(cursor)}`
    }`,
  );

/** GET /studio/artists/:subprofileId/milestones, newest first. */
export const getStudioArtistMilestones = (subprofileId: string) =>
  apiGet<StudioMilestonesResponseDTO>(
    `/studio/artists/${segment(subprofileId)}/milestones`,
  );

/** GET /studio/milestones/:milestoneId, the card a shared milestone reads. */
export const getStudioMilestoneCard = (milestoneId: string) =>
  apiGet<StudioMilestoneCardDTO>(`/studio/milestones/${segment(milestoneId)}`);

/** GET /studio/artists/:subprofileId/plays. Always 28 days: any other value
 *  is a 400 on the server. */
export const getStudioArtistPlays = (subprofileId: string) =>
  apiGet<StudioArtistPlaysDTO>(
    `/studio/artists/${segment(subprofileId)}/plays?days=${STUDIO_PLAYS_DAYS}`,
  );

/** GET /studio/artists/:subprofileId/supporters, ranked, no counts. */
export const getStudioTopSupporters = (subprofileId: string) =>
  apiGet<StudioTopSupportersDTO>(
    `/studio/artists/${segment(subprofileId)}/supporters`,
  );
