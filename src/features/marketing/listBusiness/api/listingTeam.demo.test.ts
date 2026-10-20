import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../../shared/api/client";
import {
  demoAcceptListingTeamInvite,
  demoCancelListingTeamInvite,
  demoDeclineListingTeamInvite,
  demoGetListingTeam,
  demoGetPersonaTeamLinks,
  demoInviteToListingTeam,
  demoListingWorksAt,
  demoPublicListingTeam,
  demoRemoveFromListingTeam,
  demoReorderListingTeam,
  demoRequestToJoinListingTeam,
  demoSearchListingTeamCandidates,
  demoUpdateListingTeamRoleLabel,
  registerDemoTeamPersonaLookup,
  replaceListingTeamDemoRows,
  resetListingTeamDemo,
  setDemoTeamPersonaHidden,
  type DemoTeamPersonaFacts,
} from "./listingTeam.demo";
import {
  DEMO_TEAM_HIDDEN_LISTING,
  DEMO_VIEWER_TEAM_PERSONA_ID,
  type DemoTeamRow,
} from "./listingTeam.demo.data";
import type { ListingTeamErrorBody } from "./listingTeam.types";

const NOW = "2026-10-19T12:00:00.000Z";
const TINTA_VIVA_REF = "QPL-DEMO-0201";
const NAVALHA_REF = "QPL-DEMO-0202";
const STUDIO_CABELO_REF = "QPL-DEMO-0203";
const NAVALHA_INVITE_ID = "demo-team-link-navalha-agulha-lenta";
const STUDIO_CABELO_REQUEST_ID = "demo-team-link-studio-cabelo-agulha-lenta";
const FUMO_AZUL_ROW_ID = "demo-team-link-tinta-viva-fumo-azul";

function refusalOf(action: () => unknown): ApiError {
  try {
    action();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("Expected the demo store to refuse");
}

function refusalBodyOf(action: () => unknown): ListingTeamErrorBody {
  return refusalOf(action).data as ListingTeamErrorBody;
}

function makeRow(index: number, overrides: Partial<DemoTeamRow>): DemoTeamRow {
  return {
    id: `filler-row-${index}`,
    listingId: "demo-listing-tinta-viva",
    subprofileId: `sp-filler-${index}`,
    status: "accepted",
    initiatedBy: "listing",
    roleLabel: null,
    position: index,
    createdAt: "2026-09-01T10:00:00.000Z",
    answeredAt: "2026-09-01T11:00:00.000Z",
    ...overrides,
  };
}

function makeRows(
  count: number,
  overrides: (index: number) => Partial<DemoTeamRow>,
): DemoTeamRow[] {
  return Array.from({ length: count }, (_unused, index) =>
    makeRow(index, overrides(index)),
  );
}

beforeEach(resetListingTeamDemo);
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse(NOW));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("listing team demo store: the seed", () => {
  it("lists Tinta Viva's four members in order with nothing waiting", () => {
    const team = demoGetListingTeam(TINTA_VIVA_REF);
    expect(team.accepted.map((row) => row.persona?.handle)).toEqual([
      "rosa-brava",
      "linha-fina",
      "agulha-lenta",
      "fumo-azul",
    ]);
    expect(team.awaitingYouCount).toBe(0);
    expect(team.requestsReceived).toEqual([]);
    expect(team.invitesSent).toEqual([]);
  });

  it("shows the demo persona one invite, one request and one team", () => {
    const links = demoGetPersonaTeamLinks(DEMO_VIEWER_TEAM_PERSONA_ID);
    expect(links.awaitingYouCount).toBe(1);
    expect(links.invitesReceived[0]?.listing.slug).toBe("navalha");
    expect(links.invitesReceived[0]?.roleLabel).toBe("Guest artist");
    expect(links.requestsSent[0]?.listing.slug).toBe("studio-cabelo");
    expect(links.accepted[0]?.listing.slug).toBe("tinta-viva");
    expect(links.accepted[0]?.isListingLive).toBe(true);
  });

  it("answers a business ref it does not know with a plain 404", () => {
    const refusal = refusalOf(() => demoGetListingTeam("QPL-DEMO-9999"));
    expect(refusal.status).toBe(404);
  });

  it("answers a persona id it does not know with the persona code", () => {
    const body = refusalBodyOf(() => demoGetPersonaTeamLinks("sp-unknown"));
    expect(body.code).toBe("listing_team_persona_not_found");
    expect(body.statusCode).toBe(404);
  });
});

describe("listing team demo store: answering", () => {
  it("puts an accepted invite at the end of the team", () => {
    const row = demoAcceptListingTeamInvite(
      DEMO_VIEWER_TEAM_PERSONA_ID,
      NAVALHA_INVITE_ID,
    );
    expect(row.status).toBe("accepted");
    expect(row.answeredAt).toBe(NOW);
    const navalha = demoGetListingTeam(NAVALHA_REF);
    expect(navalha.accepted).toHaveLength(1);
    expect(navalha.accepted[0]?.status).toBe("accepted");
    expect(navalha.accepted[0]?.position).toBe(0);
    expect(navalha.invitesSent).toEqual([]);
    expect(
      demoGetPersonaTeamLinks(DEMO_VIEWER_TEAM_PERSONA_ID).awaitingYouCount,
    ).toBe(0);
    expect(
      demoListingWorksAt(DEMO_VIEWER_TEAM_PERSONA_ID).map(
        (worksAt) => worksAt.slug,
      ),
    ).toEqual(["tinta-viva", "navalha"]);
  });

  it("starts a 14 day cooldown on a decline", () => {
    demoDeclineListingTeamInvite(
      DEMO_VIEWER_TEAM_PERSONA_ID,
      NAVALHA_INVITE_ID,
    );
    vi.setSystemTime(Date.parse("2026-10-20T12:00:00.000Z"));
    const refusal = refusalOf(() =>
      demoInviteToListingTeam(NAVALHA_REF, {
        subprofileId: DEMO_VIEWER_TEAM_PERSONA_ID,
      }),
    );
    const body = refusal.data as ListingTeamErrorBody;
    expect(refusal.status).toBe(409);
    expect(body.code).toBe("listing_team_cooldown");
    expect(body.retryAt).toBe("2026-11-02T12:00:00.000Z");
  });

  it("keeps the cooldown on the side that was declined", () => {
    demoDeclineListingTeamInvite(
      DEMO_VIEWER_TEAM_PERSONA_ID,
      NAVALHA_INVITE_ID,
    );
    const row = demoRequestToJoinListingTeam(DEMO_VIEWER_TEAM_PERSONA_ID, {
      listingId: "demo-listing-navalha",
    });
    expect(row.status).toBe("pending");
    expect(row.initiatedBy).toBe("persona");
  });

  it("refuses a second pending row for the same pair", () => {
    const body = refusalBodyOf(() =>
      demoInviteToListingTeam(NAVALHA_REF, {
        subprofileId: DEMO_VIEWER_TEAM_PERSONA_ID,
      }),
    );
    expect(body.code).toBe("listing_team_already_pending");
    expect(body.initiatedBy).toBe("listing");
  });

  it("refuses a route on a row of the other direction", () => {
    const wrongDirection = refusalOf(() =>
      demoCancelListingTeamInvite(STUDIO_CABELO_REF, STUDIO_CABELO_REQUEST_ID),
    );
    expect(wrongDirection.status).toBe(404);
    expect((wrongDirection.data as ListingTeamErrorBody).code).toBe(
      "listing_team_link_not_found",
    );
    const notAccepted = refusalOf(() =>
      demoRemoveFromListingTeam(NAVALHA_REF, NAVALHA_INVITE_ID),
    );
    expect(notAccepted.status).toBe(409);
    expect((notAccepted.data as ListingTeamErrorBody).code).toBe(
      "listing_team_not_accepted",
    );
  });

  it("refuses a role label change on an ended row", () => {
    demoCancelListingTeamInvite(NAVALHA_REF, NAVALHA_INVITE_ID);
    const body = refusalBodyOf(() =>
      demoUpdateListingTeamRoleLabel(NAVALHA_REF, NAVALHA_INVITE_ID, {
        roleLabel: "Resident artist",
      }),
    );
    expect(body.code).toBe("listing_team_not_pending");
    expect(demoGetListingTeam(NAVALHA_REF).invitesSent).toEqual([]);
  });

  it("trims a role label and stores an all-space one as null", () => {
    const row = demoInviteToListingTeam(NAVALHA_REF, {
      subprofileId: "sp-rita-rosa-brava",
      roleLabel: "  Guest artist  ",
    });
    expect(row.roleLabel).toBe("Guest artist");
    const cleared = demoUpdateListingTeamRoleLabel(NAVALHA_REF, row.id, {
      roleLabel: "   ",
    });
    expect(cleared.roleLabel).toBeNull();
  });
});

describe("listing team demo store: caps", () => {
  it("refuses past every cap", () => {
    replaceListingTeamDemoRows(makeRows(40, () => ({})));
    expect(
      refusalBodyOf(() =>
        demoInviteToListingTeam(TINTA_VIVA_REF, {
          subprofileId: "sp-rita-rosa-brava",
        }),
      ).code,
    ).toBe("listing_team_full");

    replaceListingTeamDemoRows(
      makeRows(40, () => ({
        status: "pending",
        position: null,
        answeredAt: null,
      })),
    );
    expect(
      refusalBodyOf(() =>
        demoInviteToListingTeam(TINTA_VIVA_REF, {
          subprofileId: "sp-rita-rosa-brava",
        }),
      ).code,
    ).toBe("listing_team_pending_full");

    replaceListingTeamDemoRows(
      makeRows(10, (index) => ({
        listingId: `demo-listing-filler-${index}`,
        subprofileId: DEMO_VIEWER_TEAM_PERSONA_ID,
        position: 0,
      })),
    );
    expect(
      refusalBodyOf(() =>
        demoInviteToListingTeam(NAVALHA_REF, {
          subprofileId: DEMO_VIEWER_TEAM_PERSONA_ID,
        }),
      ).code,
    ).toBe("listing_team_persona_full");

    replaceListingTeamDemoRows(
      makeRows(10, (index) => ({
        listingId: `demo-listing-filler-${index}`,
        subprofileId: DEMO_VIEWER_TEAM_PERSONA_ID,
        status: "pending",
        initiatedBy: "persona",
        position: null,
        answeredAt: null,
      })),
    );
    expect(
      refusalBodyOf(() =>
        demoRequestToJoinListingTeam(DEMO_VIEWER_TEAM_PERSONA_ID, {
          listingId: "demo-listing-navalha",
        }),
      ).code,
    ).toBe("listing_team_persona_requests_full");
  });

  it("refuses a reorder that names a different set", () => {
    const ids = demoGetListingTeam(TINTA_VIVA_REF).accepted.map(
      (row) => row.id,
    );
    const firstId = ids[0] ?? "";
    expect(
      refusalBodyOf(() =>
        demoReorderListingTeam(TINTA_VIVA_REF, { memberIds: [firstId] }),
      ).code,
    ).toBe("listing_team_order_mismatch");
    const reversed = [...ids].reverse();
    const result = demoReorderListingTeam(TINTA_VIVA_REF, {
      memberIds: reversed,
    });
    expect(result.accepted.map((row) => row.id)).toEqual(reversed);
    expect(result.accepted.map((row) => row.position)).toEqual([0, 1, 2, 3]);
    expect(
      demoGetListingTeam(TINTA_VIVA_REF).accepted.map((row) => row.id),
    ).toEqual(reversed);
  });
});

describe("listing team demo store: public reads", () => {
  it("hides a hidden persona from the page and keeps its row for the business", () => {
    setDemoTeamPersonaHidden("sp-kai-linha-fina", true);
    const accepted = demoGetListingTeam(TINTA_VIVA_REF).accepted;
    expect(accepted).toHaveLength(4);
    expect(
      accepted.find((row) => row.id === "demo-team-link-tinta-viva-linha-fina")
        ?.persona,
    ).toBeNull();
    expect(
      demoPublicListingTeam("tinta-viva").map(
        (member) => member.persona.handle,
      ),
    ).toEqual(["rosa-brava", "agulha-lenta", "fumo-azul"]);
    expect(demoSearchListingTeamCandidates(NAVALHA_REF, "linha").items).toEqual(
      [],
    );
  });

  it("takes a removed member off the page straight away", () => {
    demoRemoveFromListingTeam(TINTA_VIVA_REF, FUMO_AZUL_ROW_ID);
    expect(demoPublicListingTeam("tinta-viva")).toHaveLength(3);
    expect(demoListingWorksAt("sp-anika-fumo-azul")).toEqual([]);
    expect(demoGetListingTeam(TINTA_VIVA_REF).accepted).toHaveLength(3);
  });

  it("marks a link to a listing hidden from the directory", () => {
    replaceListingTeamDemoRows([
      makeRow(0, {
        listingId: DEMO_TEAM_HIDDEN_LISTING.id,
        subprofileId: DEMO_VIEWER_TEAM_PERSONA_ID,
      }),
    ]);
    const links = demoGetPersonaTeamLinks(DEMO_VIEWER_TEAM_PERSONA_ID);
    expect(links.accepted[0]?.listing.slug).toBe(DEMO_TEAM_HIDDEN_LISTING.slug);
    expect(links.accepted[0]?.isListingLive).toBe(false);
    expect(demoListingWorksAt(DEMO_VIEWER_TEAM_PERSONA_ID)).toEqual([]);
  });
});

describe("listing team demo store: candidates", () => {
  it("matches a handle prefix and marks the pair", () => {
    const items = demoSearchListingTeamCandidates(NAVALHA_REF, "agu").items;
    expect(items).toHaveLength(1);
    expect(items[0]?.persona.handle).toBe("agulha-lenta");
    expect(items[0]?.teamStatus).toBe("pending");
  });

  it("puts an exact handle match first", () => {
    const items = demoSearchListingTeamCandidates(
      NAVALHA_REF,
      "fumo-azul",
    ).items;
    expect(items[0]?.persona.handle).toBe("fumo-azul");
    expect(items[0]?.teamStatus).toBeNull();
  });

  it("drops a leading at sign and refuses a query under two characters", () => {
    expect(
      demoSearchListingTeamCandidates(NAVALHA_REF, "@agu").items[0]?.persona
        .handle,
    ).toBe("agulha-lenta");
    expect(
      refusalOf(() => demoSearchListingTeamCandidates(NAVALHA_REF, "@a"))
        .status,
    ).toBe(400);
  });
});

describe("listing team demo store: other viewer personas", () => {
  const PUBLISHED_PERSONA: DemoTeamPersonaFacts = {
    id: "sp-viewer-noite-clara",
    handle: "noite-clara",
    displayName: "Noite Clara",
    kind: "tattoo_artist",
    avatarUrl: null,
    status: "published",
    visibility: "open",
    removedAt: null,
    linkVisibility: "unlinked",
    ownerName: null,
  };
  const DRAFT_PERSONA: DemoTeamPersonaFacts = {
    ...PUBLISHED_PERSONA,
    id: "sp-viewer-rascunho",
    handle: "rascunho",
    status: "draft",
  };
  const viewerPersonas = [PUBLISHED_PERSONA, DRAFT_PERSONA];

  beforeEach(() => {
    registerDemoTeamPersonaLookup(
      (subprofileId) =>
        viewerPersonas.find((persona) => persona.id === subprofileId) ?? null,
    );
  });
  afterEach(() => {
    registerDemoTeamPersonaLookup(() => null);
  });

  it("gives another viewer persona empty lists", () => {
    const links = demoGetPersonaTeamLinks(PUBLISHED_PERSONA.id);
    expect(links.awaitingYouCount).toBe(0);
    expect(links.invitesReceived).toEqual([]);
    expect(links.requestsSent).toEqual([]);
    expect(links.accepted).toEqual([]);
  });

  it("accepts a request from another eligible viewer persona", () => {
    const row = demoRequestToJoinListingTeam(PUBLISHED_PERSONA.id, {
      listingId: "demo-listing-navalha",
    });
    expect(row.status).toBe("pending");
    expect(row.initiatedBy).toBe("persona");
    expect(row.listing.slug).toBe("navalha");
    const links = demoGetPersonaTeamLinks(PUBLISHED_PERSONA.id);
    expect(links.requestsSent.map((sent) => sent.id)).toEqual([row.id]);
    const team = demoGetListingTeam(NAVALHA_REF);
    const received = team.requestsReceived.find(
      (request) => request.id === row.id,
    );
    expect(received?.persona?.handle).toBe("noite-clara");
  });

  it("refuses a request from a viewer persona that is still a draft", () => {
    const body = refusalBodyOf(() =>
      demoRequestToJoinListingTeam(DRAFT_PERSONA.id, {
        listingId: "demo-listing-navalha",
      }),
    );
    expect(body.code).toBe("listing_team_persona_ineligible");
    expect(body.statusCode).toBe(422);
  });

  it("keeps the 404 for a persona id no store knows", () => {
    const body = refusalBodyOf(() => demoGetPersonaTeamLinks("sp-unknown"));
    expect(body.code).toBe("listing_team_persona_not_found");
  });

  it("refuses a role label with a Unicode line separator", () => {
    const refusal = refusalOf(() =>
      demoInviteToListingTeam(NAVALHA_REF, {
        subprofileId: "sp-anika-fumo-azul",
        roleLabel: "Guest\u2028artist",
      }),
    );
    expect(refusal.status).toBe(400);
  });
});
