import { ApiError } from "../../../shared/api/client";
import type {
  StudioCreditCandidateDTO,
  StudioCreditInboxDTO,
  StudioCreditInboxRowDTO,
  StudioCreditPendingCountDTO,
  StudioCreditRole,
  StudioPersonaCreditOwnerRowDTO,
  StudioPersonaRefDTO,
} from "./studio.types";
import { normalizeCreditHandle } from "../studioCreditHandle";
import { DEMO_OWNER_RELEASES, DEMO_RELEASES } from "./studioDemo.data";
import {
  creditNotFound,
  demoLedgerAcceptCredit,
  demoLedgerAddCredit,
  demoLedgerCreditById,
  demoLedgerCredits,
  demoLedgerDeclineCredit,
  demoLedgerRemoveCreditedSide,
  demoLedgerRemoveReleaseSide,
  isDemoViewerPersona,
} from "./studioDemoCreditLedger";
import {
  DEMO_CREDIT_CANDIDATES,
  isDemoPersonaPublic,
  type DemoPersonaCredit,
} from "./studioDemoCredits.data";

// The demo's credit endpoints. Reads and writes both go through the credit
// ledger, so what a write leaves is what the next read returns.

const candidateNotFound = () =>
  new ApiError(404, "Not found", {
    statusCode: 404,
    code: "studio_credit_candidate_not_found",
    message: "Not found",
  });

/** GET /studio/credit-candidates/:handle. */
export function demoStudioCreditCandidate(
  handle: string,
): StudioCreditCandidateDTO {
  const normalized = normalizeCreditHandle(handle);
  const match = DEMO_CREDIT_CANDIDATES.find(
    (candidate) => candidate.handle === normalized,
  );
  if (!normalized || !match) throw candidateNotFound();
  return match;
}

/** GET /studio/tracks/:id/persona-credits, oldest first. */
export function demoStudioTrackPersonaCredits(trackId: string): {
  items: StudioPersonaCreditOwnerRowDTO[];
} {
  return {
    items: demoLedgerCredits()
      .filter(
        (credit) =>
          credit.trackId === trackId &&
          isDemoViewerPersona(credit.requestingPersona.id),
      )
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(ownerRowOf),
  };
}

function ownerRowOf(credit: DemoPersonaCredit): StudioPersonaCreditOwnerRowDTO {
  return {
    id: credit.id,
    persona: credit.persona,
    role: credit.role,
    status: credit.status,
    isPersonaPublic: isDemoPersonaPublic(credit.persona),
    createdAt: credit.createdAt,
  };
}

/** The release that holds the track, owner releases included. The inbox
 *  rows and the inbox actions both find a credit's release here. */
function releaseOfTrack(releaseId: string, trackId: string) {
  return [...DEMO_RELEASES, ...DEMO_OWNER_RELEASES].find(
    (release) =>
      release.id === releaseId &&
      release.tracks.some((track) => track.id === trackId),
  );
}

function inboxRowOf(credit: DemoPersonaCredit): StudioCreditInboxRowDTO | null {
  if (credit.status === "declined") return null;
  const release = releaseOfTrack(credit.releaseId, credit.trackId);
  const track = release?.tracks.find(
    (candidate) => candidate.id === credit.trackId,
  );
  if (!release || !track) return null;
  return {
    id: credit.id,
    role: credit.role,
    status: credit.status,
    requestingPersona: credit.requestingPersona,
    creditedPersona: credit.persona,
    track: { id: track.id, title: track.title },
    release: {
      id: release.id,
      title: release.title,
      coverUrl: release.coverUrl,
    },
    createdAt: credit.createdAt,
    respondedAt: credit.respondedAt,
  };
}

/** GET /studio/credits/inbox for the demo member's personas. */
export function demoStudioCreditInbox(): StudioCreditInboxDTO {
  const rows = demoLedgerCredits()
    .filter(
      (credit) =>
        isDemoViewerPersona(credit.persona.id) &&
        isDemoPersonaPublic(credit.requestingPersona),
    )
    .flatMap((credit) => {
      const row = inboxRowOf(credit);
      return row ? [row] : [];
    });
  return {
    requests: rows
      .filter((row) => row.status === "pending")
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    accepted: rows
      .filter((row) => row.status === "accepted")
      .sort((left, right) =>
        (right.respondedAt ?? "").localeCompare(left.respondedAt ?? ""),
      ),
  };
}

/** GET /studio/credits/pending-count. */
export function demoStudioCreditPendingCount(): StudioCreditPendingCountDTO {
  return { count: demoStudioCreditInbox().requests.length };
}

/** POST /studio/tracks/:id/persona-credits, as the demo member. */
export function demoStudioAddTrackPersonaCredit(
  trackId: string,
  releaseId: string,
  body: { handle: string; role: StudioCreditRole },
): StudioPersonaCreditOwnerRowDTO {
  const release = releaseOfTrack(releaseId, trackId);
  if (!release) throw new ApiError(404, "Not found");
  const normalized = normalizeCreditHandle(body.handle);
  const persona = DEMO_CREDIT_CANDIDATES.find(
    (candidate) => candidate.handle === normalized,
  );
  if (!persona)
    throw new ApiError(422, "studio_credit_persona_not_creditable", {
      statusCode: 422,
      code: "studio_credit_persona_not_creditable",
      message: "studio_credit_persona_not_creditable",
    });
  const requestingPersona: StudioPersonaRefDTO = {
    ...release.artist,
    isListenable: true,
  };
  return ownerRowOf(
    demoLedgerAddCredit({
      trackId,
      releaseId,
      persona,
      role: body.role,
      requestingPersona,
      createdAt: new Date().toISOString(),
    }),
  );
}

/** DELETE /studio/tracks/:id/persona-credits/:creditId. */
export function demoStudioRemoveTrackPersonaCredit(
  trackId: string,
  creditId: string,
): void {
  demoLedgerRemoveReleaseSide(trackId, creditId);
}

/** A credit whose release the demo no longer has answers not found, as the
 *  inbox hides it. */
function assertInInbox(creditId: string): void {
  const credit = demoLedgerCreditById(creditId);
  if (credit && !releaseOfTrack(credit.releaseId, credit.trackId))
    throw creditNotFound();
}

/** POST /studio/credits/:id/accept. */
export function demoStudioAcceptCredit(
  creditId: string,
): StudioCreditInboxRowDTO {
  assertInInbox(creditId);
  const row = inboxRowOf(
    demoLedgerAcceptCredit(creditId, new Date().toISOString()),
  );
  if (!row) throw creditNotFound();
  return row;
}

/** POST /studio/credits/:id/decline. */
export function demoStudioDeclineCredit(creditId: string): void {
  assertInInbox(creditId);
  demoLedgerDeclineCredit(creditId, new Date().toISOString());
}

/** DELETE /studio/credits/:id from the credited side. */
export function demoStudioRemoveAcceptedCredit(creditId: string): void {
  assertInInbox(creditId);
  demoLedgerRemoveCreditedSide(creditId);
}
