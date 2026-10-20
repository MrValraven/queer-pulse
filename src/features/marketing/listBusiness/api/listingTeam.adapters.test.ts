import { describe, expect, it } from "vitest";
import {
  isCandidateQueryReady,
  normalizeCandidateQuery,
  normalizeRoleLabel,
  toListingTeamListingView,
  toListingTeamManagerListView,
  toListingTeamMemberViews,
  toListingWorksAtViews,
  toListingTeamPersonaView,
} from "./listingTeam.adapters";
import type {
  ListingTeamListingDTO,
  ListingTeamManagerListDTO,
  ListingTeamMemberPublicDTO,
  ListingTeamPersonaDTO,
} from "./listingTeam.types";

const personaDto: ListingTeamPersonaDTO = {
  id: "sp-1",
  handle: "agulha-lenta",
  displayName: "Agulha Lenta",
  kind: "tattoo_artist",
  avatarUrl: null,
};

const listingDto: ListingTeamListingDTO = {
  id: "l-1",
  slug: "tinta-viva",
  name: "Tinta Viva",
  cat: "tattoo",
  coverPhoto: null,
  tint: "coral",
  av: "TV",
};

function memberWithHandle(handle: string): ListingTeamMemberPublicDTO {
  return {
    persona: { ...personaDto, id: `id-${handle}`, handle },
    roleLabel: null,
  };
}

describe("listing team adapters", () => {
  it("builds a persona view with its page link and kind label", () => {
    const view = toListingTeamPersonaView(personaDto);
    expect(view.href).toBe("/p/agulha-lenta");
    expect(view.kindLabelKey).toBe("subprofiles:kind.tattoo_artist");
    expect(view.initials).toBe("AL");
    expect("avatarCrop" in view).toBe(false);
  });

  it("builds a listing view from the cover photo", () => {
    const crop = { x: 0.1, y: 0.1, width: 0.5, height: 0.5, aspect: "1:1" };
    const view = toListingTeamListingView({
      ...listingDto,
      coverPhoto: {
        image: "https://cdn.test/c.jpg",
        alt: "",
        caption: "",
        crop,
      },
    });
    expect(view.imageUrl).toBe("https://cdn.test/c.jpg");
    expect(view.imageFocus).toEqual(crop);
    expect(view.href).toBe("/local/directory/tinta-viva");
    expect(toListingTeamListingView(listingDto).imageUrl).toBeNull();
  });

  it("reads an absent team or works at list as empty", () => {
    expect(toListingTeamMemberViews(undefined)).toEqual([]);
    expect(toListingWorksAtViews(undefined)).toEqual([]);
  });

  it("keeps a hidden persona row in the manager list", () => {
    const dto: ListingTeamManagerListDTO = {
      awaitingYouCount: 0,
      requestsReceived: [],
      invitesSent: [],
      accepted: [
        {
          id: "row-1",
          status: "accepted",
          initiatedBy: "listing",
          roleLabel: null,
          position: 1,
          persona: null,
          createdAt: "2026-10-01T10:00:00.000Z",
          answeredAt: null,
        },
      ],
    };
    const view = toListingTeamManagerListView(dto);
    expect(view.accepted[0]?.id).toBe("row-1");
    expect(view.accepted[0]?.persona).toBeNull();
  });

  it("drops a public member without a handle and keeps the order", () => {
    const views = toListingTeamMemberViews([
      memberWithHandle("first"),
      memberWithHandle(""),
      memberWithHandle("third"),
    ]);
    expect(views.map((view) => view.persona.handle)).toEqual([
      "first",
      "third",
    ]);
  });

  it("turns a multi-line role label into one line", () => {
    expect(normalizeRoleLabel("  Resident\n  artist ")).toBe("Resident artist");
    expect(normalizeRoleLabel("   ")).toBeNull();
    expect(normalizeRoleLabel("x".repeat(50))).toHaveLength(40);
  });

  it("folds a Unicode line separator in a role label into one space", () => {
    expect(normalizeRoleLabel("Resident\u2028artist")).toBe("Resident artist");
    expect(normalizeRoleLabel("Front\u2029 of\u0085house")).toBe(
      "Front of house",
    );
  });

  it("drops one leading at sign from a persona search", () => {
    expect(normalizeCandidateQuery(" @agu ", { shouldDropAt: true })).toBe(
      "agu",
    );
    expect(normalizeCandidateQuery(" @agu ", { shouldDropAt: false })).toBe(
      "@agu",
    );
    expect(isCandidateQueryReady("a")).toBe(false);
    expect(isCandidateQueryReady("ag")).toBe(true);
    expect(isCandidateQueryReady("x".repeat(61))).toBe(false);
  });
});
