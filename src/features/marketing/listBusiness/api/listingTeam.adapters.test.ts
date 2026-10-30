import { describe, expect, it } from "vitest";
import {
  isCandidateQueryReady,
  normalizeCandidateQuery,
  normalizeRoleLabel,
  toListingTeamListingView,
  toListingTeamManagerListView,
  toListingTeamMemberLinkListView,
  toListingTeamMemberProfileView,
  toListingTeamMemberViews,
  toListingWorksAtViews,
  toListingTeamPersonaView,
} from "./listingTeam.adapters";
import type {
  ListingTeamListingDTO,
  ListingTeamManagerListDTO,
  ListingTeamMemberLinkListDTO,
  ListingTeamMemberPublicDTO,
  ListingTeamPersonaDTO,
} from "./listingTeam.types";

const personaDto: ListingTeamPersonaDTO = {
  id: "sp-1",
  handle: "agulha-lenta",
  displayName: "Agulha Lenta",
  kind: "tattoo_artist",
  avatarUrl: null,
  ownerName: null,
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

type PersonaPublicDTO = Extract<
  ListingTeamMemberPublicDTO,
  { persona: ListingTeamPersonaDTO }
>;

function memberWithHandle(handle: string): PersonaPublicDTO {
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

  it("names a craft-named linked persona after its owner", () => {
    const view = toListingTeamPersonaView({
      ...personaDto,
      displayName: "Tattoo artist",
      ownerName: "Beatriz Pinto",
    });
    expect(view.ownerName).toBe("Beatriz Pinto");
    expect(view.titleName).toBe("Beatriz Pinto | Tattoo artist");
    expect(view.nameBesideCraft).toBe("Beatriz Pinto");
    expect(view.initials).toBe("BP");
  });

  it("keeps the display name of a craft-named unlinked persona", () => {
    const view = toListingTeamPersonaView({
      ...personaDto,
      displayName: "Tattoo artist",
      ownerName: null,
    });
    expect(view.titleName).toBe("Tattoo artist");
    expect(view.nameBesideCraft).toBe("Tattoo artist");
    expect(view.initials).toBe("TA");
  });

  it("keeps a real name even when the owner is known", () => {
    const view = toListingTeamPersonaView({
      ...personaDto,
      ownerName: "Tiago Costa",
    });
    expect(view.titleName).toBe("Agulha Lenta");
    expect(view.initials).toBe("AL");
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
    expect(views.map((view) => view.persona?.handle)).toEqual([
      "first",
      "third",
    ]);
    expect(views.map((view) => view.kind)).toEqual(["persona", "persona"]);
  });
});

describe("listing team adapters: members", () => {
  it("builds a member profile view with its page link and initials", () => {
    const view = toListingTeamMemberProfileView({
      slug: "catarina-vaz",
      name: "Catarina Vaz",
      avatarUrl: null,
    });
    expect(view.href).toBe("/members/catarina-vaz");
    expect(view.initials).toBe("CV");
    expect("avatarCrop" in view).toBe(false);
    const crop = { x: 0.1, y: 0.1, width: 0.5, height: 0.5, aspect: "1:1" };
    expect(
      toListingTeamMemberProfileView({
        slug: "catarina-vaz",
        name: "Catarina Vaz",
        avatarUrl: "https://cdn.test/a.jpg",
        avatarCrop: crop,
      }).avatarCrop,
    ).toEqual(crop);
  });

  it("keeps both kinds of the public team in the order sent", () => {
    const views = toListingTeamMemberViews([
      memberWithHandle("first"),
      {
        kind: "member",
        member: { slug: "catarina-vaz", name: "Catarina Vaz", avatarUrl: null },
        roleLabel: "Front of house",
      },
      { ...memberWithHandle("third"), kind: "persona" },
    ]);
    expect(views.map((view) => view.kind)).toEqual([
      "persona",
      "member",
      "persona",
    ]);
    expect(views[1]?.member?.name).toBe("Catarina Vaz");
    expect(views[1]?.persona).toBeUndefined();
    expect(views[1]?.roleLabel).toBe("Front of house");
    expect(views[0]?.member).toBeUndefined();
  });

  it("drops a public member without a slug", () => {
    const views = toListingTeamMemberViews([
      {
        kind: "member",
        member: { slug: "", name: "Nobody", avatarUrl: null },
        roleLabel: null,
      },
    ]);
    expect(views).toEqual([]);
  });

  it("reads a manager row of either kind and treats a missing kind as persona", () => {
    const base = {
      status: "accepted" as const,
      initiatedBy: "listing" as const,
      roleLabel: null,
      position: 0,
      createdAt: "2026-10-01T10:00:00.000Z",
      answeredAt: null,
    };
    const view = toListingTeamManagerListView({
      awaitingYouCount: 0,
      requestsReceived: [],
      invitesSent: [],
      accepted: [
        { ...base, id: "row-persona", persona: personaDto },
        {
          ...base,
          id: "row-member",
          kind: "member",
          member: { slug: "jonas", name: "Jonas Ferreira", avatarUrl: null },
        },
        { ...base, id: "row-hidden-member", kind: "member", member: null },
      ],
    });
    expect(view.accepted.map((row) => row.kind)).toEqual([
      "persona",
      "member",
      "member",
    ]);
    expect(view.accepted[0]?.persona?.handle).toBe("agulha-lenta");
    expect(view.accepted[1]?.member?.initials).toBe("JF");
    expect(view.accepted[2]?.member).toBeNull();
  });

  it("builds the member side list with the listing page link", () => {
    const dto: ListingTeamMemberLinkListDTO = {
      awaitingYouCount: 1,
      invitesReceived: [
        {
          id: "link-1",
          status: "pending",
          initiatedBy: "listing",
          roleLabel: "Colourist",
          listing: listingDto,
          isListingLive: true,
          createdAt: "2026-10-14T11:05:00.000Z",
          answeredAt: null,
        },
      ],
      accepted: [],
    };
    const view = toListingTeamMemberLinkListView(dto);
    expect(view.awaitingYouCount).toBe(1);
    expect(view.invitesReceived[0]?.listing.href).toBe(
      "/local/directory/tinta-viva",
    );
    expect(view.accepted).toEqual([]);
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
