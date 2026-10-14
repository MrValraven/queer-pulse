import {
  STUDIO_CREDIT_ROLES,
  type StudioCreditRole,
  type StudioPersonaCreditPublicDTO,
  type StudioPersonaCreditStatus,
  type StudioPersonaRefDTO,
  type StudioReleaseCreditSummaryDTO,
} from "./studio.types";
import { demoAcceptedPublicCredits } from "./studioDemoCreditLedger";
import {
  DEMO_ARTIST_LECHATDASHINKO,
  DEMO_ARTIST_MARIANA,
  DEMO_ARTIST_NIGHTFORM,
} from "./studioDemoMe.data";

// The seed of the demo's persona credit ledger (studioDemoCreditLedger.ts).
// Every public view (track chips, the album summary, Appears on, related
// artists) and every owner view (the track editor rows, the inbox) is
// derived from the ledger, which starts from these rows.

export const DEMO_PERSONA_MARIANA: StudioPersonaRefDTO = {
  id: DEMO_ARTIST_MARIANA.id,
  handle: DEMO_ARTIST_MARIANA.handle,
  name: DEMO_ARTIST_MARIANA.name,
  kind: DEMO_ARTIST_MARIANA.kind,
  avatarUrl: DEMO_ARTIST_MARIANA.avatarUrl,
  isListenable: true,
};
export const DEMO_PERSONA_NIGHTFORM: StudioPersonaRefDTO = {
  ...DEMO_ARTIST_NIGHTFORM,
  isListenable: true,
};
export const DEMO_PERSONA_LECHATDASHINKO: StudioPersonaRefDTO = {
  ...DEMO_ARTIST_LECHATDASHINKO,
  isListenable: true,
};
/** A visual artist: credited for cover art, linked to the persona page. */
export const DEMO_PERSONA_GRAIN: StudioPersonaRefDTO = {
  id: "sp-andre-grain",
  handle: "grain-studio",
  name: "GRAIN",
  kind: "visual_artist",
  avatarUrl:
    "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?q=80&w=800&auto=format&fit=crop",
  isListenable: false,
};
export const DEMO_PERSONA_VANDA: StudioPersonaRefDTO = {
  id: "sp-ines-fonseca-vanda-diesel",
  handle: "vanda-diesel",
  name: "Vanda Diesel",
  kind: "drag",
  avatarUrl:
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop",
  isListenable: false,
};

export interface DemoPersonaCredit {
  id: string;
  trackId: string;
  releaseId: string;
  persona: StudioPersonaRefDTO;
  role: StudioCreditRole;
  status: StudioPersonaCreditStatus;
  /** The release's persona. */
  requestingPersona: StudioPersonaRefDTO;
  createdAt: string;
  respondedAt: string | null;
}

const CIDADE_SIX = "demo-track-cidade-dos-santos-06";
const CIDADE = "demo-release-cidade-dos-santos";

export const DEMO_PERSONA_CREDITS: DemoPersonaCredit[] = [
  {
    id: "demo-credit-1",
    trackId: CIDADE_SIX,
    releaseId: CIDADE,
    persona: DEMO_PERSONA_NIGHTFORM,
    role: "producer",
    status: "accepted",
    requestingPersona: DEMO_PERSONA_MARIANA,
    createdAt: "2026-04-02T10:00:00.000Z",
    respondedAt: "2026-04-03T10:00:00.000Z",
  },
  {
    id: "demo-credit-2",
    trackId: CIDADE_SIX,
    releaseId: CIDADE,
    persona: DEMO_PERSONA_GRAIN,
    role: "cover-art",
    status: "accepted",
    requestingPersona: DEMO_PERSONA_MARIANA,
    createdAt: "2026-04-02T11:00:00.000Z",
    respondedAt: "2026-04-04T10:00:00.000Z",
  },
  {
    id: "demo-credit-3",
    trackId: CIDADE_SIX,
    releaseId: CIDADE,
    persona: DEMO_PERSONA_LECHATDASHINKO,
    role: "remix",
    status: "pending",
    requestingPersona: DEMO_PERSONA_MARIANA,
    createdAt: "2026-10-09T10:00:00.000Z",
    respondedAt: null,
  },
  {
    id: "demo-credit-4",
    trackId: CIDADE_SIX,
    releaseId: CIDADE,
    persona: DEMO_PERSONA_VANDA,
    role: "featured",
    status: "declined",
    requestingPersona: DEMO_PERSONA_MARIANA,
    createdAt: "2026-10-07T10:00:00.000Z",
    respondedAt: "2026-10-08T10:00:00.000Z",
  },
  {
    id: "demo-credit-5",
    trackId: "demo-track-home-2-01",
    releaseId: "demo-release-home-2",
    persona: DEMO_PERSONA_MARIANA,
    role: "featured",
    status: "pending",
    requestingPersona: DEMO_PERSONA_LECHATDASHINKO,
    createdAt: "2026-10-12T10:00:00.000Z",
    respondedAt: null,
  },
  {
    id: "demo-credit-6",
    trackId: "demo-track-home-4-01",
    releaseId: "demo-release-home-4",
    persona: DEMO_PERSONA_MARIANA,
    role: "co-writer",
    status: "pending",
    requestingPersona: DEMO_PERSONA_NIGHTFORM,
    createdAt: "2026-10-11T10:00:00.000Z",
    respondedAt: null,
  },
  {
    id: "demo-credit-7",
    trackId: "demo-track-home-4-01",
    releaseId: "demo-release-home-4",
    persona: DEMO_PERSONA_MARIANA,
    role: "mixing",
    status: "accepted",
    requestingPersona: DEMO_PERSONA_NIGHTFORM,
    createdAt: "2026-06-20T10:00:00.000Z",
    respondedAt: "2026-06-21T10:00:00.000Z",
  },
  {
    id: "demo-credit-8",
    trackId: "demo-track-home-2-01",
    releaseId: "demo-release-home-2",
    persona: DEMO_PERSONA_VANDA,
    role: "featured",
    status: "accepted",
    requestingPersona: DEMO_PERSONA_LECHATDASHINKO,
    createdAt: "2026-08-15T10:00:00.000Z",
    respondedAt: "2026-08-16T10:00:00.000Z",
  },
];

/** Public personas with handles the demo's credit lookup finds. */
export const DEMO_CREDIT_CANDIDATES: StudioPersonaRefDTO[] = [
  DEMO_PERSONA_NIGHTFORM,
  DEMO_PERSONA_LECHATDASHINKO,
  DEMO_PERSONA_GRAIN,
  DEMO_PERSONA_VANDA,
];

const roleOrderOf = (role: StudioCreditRole) =>
  STUDIO_CREDIT_ROLES.indexOf(role);

/** The personas the demo treats as public. Fail closed, as the server's
 *  public reads do: a persona left off this list is hidden from every
 *  public credit surface. */
const DEMO_PUBLIC_PERSONA_IDS: ReadonlySet<string> = new Set(
  [
    DEMO_PERSONA_MARIANA,
    DEMO_PERSONA_NIGHTFORM,
    DEMO_PERSONA_LECHATDASHINKO,
    DEMO_PERSONA_GRAIN,
    DEMO_PERSONA_VANDA,
  ].map((persona) => persona.id),
);

export function isDemoPersonaPublic(persona: StudioPersonaRefDTO): boolean {
  return DEMO_PUBLIC_PERSONA_IDS.has(persona.id);
}

/** A track's public chips, read from the ledger: accepted credits to public
 *  personas only, role order then age. */
export function demoPublicCreditsOfTrack(
  trackId: string,
): StudioPersonaCreditPublicDTO[] {
  return demoAcceptedPublicCredits()
    .filter((credit) => credit.trackId === trackId)
    .sort(
      (left, right) =>
        roleOrderOf(left.role) - roleOrderOf(right.role) ||
        left.createdAt.localeCompare(right.createdAt),
    )
    .map((credit) => ({ persona: credit.persona, role: credit.role }));
}

/** The album page summary: one row per persona, by the first track that
 *  credits it, with distinct roles in role order. */
export function demoCreditSummariesOfRelease(
  releaseId: string,
): StudioReleaseCreditSummaryDTO[] {
  const rows = new Map<string, StudioReleaseCreditSummaryDTO>();
  const credits = demoAcceptedPublicCredits()
    .filter((credit) => credit.releaseId === releaseId)
    .sort((left, right) => left.trackId.localeCompare(right.trackId));
  for (const credit of credits) {
    const row = rows.get(credit.persona.id) ?? {
      persona: credit.persona,
      roles: [],
    };
    if (!row.roles.includes(credit.role)) row.roles.push(credit.role);
    rows.set(credit.persona.id, row);
  }
  return [...rows.values()].map((row) => ({
    ...row,
    roles: [...row.roles].sort(
      (left, right) => roleOrderOf(left) - roleOrderOf(right),
    ),
  }));
}
