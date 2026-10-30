// Demo store for "Meet the team" (QUEERPULSE-BUSINESS-TEAM-CONTRACT-2026-10-19.md
// and the members addendum of 2026-10-30).
// Answers every team route in demo mode with the wire DTOs and throws the same
// `ApiError` refusals (status, `code`, `initiatedBy`, `retryAt`) as the backend.
import { ApiError } from "../../../../shared/api/client";
import type { CropRect } from "../../../../shared/components/ui/cropGeometry";
import type {
  LinkVisibility,
  SubprofileKind,
  SubprofileStatus,
  Visibility,
} from "../../../subprofiles/api/subprofiles.api";
import {
  DEMO_TEAM_HIDDEN_LISTING,
  DEMO_TEAM_LISTINGS,
  DEMO_TEAM_MEMBERS,
  DEMO_TEAM_PERSONAS,
  DEMO_TEAM_ROWS,
  DEMO_VIEWER_TEAM_USER_ID,
  type DemoTeamListing,
  type DemoTeamMember,
  type DemoTeamRow,
} from "./listingTeam.demo.data";
import {
  LISTING_TEAM_LIMITS,
  type ApproveListingTeamRequestBody,
  type InviteMemberToListingTeamBody,
  type InviteToListingTeamBody,
  type ListingTeamCandidatesDTO,
  type ListingTeamErrorBody,
  type ListingTeamErrorCode,
  type ListingTeamInitiatedBy,
  type ListingTeamListingCandidateDTO,
  type ListingTeamListingDTO,
  type ListingTeamManagerListDTO,
  type ListingTeamManagerRowDTO,
  type ListingTeamMemberLinkListDTO,
  type ListingTeamMemberLinkRowDTO,
  type ListingTeamMemberManagerRowDTO,
  type ListingTeamMemberProfileDTO,
  type ListingTeamMemberPublicDTO,
  type ListingTeamPersonaCandidateDTO,
  type ListingTeamPersonaDTO,
  type ListingTeamPersonaListDTO,
  type ListingTeamPersonaManagerRowDTO,
  type ListingTeamPersonaRowDTO,
  type ListingTeamStatus,
  type ListingWorksAtDTO,
  type ReorderListingTeamBody,
  type RequestToJoinListingTeamBody,
  type UpdateListingTeamRoleLabelBody,
} from "./listingTeam.types";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const PUBLIC_TEAM_MAX = 40;
const WORKS_AT_MAX = 10;
const INVITES_RECEIVED_MAX = 100;

const KNOWN_LISTINGS: DemoTeamListing[] = [
  ...DEMO_TEAM_LISTINGS,
  DEMO_TEAM_HIDDEN_LISTING,
];
const LIVE_LISTING_IDS = new Set(
  DEMO_TEAM_LISTINGS.map((listing) => listing.id),
);

let teamRows: DemoTeamRow[] = structuredClone(DEMO_TEAM_ROWS);
const hiddenPersonaIds = new Set<string>();
const hiddenMemberSlugs = new Set<string>();
let createdRowCount = 0;

/** What the team store needs to know about a demo persona it does not seed. */
export interface DemoTeamPersonaFacts {
  id: string;
  handle: string | null;
  displayName: string;
  kind: SubprofileKind;
  avatarUrl: string | null;
  avatarCrop?: CropRect | null;
  status: SubprofileStatus;
  visibility: Visibility;
  removedAt?: string | null;
  /** The owner's name travels to the team only when this is `linked`. */
  linkVisibility: LinkVisibility;
  ownerName: string | null;
}

export type DemoTeamPersonaLookup = (
  subprofileId: string,
) => DemoTeamPersonaFacts | null;

let viewerPersonaLookup: DemoTeamPersonaLookup = () => null;

/**
 * Lets the persona demo store answer for the viewer's own personas, so a
 * persona outside the team seed can open its Works at pane and ask to join.
 * The persona store calls this once; this module never imports it back.
 */
export function registerDemoTeamPersonaLookup(
  lookup: DemoTeamPersonaLookup,
): void {
  viewerPersonaLookup = lookup;
}

// ── Test helpers ─────────────────────────────────────────────────────────────

/** Puts the seed back and shows every persona again. */
export function resetListingTeamDemo(): void {
  teamRows = structuredClone(DEMO_TEAM_ROWS);
  hiddenPersonaIds.clear();
  hiddenMemberSlugs.clear();
  createdRowCount = 0;
}

/** Swaps every row for a copy of `rows` (cap and edge-case tests). */
export function replaceListingTeamDemoRows(rows: DemoTeamRow[]): void {
  teamRows = structuredClone(rows);
}

/** Marks a persona ineligible (private, draft, taken down) or eligible again. */
export function setDemoTeamPersonaHidden(
  subprofileId: string,
  isHidden: boolean,
): void {
  if (isHidden) hiddenPersonaIds.add(subprofileId);
  else hiddenPersonaIds.delete(subprofileId);
}

/**
 * Marks a member ineligible (profile private or hidden, taken down,
 * deactivated) or eligible again. Their rows stay; the business list shows
 * `member: null` and the public page leaves them out.
 */
export function setDemoTeamMemberHidden(
  memberSlug: string,
  isHidden: boolean,
): void {
  if (isHidden) hiddenMemberSlugs.add(memberSlug);
  else hiddenMemberSlugs.delete(memberSlug);
}

// ── Refusals ─────────────────────────────────────────────────────────────────

function teamError(
  status: number,
  code: ListingTeamErrorCode,
  message: string,
  extra: Pick<ListingTeamErrorBody, "initiatedBy" | "retryAt"> = {},
): ApiError {
  const body: ListingTeamErrorBody = {
    statusCode: status,
    code,
    message,
    ...extra,
  };
  return new ApiError(status, message, body);
}

function validationError(message: string): ApiError {
  return new ApiError(400, message, {
    statusCode: 400,
    message: [message],
    error: "Bad Request",
  });
}

/** `loadOwnedOrCoManagedOr404` answers its plain 404 with no code. */
function managedListingNotFound(): ApiError {
  return new ApiError(404, "Listing not found", {
    statusCode: 404,
    message: "Listing not found",
    error: "Not Found",
  });
}

// ── Lookups and shapes ───────────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function isRowOpen(row: DemoTeamRow): boolean {
  return row.status === "pending" || row.status === "accepted";
}

function findSeededPersona(
  subprofileId: string,
): ListingTeamPersonaDTO | undefined {
  return DEMO_TEAM_PERSONAS.find((persona) => persona.id === subprofileId);
}

/** A viewer persona the team seed does not hold, from the registered lookup. */
function findViewerPersonaFacts(
  subprofileId: string,
): DemoTeamPersonaFacts | null {
  if (findSeededPersona(subprofileId) !== undefined) return null;
  return viewerPersonaLookup(subprofileId);
}

/** Published, open or network, with a handle, and still up. */
function isViewerPersonaEligible(facts: DemoTeamPersonaFacts): boolean {
  return (
    facts.status === "published" &&
    (facts.visibility === "open" || facts.visibility === "network") &&
    (facts.handle ?? "").trim() !== "" &&
    !facts.removedAt
  );
}

function toViewerPersonaDTO(
  facts: DemoTeamPersonaFacts,
): ListingTeamPersonaDTO {
  return {
    id: facts.id,
    handle: facts.handle ?? "",
    displayName: facts.displayName,
    kind: facts.kind,
    avatarUrl: facts.avatarUrl,
    ...(facts.avatarCrop ? { avatarCrop: facts.avatarCrop } : {}),
    ownerName: facts.linkVisibility === "linked" ? facts.ownerName : null,
  };
}

function findPersona(subprofileId: string): ListingTeamPersonaDTO | undefined {
  const seededPersona = findSeededPersona(subprofileId);
  if (seededPersona) return seededPersona;
  const viewerFacts = findViewerPersonaFacts(subprofileId);
  return viewerFacts ? toViewerPersonaDTO(viewerFacts) : undefined;
}

function findListingById(listingId: string): DemoTeamListing | undefined {
  return KNOWN_LISTINGS.find((listing) => listing.id === listingId);
}

function isPersonaEligible(subprofileId: string): boolean {
  if (hiddenPersonaIds.has(subprofileId)) return false;
  if (findSeededPersona(subprofileId) !== undefined) return true;
  const viewerFacts = findViewerPersonaFacts(subprofileId);
  return viewerFacts !== null && isViewerPersonaEligible(viewerFacts);
}

function isListingLive(listingId: string): boolean {
  return LIVE_LISTING_IDS.has(listingId);
}

function findMemberByUserId(userId: string): DemoTeamMember | undefined {
  return DEMO_TEAM_MEMBERS.find((member) => member.userId === userId);
}

function isMemberEligible(member: DemoTeamMember): boolean {
  return !hiddenMemberSlugs.has(member.slug);
}

function toMemberProfileDTO(
  member: DemoTeamMember,
): ListingTeamMemberProfileDTO {
  return {
    slug: member.slug,
    name: member.name,
    avatarUrl: member.avatarUrl,
    ...(member.avatarCrop
      ? { avatarCrop: structuredClone(member.avatarCrop) }
      : {}),
  };
}

/** The member a row names, only while they are eligible. */
function eligibleMemberOfRow(row: DemoTeamRow): DemoTeamMember | undefined {
  const member =
    row.userId === null ? undefined : findMemberByUserId(row.userId);
  return member && isMemberEligible(member) ? member : undefined;
}

function toPersonaDTO(persona: ListingTeamPersonaDTO): ListingTeamPersonaDTO {
  return structuredClone(persona);
}

function toListingDTO(listing: DemoTeamListing): ListingTeamListingDTO {
  return {
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    cat: listing.cat,
    coverPhoto: structuredClone(listing.coverPhoto),
    tint: listing.tint,
    av: listing.av,
  };
}

function wireStatus(row: DemoTeamRow): ListingTeamStatus {
  return row.status === "accepted" ? "accepted" : "pending";
}

function toManagerRowBase(row: DemoTeamRow) {
  return {
    id: row.id,
    status: wireStatus(row),
    initiatedBy: row.initiatedBy,
    roleLabel: row.roleLabel,
    position: row.status === "accepted" ? row.position : null,
    createdAt: row.createdAt,
    answeredAt: row.answeredAt,
  };
}

function toPersonaManagerRow(
  row: DemoTeamRow,
): ListingTeamPersonaManagerRowDTO {
  const persona =
    row.subprofileId !== null && isPersonaEligible(row.subprofileId)
      ? findPersona(row.subprofileId)
      : undefined;
  return {
    ...toManagerRowBase(row),
    kind: "persona",
    persona: persona ? toPersonaDTO(persona) : null,
  };
}

function toMemberManagerRow(row: DemoTeamRow): ListingTeamMemberManagerRowDTO {
  const member = eligibleMemberOfRow(row);
  return {
    ...toManagerRowBase(row),
    kind: "member",
    member: member ? toMemberProfileDTO(member) : null,
  };
}

function toManagerRow(row: DemoTeamRow): ListingTeamManagerRowDTO {
  return row.userId === null
    ? toPersonaManagerRow(row)
    : toMemberManagerRow(row);
}

function toPersonaRow(
  row: DemoTeamRow,
  listing: DemoTeamListing,
): ListingTeamPersonaRowDTO {
  return {
    id: row.id,
    status: wireStatus(row),
    initiatedBy: row.initiatedBy,
    roleLabel: row.roleLabel,
    listing: toListingDTO(listing),
    isListingLive: isListingLive(listing.id),
    createdAt: row.createdAt,
    answeredAt: row.answeredAt,
  };
}

function toPersonaRowOrThrow(row: DemoTeamRow): ListingTeamPersonaRowDTO {
  const listing = findListingById(row.listingId);
  if (!listing)
    throw teamError(404, "listing_team_link_not_found", "Team link not found");
  return toPersonaRow(row, listing);
}

function newestFirst(left: DemoTeamRow, right: DemoTeamRow): number {
  return (
    compareText(right.createdAt, left.createdAt) ||
    compareText(right.id, left.id)
  );
}

function byPosition(left: DemoTeamRow, right: DemoTeamRow): number {
  const leftPosition = left.position ?? Number.MAX_SAFE_INTEGER;
  const rightPosition = right.position ?? Number.MAX_SAFE_INTEGER;
  return leftPosition - rightPosition || compareText(left.id, right.id);
}

function byAnsweredAt(left: DemoTeamRow, right: DemoTeamRow): number {
  return (
    compareText(left.answeredAt ?? "", right.answeredAt ?? "") ||
    compareText(left.id, right.id)
  );
}

function openRowForPair(
  listingId: string,
  subprofileId: string,
): DemoTeamRow | undefined {
  return teamRows.find(
    (row) =>
      row.listingId === listingId &&
      row.subprofileId === subprofileId &&
      isRowOpen(row),
  );
}

function teamStatusForPair(
  listingId: string,
  subprofileId: string,
): ListingTeamStatus | null {
  const row = openRowForPair(listingId, subprofileId);
  return row ? wireStatus(row) : null;
}

function countRows(predicate: (row: DemoTeamRow) => boolean): number {
  return teamRows.filter(predicate).length;
}

// ── Validation ───────────────────────────────────────────────────────────────

/** Trims a role label; an empty or all-space label stores null. */
function normalizeRoleLabel(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  if (/[\r\n\u2028\u2029\u0085]/.test(trimmed))
    throw validationError("roleLabel must be a single line");
  if (trimmed.length > LISTING_TEAM_LIMITS.roleLabelMax)
    throw validationError(
      `roleLabel must be at most ${LISTING_TEAM_LIMITS.roleLabelMax} characters`,
    );
  return trimmed === "" ? null : trimmed;
}

function normalizeQuery(rawQuery: string, shouldDropAt: boolean): string {
  const trimmed = rawQuery.trim();
  const query =
    shouldDropAt && trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;
  if (
    query.length < LISTING_TEAM_LIMITS.queryMin ||
    query.length > LISTING_TEAM_LIMITS.queryMax
  )
    throw validationError(
      `q must be between ${LISTING_TEAM_LIMITS.queryMin} and ${LISTING_TEAM_LIMITS.queryMax} characters`,
    );
  return query;
}

// ── Guards shared by both sides ──────────────────────────────────────────────

function requireManagedListing(listingRef: string): DemoTeamListing {
  const listing = KNOWN_LISTINGS.find((known) => known.ref === listingRef);
  if (!listing) throw managedListingNotFound();
  return listing;
}

function requireSeatPersona(subprofileId: string): ListingTeamPersonaDTO {
  const persona = findPersona(subprofileId);
  if (!persona)
    throw teamError(404, "listing_team_persona_not_found", "Persona not found");
  return persona;
}

/** A row on this listing (or persona), in the expected direction when given. */
function requireRow(
  matches: (row: DemoTeamRow) => boolean,
  expectedInitiatedBy?: ListingTeamInitiatedBy,
): DemoTeamRow {
  const row = teamRows.find(matches);
  if (
    !row ||
    (expectedInitiatedBy !== undefined &&
      row.initiatedBy !== expectedInitiatedBy)
  )
    throw teamError(404, "listing_team_link_not_found", "Team link not found");
  return row;
}

function requireManagerRow(
  listingId: string,
  memberId: string,
  expectedInitiatedBy?: ListingTeamInitiatedBy,
): DemoTeamRow {
  return requireRow(
    (row) => row.id === memberId && row.listingId === listingId,
    expectedInitiatedBy,
  );
}

function requirePersonaRow(
  subprofileId: string,
  linkId: string,
  expectedInitiatedBy?: ListingTeamInitiatedBy,
): DemoTeamRow {
  return requireRow(
    (row) => row.id === linkId && row.subprofileId === subprofileId,
    expectedInitiatedBy,
  );
}

/** A persona-initiated row always names a persona; a member row never reaches here. */
function requirePersonaSubject(row: DemoTeamRow): string {
  if (row.subprofileId === null)
    throw teamError(404, "listing_team_link_not_found", "Team link not found");
  return row.subprofileId;
}

function assertPending(row: DemoTeamRow): void {
  if (row.status !== "pending")
    throw teamError(
      409,
      "listing_team_not_pending",
      "Team link is not pending",
    );
}

function assertAccepted(row: DemoTeamRow): void {
  if (row.status !== "accepted")
    throw teamError(
      409,
      "listing_team_not_accepted",
      "Team link is not accepted",
    );
}

function assertPersonaEligible(subprofileId: string): void {
  if (!isPersonaEligible(subprofileId))
    throw teamError(
      422,
      "listing_team_persona_ineligible",
      "Persona cannot join a team right now",
    );
}

function assertListingLive(listingId: string): void {
  if (!isListingLive(listingId))
    throw teamError(
      409,
      "listing_team_listing_not_live",
      "Listing is not live",
    );
}

/** Already linked, already pending either way, or declined under 14 days ago. */
function assertSubjectOpenFor(
  listingId: string,
  isSubjectRow: (row: DemoTeamRow) => boolean,
  initiatedBy: ListingTeamInitiatedBy,
): void {
  const openRow = teamRows.find(
    (row) => row.listingId === listingId && isSubjectRow(row) && isRowOpen(row),
  );
  if (openRow?.status === "accepted")
    throw teamError(
      409,
      "listing_team_already_accepted",
      "Already on the team",
    );
  if (openRow)
    throw teamError(409, "listing_team_already_pending", "Already pending", {
      initiatedBy: openRow.initiatedBy,
    });
  const now = Date.now();
  const cooldownEnds = teamRows
    .filter(
      (row) =>
        row.listingId === listingId &&
        isSubjectRow(row) &&
        row.initiatedBy === initiatedBy &&
        row.status === "declined" &&
        row.answeredAt !== null,
    )
    .map(
      (row) =>
        Date.parse(row.answeredAt ?? "") +
        LISTING_TEAM_LIMITS.cooldownDays * DAY_IN_MILLISECONDS,
    )
    .filter((retryAt) => retryAt > now);
  if (cooldownEnds.length > 0)
    throw teamError(409, "listing_team_cooldown", "Asked too recently", {
      retryAt: new Date(Math.max(...cooldownEnds)).toISOString(),
    });
}

function assertPairOpenFor(
  listingId: string,
  subprofileId: string,
  initiatedBy: ListingTeamInitiatedBy,
): void {
  assertSubjectOpenFor(
    listingId,
    (row) => row.subprofileId === subprofileId,
    initiatedBy,
  );
}

function assertMemberPairOpenFor(listingId: string, userId: string): void {
  assertSubjectOpenFor(listingId, (row) => row.userId === userId, "listing");
}

interface CapCheck {
  listingId: string;
  subprofileId: string;
  shouldCountPending: boolean;
  shouldCountRequests: boolean;
}

function assertCaps(check: CapCheck): void {
  const isAcceptedOnListing = (row: DemoTeamRow) =>
    row.listingId === check.listingId && row.status === "accepted";
  if (countRows(isAcceptedOnListing) >= LISTING_TEAM_LIMITS.acceptedPerListing)
    throw teamError(409, "listing_team_full", "The team is full");
  const isPendingOnListing = (row: DemoTeamRow) =>
    row.listingId === check.listingId && row.status === "pending";
  if (
    check.shouldCountPending &&
    countRows(isPendingOnListing) >= LISTING_TEAM_LIMITS.pendingPerListing
  )
    throw teamError(409, "listing_team_pending_full", "Too many pending");
  const isAcceptedForPersona = (row: DemoTeamRow) =>
    row.subprofileId === check.subprofileId && row.status === "accepted";
  if (countRows(isAcceptedForPersona) >= LISTING_TEAM_LIMITS.acceptedPerPersona)
    throw teamError(409, "listing_team_persona_full", "Persona teams full");
  const isRequestFromPersona = (row: DemoTeamRow) =>
    row.subprofileId === check.subprofileId &&
    row.status === "pending" &&
    row.initiatedBy === "persona";
  if (
    check.shouldCountRequests &&
    countRows(isRequestFromPersona) >=
      LISTING_TEAM_LIMITS.pendingRequestsPerPersona
  )
    throw teamError(
      409,
      "listing_team_persona_requests_full",
      "Too many requests",
    );
}

/** Listing full, too many pending, or the member already on 10 teams. */
function assertMemberCaps(
  listingId: string,
  userId: string,
  shouldCountPending: boolean,
): void {
  const isAcceptedOnListing = (row: DemoTeamRow) =>
    row.listingId === listingId && row.status === "accepted";
  if (countRows(isAcceptedOnListing) >= LISTING_TEAM_LIMITS.acceptedPerListing)
    throw teamError(409, "listing_team_full", "The team is full");
  const isPendingOnListing = (row: DemoTeamRow) =>
    row.listingId === listingId && row.status === "pending";
  if (
    shouldCountPending &&
    countRows(isPendingOnListing) >= LISTING_TEAM_LIMITS.pendingPerListing
  )
    throw teamError(409, "listing_team_pending_full", "Too many pending");
  const isAcceptedForMember = (row: DemoTeamRow) =>
    row.userId === userId && row.status === "accepted";
  if (countRows(isAcceptedForMember) >= LISTING_TEAM_LIMITS.acceptedPerMember)
    throw teamError(409, "listing_team_member_full", "Member teams full");
}

function nextRowId(): string {
  const takenIds = new Set(teamRows.map((row) => row.id));
  createdRowCount += 1;
  while (takenIds.has(`demo-team-link-new-${createdRowCount}`))
    createdRowCount += 1;
  return `demo-team-link-new-${createdRowCount}`;
}

/** A row has exactly one subject: a persona or a member. */
type RowSubject =
  | { subprofileId: string; userId?: never }
  | { userId: string; subprofileId?: never };

function createPendingRow(
  listingId: string,
  subject: RowSubject,
  initiatedBy: ListingTeamInitiatedBy,
  roleLabel: string | null,
): DemoTeamRow {
  const row: DemoTeamRow = {
    id: nextRowId(),
    listingId,
    subprofileId: subject.subprofileId ?? null,
    userId: subject.userId ?? null,
    status: "pending",
    initiatedBy,
    roleLabel,
    position: null,
    createdAt: nowIso(),
    answeredAt: null,
  };
  teamRows.push(row);
  return row;
}

/** Accepts a pending row at the end of its listing's team. */
function acceptRow(row: DemoTeamRow): void {
  const positions = teamRows
    .filter(
      (other) =>
        other.listingId === row.listingId && other.status === "accepted",
    )
    .map((other) => other.position ?? -1);
  row.status = "accepted";
  row.position = positions.length > 0 ? Math.max(...positions) + 1 : 0;
  row.answeredAt = nowIso();
}

function declineRow(row: DemoTeamRow): void {
  row.status = "declined";
  row.answeredAt = nowIso();
}

// ── Business side (`/listings/:ref/team`) ────────────────────────────────────

export function demoGetListingTeam(
  listingRef: string,
): ListingTeamManagerListDTO {
  const listing = requireManagedListing(listingRef);
  const listingRows = teamRows.filter((row) => row.listingId === listing.id);
  const pendingFrom = (initiatedBy: ListingTeamInitiatedBy) =>
    listingRows
      .filter(
        (row) => row.status === "pending" && row.initiatedBy === initiatedBy,
      )
      .sort(newestFirst);
  const requestsReceived = pendingFrom("persona");
  return {
    awaitingYouCount: requestsReceived.length,
    requestsReceived: requestsReceived.map(toManagerRow),
    invitesSent: pendingFrom("listing").map(toManagerRow),
    accepted: listingRows
      .filter((row) => row.status === "accepted")
      .sort(byPosition)
      .map(toManagerRow),
  };
}

export function demoSearchListingTeamCandidates(
  listingRef: string,
  query: string,
): ListingTeamCandidatesDTO<ListingTeamPersonaCandidateDTO> {
  const normalizedQuery = normalizeQuery(query, true).toLowerCase();
  const listing = requireManagedListing(listingRef);
  const items = DEMO_TEAM_PERSONAS.filter(
    (persona) =>
      isPersonaEligible(persona.id) &&
      (persona.displayName.toLowerCase().includes(normalizedQuery) ||
        persona.handle.toLowerCase().startsWith(normalizedQuery)),
  )
    .sort((left, right) => {
      const isLeftExact = left.handle.toLowerCase() === normalizedQuery;
      const isRightExact = right.handle.toLowerCase() === normalizedQuery;
      if (isLeftExact !== isRightExact) return isLeftExact ? -1 : 1;
      return (
        compareText(
          left.displayName.toLowerCase(),
          right.displayName.toLowerCase(),
        ) || compareText(left.id, right.id)
      );
    })
    .slice(0, LISTING_TEAM_LIMITS.candidatesMax)
    .map((persona) => ({
      persona: toPersonaDTO(persona),
      teamStatus: teamStatusForPair(listing.id, persona.id),
    }));
  return { items };
}

export function demoInviteToListingTeam(
  listingRef: string,
  body: InviteToListingTeamBody,
): ListingTeamManagerRowDTO {
  const roleLabel = normalizeRoleLabel(body.roleLabel);
  const listing = requireManagedListing(listingRef);
  if (!findPersona(body.subprofileId))
    throw teamError(404, "listing_team_persona_not_found", "Persona not found");
  assertPersonaEligible(body.subprofileId);
  assertListingLive(listing.id);
  assertPairOpenFor(listing.id, body.subprofileId, "listing");
  assertCaps({
    listingId: listing.id,
    subprofileId: body.subprofileId,
    shouldCountPending: true,
    shouldCountRequests: false,
  });
  const row = createPendingRow(
    listing.id,
    { subprofileId: body.subprofileId },
    "listing",
    roleLabel,
  );
  return toPersonaManagerRow(row);
}

/** The invitee must be one of the viewer's connections, never the viewer. */
export function demoInviteMemberToListingTeam(
  listingRef: string,
  body: InviteMemberToListingTeamBody,
): ListingTeamMemberManagerRowDTO {
  const roleLabel = normalizeRoleLabel(body.roleLabel);
  const memberSlug = body.memberSlug.trim();
  if (memberSlug.length < 1 || memberSlug.length > 64)
    throw validationError("memberSlug must be between 1 and 64 characters");
  const listing = requireManagedListing(listingRef);
  const member = DEMO_TEAM_MEMBERS.find((known) => known.slug === memberSlug);
  if (!member || member.userId === DEMO_VIEWER_TEAM_USER_ID)
    throw teamError(404, "listing_team_member_not_found", "Member not found");
  if (!isMemberEligible(member))
    throw teamError(
      422,
      "listing_team_member_ineligible",
      "Member cannot join a team right now",
    );
  assertListingLive(listing.id);
  assertMemberPairOpenFor(listing.id, member.userId);
  assertMemberCaps(listing.id, member.userId, true);
  const row = createPendingRow(
    listing.id,
    { userId: member.userId },
    "listing",
    roleLabel,
  );
  return toMemberManagerRow(row);
}

export function demoApproveListingTeamRequest(
  listingRef: string,
  memberId: string,
  body: ApproveListingTeamRequestBody,
): ListingTeamManagerRowDTO {
  const roleLabel =
    body.roleLabel === undefined
      ? undefined
      : normalizeRoleLabel(body.roleLabel);
  const listing = requireManagedListing(listingRef);
  const row = requireManagerRow(listing.id, memberId, "persona");
  assertPending(row);
  const subprofileId = requirePersonaSubject(row);
  assertPersonaEligible(subprofileId);
  assertListingLive(listing.id);
  assertCaps({
    listingId: listing.id,
    subprofileId,
    shouldCountPending: false,
    shouldCountRequests: false,
  });
  if (roleLabel !== undefined) row.roleLabel = roleLabel;
  acceptRow(row);
  return toManagerRow(row);
}

export function demoDeclineListingTeamRequest(
  listingRef: string,
  memberId: string,
): void {
  const listing = requireManagedListing(listingRef);
  const row = requireManagerRow(listing.id, memberId, "persona");
  assertPending(row);
  declineRow(row);
}

export function demoCancelListingTeamInvite(
  listingRef: string,
  memberId: string,
): void {
  const listing = requireManagedListing(listingRef);
  const row = requireManagerRow(listing.id, memberId, "listing");
  assertPending(row);
  row.status = "cancelled";
}

export function demoUpdateListingTeamRoleLabel(
  listingRef: string,
  memberId: string,
  body: UpdateListingTeamRoleLabelBody,
): ListingTeamManagerRowDTO {
  const roleLabel = normalizeRoleLabel(body.roleLabel);
  const listing = requireManagedListing(listingRef);
  const row = requireManagerRow(listing.id, memberId);
  if (!isRowOpen(row))
    throw teamError(409, "listing_team_not_pending", "Team link has ended");
  row.roleLabel = roleLabel;
  return toManagerRow(row);
}

export function demoReorderListingTeam(
  listingRef: string,
  body: ReorderListingTeamBody,
): { accepted: ListingTeamManagerRowDTO[] } {
  if (new Set(body.memberIds).size !== body.memberIds.length)
    throw validationError("memberIds must be unique");
  const listing = requireManagedListing(listingRef);
  const acceptedRows = teamRows.filter(
    (row) => row.listingId === listing.id && row.status === "accepted",
  );
  const acceptedIds = new Set(acceptedRows.map((row) => row.id));
  const isSameSet =
    body.memberIds.length === acceptedIds.size &&
    body.memberIds.every((memberId) => acceptedIds.has(memberId));
  if (!isSameSet)
    throw teamError(
      409,
      "listing_team_order_mismatch",
      "The order must name the whole team",
    );
  body.memberIds.forEach((memberId, position) => {
    const row = acceptedRows.find((accepted) => accepted.id === memberId);
    if (row) row.position = position;
  });
  return { accepted: acceptedRows.sort(byPosition).map(toManagerRow) };
}

export function demoRemoveFromListingTeam(
  listingRef: string,
  memberId: string,
): void {
  const listing = requireManagedListing(listingRef);
  const row = requireManagerRow(listing.id, memberId);
  assertAccepted(row);
  row.status = "removed";
}

// ── Persona side (`/subprofiles/:id/team-links`) ─────────────────────────────

export function demoGetPersonaTeamLinks(
  subprofileId: string,
): ListingTeamPersonaListDTO {
  requireSeatPersona(subprofileId);
  const personaRows = teamRows.filter(
    (row) =>
      row.subprofileId === subprofileId &&
      findListingById(row.listingId) !== undefined,
  );
  const pendingFrom = (initiatedBy: ListingTeamInitiatedBy) =>
    personaRows
      .filter(
        (row) => row.status === "pending" && row.initiatedBy === initiatedBy,
      )
      .sort(newestFirst);
  const invitesReceived = pendingFrom("listing");
  return {
    awaitingYouCount: invitesReceived.length,
    invitesReceived: invitesReceived
      .slice(0, INVITES_RECEIVED_MAX)
      .map(toPersonaRowOrThrow),
    requestsSent: pendingFrom("persona").map(toPersonaRowOrThrow),
    accepted: personaRows
      .filter((row) => row.status === "accepted")
      .sort(byAnsweredAt)
      .map(toPersonaRowOrThrow),
  };
}

export function demoSearchPersonaTeamListingCandidates(
  subprofileId: string,
  query: string,
): ListingTeamCandidatesDTO<ListingTeamListingCandidateDTO> {
  const normalizedQuery = normalizeQuery(query, false).toLowerCase();
  requireSeatPersona(subprofileId);
  const items = DEMO_TEAM_LISTINGS.filter(
    (listing) =>
      isListingLive(listing.id) &&
      listing.name.toLowerCase().includes(normalizedQuery),
  )
    .sort(
      (left, right) =>
        compareText(left.name.toLowerCase(), right.name.toLowerCase()) ||
        compareText(left.id, right.id),
    )
    .slice(0, LISTING_TEAM_LIMITS.candidatesMax)
    .map((listing) => ({
      listing: toListingDTO(listing),
      teamStatus: teamStatusForPair(listing.id, subprofileId),
    }));
  return { items };
}

export function demoRequestToJoinListingTeam(
  subprofileId: string,
  body: RequestToJoinListingTeamBody,
): ListingTeamPersonaRowDTO {
  requireSeatPersona(subprofileId);
  const listing = findListingById(body.listingId);
  if (!listing || !isListingLive(listing.id))
    throw teamError(404, "listing_team_listing_not_found", "Listing not found");
  assertPersonaEligible(subprofileId);
  assertPairOpenFor(listing.id, subprofileId, "persona");
  assertCaps({
    listingId: listing.id,
    subprofileId,
    shouldCountPending: true,
    shouldCountRequests: true,
  });
  const row = createPendingRow(listing.id, { subprofileId }, "persona", null);
  return toPersonaRow(row, listing);
}

export function demoAcceptListingTeamInvite(
  subprofileId: string,
  linkId: string,
): ListingTeamPersonaRowDTO {
  requireSeatPersona(subprofileId);
  const row = requirePersonaRow(subprofileId, linkId, "listing");
  assertPending(row);
  assertPersonaEligible(subprofileId);
  assertListingLive(row.listingId);
  assertCaps({
    listingId: row.listingId,
    subprofileId,
    shouldCountPending: false,
    shouldCountRequests: false,
  });
  acceptRow(row);
  return toPersonaRowOrThrow(row);
}

export function demoDeclineListingTeamInvite(
  subprofileId: string,
  linkId: string,
): void {
  requireSeatPersona(subprofileId);
  const row = requirePersonaRow(subprofileId, linkId, "listing");
  assertPending(row);
  declineRow(row);
}

export function demoCancelListingTeamRequest(
  subprofileId: string,
  linkId: string,
): void {
  requireSeatPersona(subprofileId);
  const row = requirePersonaRow(subprofileId, linkId, "persona");
  assertPending(row);
  row.status = "cancelled";
}

export function demoLeaveListingTeam(
  subprofileId: string,
  linkId: string,
): void {
  requireSeatPersona(subprofileId);
  const row = requirePersonaRow(subprofileId, linkId);
  assertAccepted(row);
  row.status = "left";
}

// ── Member side (`/me/team-links`) ───────────────────────────────────────────

function requireMemberRow(linkId: string): DemoTeamRow {
  return requireRow(
    (row) => row.id === linkId && row.userId === DEMO_VIEWER_TEAM_USER_ID,
  );
}

export function demoGetMemberTeamLinks(): ListingTeamMemberLinkListDTO {
  const memberRows = teamRows.filter(
    (row) =>
      row.userId === DEMO_VIEWER_TEAM_USER_ID &&
      findListingById(row.listingId) !== undefined,
  );
  const invitesReceived = memberRows
    .filter((row) => row.status === "pending")
    .sort(newestFirst);
  return {
    awaitingYouCount: invitesReceived.length,
    invitesReceived: invitesReceived
      .slice(0, INVITES_RECEIVED_MAX)
      .map(toPersonaRowOrThrow),
    accepted: memberRows
      .filter((row) => row.status === "accepted")
      .sort(byAnsweredAt)
      .map(toPersonaRowOrThrow),
  };
}

export function demoAcceptMemberTeamLink(
  linkId: string,
): ListingTeamMemberLinkRowDTO {
  const row = requireMemberRow(linkId);
  assertPending(row);
  assertListingLive(row.listingId);
  assertMemberCaps(row.listingId, DEMO_VIEWER_TEAM_USER_ID, false);
  acceptRow(row);
  return toPersonaRowOrThrow(row);
}

export function demoDeclineMemberTeamLink(linkId: string): void {
  const row = requireMemberRow(linkId);
  assertPending(row);
  declineRow(row);
}

export function demoLeaveMemberTeamLink(linkId: string): void {
  const row = requireMemberRow(linkId);
  assertAccepted(row);
  row.status = "left";
}

// ── Public reads ─────────────────────────────────────────────────────────────

/**
 * `DirectoryDetailDTO.team`: accepted, visible personas and members in one
 * array in page order. A hidden member leaves the page and keeps the row.
 */
export function demoPublicListingTeam(
  listingSlug: string,
): ListingTeamMemberPublicDTO[] {
  const listing = DEMO_TEAM_LISTINGS.find(
    (known) => known.slug === listingSlug,
  );
  if (!listing || !isListingLive(listing.id)) return [];
  return teamRows
    .filter(
      (row) =>
        row.listingId === listing.id &&
        row.status === "accepted" &&
        (row.userId === null
          ? row.subprofileId !== null && isPersonaEligible(row.subprofileId)
          : eligibleMemberOfRow(row) !== undefined),
    )
    .sort(byPosition)
    .slice(0, PUBLIC_TEAM_MAX)
    .flatMap((row): ListingTeamMemberPublicDTO[] => {
      if (row.userId !== null) {
        const member = eligibleMemberOfRow(row);
        return member
          ? [
              {
                kind: "member",
                member: toMemberProfileDTO(member),
                roleLabel: row.roleLabel,
              },
            ]
          : [];
      }
      const persona =
        row.subprofileId === null ? undefined : findPersona(row.subprofileId);
      return persona
        ? [
            {
              kind: "persona",
              persona: toPersonaDTO(persona),
              roleLabel: row.roleLabel,
            },
          ]
        : [];
    });
}

/** `SubprofilePublicView.worksAt`: accepted links to live listings. */
export function demoListingWorksAt(subprofileId: string): ListingWorksAtDTO[] {
  return teamRows
    .filter(
      (row) =>
        row.subprofileId === subprofileId &&
        row.status === "accepted" &&
        isListingLive(row.listingId),
    )
    .sort(byAnsweredAt)
    .slice(0, WORKS_AT_MAX)
    .flatMap((row) => {
      const listing = findListingById(row.listingId);
      if (!listing) return [];
      const { slug, name, cat, coverPhoto, tint, av } = toListingDTO(listing);
      return [
        { slug, name, cat, coverPhoto, tint, av, roleLabel: row.roleLabel },
      ];
    });
}
