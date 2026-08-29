import { apiPost } from "../../../shared/api/client";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `community` domain accepts/returns
// (POST /reading-groups/proposals, POST /changemakers/nominations). Both the
// reading-groups directory and the change-makers directory are curated
// editorial content with no backend listing — these are the two real pieces
// of member-submitted data in the community feature: starting your own
// reading group (`ListGroupStrip`) and nominating a change maker
// (`ChangemakersPage`'s "Nominate them" form).

export type ReadingGroupProposalFormat = "In-person" | "Online" | "Either";

export interface CreateReadingGroupProposalDto {
  book: string;
  why?: string;
  format: ReadingGroupProposalFormat;
  maxPeople: number;
}

export interface ReadingGroupProposalResponseDTO {
  id: string;
  book: string;
  why: string | null;
  format: ReadingGroupProposalFormat;
  maxPeople: number;
  createdAt: string;
}

export const createReadingGroupProposal = (
  dto: CreateReadingGroupProposalDto,
) => apiPost<ReadingGroupProposalResponseDTO>("/reading-groups/proposals", dto);

export interface CreateChangemakerNominationDto {
  nomineeName: string;
  /** The nominator's own words on why (COM-16) — the form's copy promises
   *  "a name and a sentence is enough to start"; this is that sentence. */
  reason: string;
  /** The nominee's profile slug when they were picked out of the member
   *  search (COM-18). Omitted when the nominee isn't a member here. The
   *  server resolves it and 400s on a slug that no longer points at an
   *  active member. */
  nomineeSlug?: string;
  /** Where else to find the nominee (COM-18) — a handle, a link, an email.
   *  Free text; omitted when the nominator left it blank. */
  nomineeContact?: string;
}

export interface ChangemakerNominationResponseDTO {
  id: string;
  nomineeName: string;
  reason: string | null;
  createdAt: string;
}

export const createChangemakerNomination = (
  dto: CreateChangemakerNominationDto,
) =>
  apiPost<ChangemakerNominationResponseDTO>("/changemakers/nominations", dto);
