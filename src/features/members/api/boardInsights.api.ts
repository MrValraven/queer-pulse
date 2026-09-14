import { apiGet } from "../../../shared/api/client";

/** A member whose own board post answers one of yours. */
export interface BoardMatchDTO {
  slug: string;
  first: string;
  /** The MATCHED post's kind, always the opposite of yours. */
  kind: "looking" | "offering";
  postSlug: string;
}

/** Owner-only board figures. Kept off the profile read so a visitor's payload
 *  stays flat, mirroring now-insights. */
export interface BoardInsightsDTO {
  hellos: number;
  replies: number;
  windowDays: number;
  /** Keyed by the owner's own post slug. */
  matches: Record<string, BoardMatchDTO[]>;
}

/** GET /profiles/me/board-insights. */
export const fetchBoardInsights = () =>
  apiGet<BoardInsightsDTO>("/profiles/me/board-insights");
