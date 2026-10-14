import { ApiError } from "../../../shared/api/client";
import {
  STUDIO_DISCOVERY_LIMITS,
  type StudioCreditRole,
  type StudioPersonaRefDTO,
} from "./studio.types";
import {
  DEMO_PERSONA_CREDITS,
  isDemoPersonaPublic,
  type DemoPersonaCredit,
} from "./studioDemoCredits.data";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";

/** The demo's persona credits, held in memory for the session and seeded
 *  from DEMO_PERSONA_CREDITS. A write here is what the next read returns,
 *  the way the live server answers, so a credit survives the react-query
 *  cache dropping a query. Every demo credit read (track chips, the album
 *  summary, Appears on, related artists, the editor rows, the inbox and its
 *  count) and every demo credit write goes through this module.
 *
 *  studioDemoCredits.data.ts reads this module and this module reads its
 *  seed, so the seed is copied on first use. No module calls into the
 *  ledger while it loads: studioDemo.data.ts seeds every release with an
 *  empty personaCredits list and demoStudioRelease fills it from the
 *  ledger on each read. */

interface DemoLedgerCredit extends DemoPersonaCredit {
  /** The demo twin of `requester_dismissed_at`: a removed declined credit
   *  leaves the owner rows and the track's limit count, and still blocks
   *  the same persona and role. */
  isRequesterDismissed: boolean;
}

let ledger: DemoLedgerCredit[] | null = null;
let demoSequence = 0;

function ledgerRows(): DemoLedgerCredit[] {
  ledger ??= DEMO_PERSONA_CREDITS.map((credit) => ({
    ...credit,
    isRequesterDismissed: false,
  }));
  return ledger;
}

/** Back to the seed. Tests call it between cases. */
export function resetDemoCreditLedger(): void {
  ledger = null;
  demoSequence = 0;
}

const refusal = (status: 404 | 409 | 422, code: string) =>
  new ApiError(status, code, { statusCode: status, code, message: code });
export const creditNotFound = () => refusal(404, "studio_credit_not_found");

/** The demo viewer's personas: the credited side of the inbox and the
 *  requesting side of the track editor. */
export function isDemoViewerPersona(personaId: string): boolean {
  return DEMO_STUDIO_ME.uploadablePersonas.some(
    (persona) => persona.id === personaId,
  );
}

const withoutDismissal = ({
  isRequesterDismissed: _dismissed,
  ...credit
}: DemoLedgerCredit): DemoPersonaCredit => credit;

/** Every credit the requester has kept, in seed then request order. */
export function demoLedgerCredits(): DemoPersonaCredit[] {
  return ledgerRows()
    .filter((credit) => !credit.isRequesterDismissed)
    .map(withoutDismissal);
}

/** The one source for public credit surfaces: accepted credits to public
 *  personas. Fail closed, as the server's public reads do. */
export function demoAcceptedPublicCredits(): DemoPersonaCredit[] {
  return demoLedgerCredits().filter(
    (credit) =>
      credit.status === "accepted" && isDemoPersonaPublic(credit.persona),
  );
}

export function demoLedgerCreditById(
  creditId: string,
): DemoPersonaCredit | null {
  const credit = ledgerRows().find((candidate) => candidate.id === creditId);
  return credit ? withoutDismissal(credit) : null;
}

function updateCredit(
  creditId: string,
  update: (credit: DemoLedgerCredit) => DemoLedgerCredit | null,
): void {
  ledger = ledgerRows().flatMap((credit) => {
    if (credit.id !== creditId) return [credit];
    const updated = update(credit);
    return updated ? [updated] : [];
  });
}

export interface DemoLedgerCreditRequest {
  trackId: string;
  releaseId: string;
  persona: StudioPersonaRefDTO;
  role: StudioCreditRole;
  /** The release's persona. */
  requestingPersona: StudioPersonaRefDTO;
  createdAt: string;
}

/** POST /studio/tracks/:id/persona-credits: the row lands as pending. */
export function demoLedgerAddCredit(
  request: DemoLedgerCreditRequest,
): DemoPersonaCredit {
  if (request.persona.id === request.requestingPersona.id)
    throw refusal(422, "studio_credit_self_persona");
  const onTrack = ledgerRows().filter(
    (credit) => credit.trackId === request.trackId,
  );
  const isAlreadyRequested = onTrack.some(
    (credit) =>
      credit.persona.id === request.persona.id && credit.role === request.role,
  );
  if (isAlreadyRequested) throw refusal(409, "studio_credit_already_requested");
  // The limit counts the rows the requester still sees, as the server does.
  const visibleOnTrack = onTrack.filter(
    (credit) => !credit.isRequesterDismissed,
  );
  if (visibleOnTrack.length >= STUDIO_DISCOVERY_LIMITS.personaCreditsPerTrack)
    throw refusal(409, "studio_credit_limit");
  const credit: DemoLedgerCredit = {
    ...request,
    id: `demo-credit-added-${(demoSequence += 1)}`,
    status: "pending",
    respondedAt: null,
    isRequesterDismissed: false,
  };
  ledger = [...ledgerRows(), credit];
  return withoutDismissal(credit);
}

/** A credit the demo viewer's inbox shows: credited to one of the viewer's
 *  personas and asked for by a public persona. Anything else answers not
 *  found, so an id is never confirmed. */
function inboxCredit(creditId: string): DemoLedgerCredit {
  const credit = ledgerRows().find((candidate) => candidate.id === creditId);
  if (
    !credit ||
    !isDemoViewerPersona(credit.persona.id) ||
    !isDemoPersonaPublic(credit.requestingPersona)
  )
    throw creditNotFound();
  return credit;
}

function answerRequest(
  creditId: string,
  status: "accepted" | "declined",
  respondedAt: string,
): DemoPersonaCredit {
  const credit = inboxCredit(creditId);
  if (credit.status !== "pending")
    throw refusal(409, "studio_credit_not_pending");
  const answered = { ...credit, status, respondedAt };
  updateCredit(creditId, () => answered);
  return withoutDismissal(answered);
}

/** POST /studio/credits/:id/accept. */
export function demoLedgerAcceptCredit(
  creditId: string,
  respondedAt: string,
): DemoPersonaCredit {
  return answerRequest(creditId, "accepted", respondedAt);
}

/** POST /studio/credits/:id/decline. */
export function demoLedgerDeclineCredit(
  creditId: string,
  respondedAt: string,
): void {
  answerRequest(creditId, "declined", respondedAt);
}

/** DELETE from the release side: a pending or accepted row goes; a declined
 *  row is dismissed, leaves the owner rows and keeps blocking a repeat. */
export function demoLedgerRemoveReleaseSide(
  trackId: string,
  creditId: string,
): void {
  const credit = ledgerRows().find(
    (candidate) =>
      candidate.id === creditId &&
      candidate.trackId === trackId &&
      !candidate.isRequesterDismissed &&
      isDemoViewerPersona(candidate.requestingPersona.id),
  );
  if (!credit) throw creditNotFound();
  updateCredit(creditId, (current) =>
    current.status === "declined"
      ? { ...current, isRequesterDismissed: true }
      : null,
  );
}

/** DELETE /studio/credits/:id from the credited side: accepted rows only. */
export function demoLedgerRemoveCreditedSide(creditId: string): void {
  const credit = inboxCredit(creditId);
  if (credit.status !== "accepted")
    throw refusal(409, "studio_credit_not_accepted");
  updateCredit(creditId, () => null);
}
