import { beforeEach, describe, expect, it } from "vitest";
import {
  demoPublicListingTeam,
  resetListingTeamDemo,
} from "./listBusiness/api/listingTeam.demo";
import {
  DEMO_TEAM_LISTINGS,
  DEMO_TEAM_MEMBERS,
  DEMO_TEAM_ROWS,
  DEMO_TEAM_PERSONAS,
  DEMO_VIEWER_TEAM_PERSONA_ID,
} from "./listBusiness/api/listingTeam.demo.data";
import { getPlace } from "./directoryPlaces";
import {
  DEMO_SUBPROFILES,
  mockMineSubprofiles,
  toPublicDto,
} from "../subprofiles/data/subprofiles.data";

describe("demo team fixtures", () => {
  beforeEach(resetListingTeamDemo);

  it("gives every demo team listing a matching directory place", () => {
    for (const listing of DEMO_TEAM_LISTINGS) {
      const place = getPlace(listing.slug);
      expect(place, listing.slug).toBeDefined();
      expect(place?.name).toBe(listing.name);
      expect(place?.cat).toBe(listing.cat);
      expect(place?.av).toBe(listing.av);
      expect(place?.tint).toBe(listing.tint);
    }
  });

  it("gives every demo team persona a matching published persona", () => {
    for (const persona of DEMO_TEAM_PERSONAS) {
      const subprofile = DEMO_SUBPROFILES.find(
        (candidate) => candidate.id === persona.id,
      );
      expect(subprofile, persona.id).toBeDefined();
      expect(subprofile?.handle).toBe(persona.handle);
      expect(subprofile?.displayName).toBe(persona.displayName);
      expect(subprofile?.kind).toBe(persona.kind);
      expect(subprofile?.status).toBe("published");
      expect(["open", "network"]).toContain(subprofile?.visibility);
    }
  });

  it("carries the owner name only on a linked demo team persona", () => {
    for (const persona of DEMO_TEAM_PERSONAS) {
      const subprofile = DEMO_SUBPROFILES.find(
        (candidate) => candidate.id === persona.id,
      );
      const expectedOwnerName =
        subprofile?.linkVisibility === "linked" ? subprofile.ownerName : null;
      expect(persona.ownerName, persona.id).toBe(expectedOwnerName);
    }
    expect(
      DEMO_TEAM_PERSONAS.some(
        (persona) =>
          persona.displayName === "Tattoo artist" && persona.ownerName !== null,
      ),
    ).toBe(true);
  });

  it("lets the demo viewer edit the persona the store invites", () => {
    const mineIds = mockMineSubprofiles().map((subprofile) => subprofile.id);
    expect(mineIds).toContain(DEMO_VIEWER_TEAM_PERSONA_ID);
  });

  it("shows Works at on every Tinta Viva persona", () => {
    const tattooIds = [
      "sp-rita-rosa-brava",
      "sp-kai-linha-fina",
      "sp-tiago-agulha-lenta",
      "sp-anika-fumo-azul",
    ];
    for (const personaId of tattooIds) {
      const subprofile = DEMO_SUBPROFILES.find(
        (candidate) => candidate.id === personaId,
      );
      expect(subprofile, personaId).toBeDefined();
      if (subprofile) {
        expect(toPublicDto(subprofile).worksAt?.[0]?.slug).toBe("tinta-viva");
      }
    }
  });

  it("gives every member row a demo member and no persona", () => {
    const memberRows = DEMO_TEAM_ROWS.filter((row) => row.userId !== null);
    expect(memberRows.length).toBeGreaterThan(0);
    for (const row of memberRows) {
      expect(row.subprofileId, row.id).toBeNull();
      expect(
        DEMO_TEAM_MEMBERS.some((member) => member.userId === row.userId),
        row.id,
      ).toBe(true);
    }
    for (const row of DEMO_TEAM_ROWS.filter(
      (candidate) => candidate.userId === null,
    )) {
      expect(row.subprofileId, row.id).not.toBeNull();
    }
  });

  it("puts the accepted member between personas on the Tinta Viva page", () => {
    const team = demoPublicListingTeam("tinta-viva");
    expect(team.map((entry) => entry.kind ?? "persona").slice(0, 4)).toEqual([
      "persona",
      "persona",
      "member",
      "persona",
    ]);
    const memberEntry = team.find((entry) => entry.kind === "member");
    expect(memberEntry?.member?.slug).toBe("catarina-vaz");
    expect(memberEntry?.roleLabel).toBe("Front of house");
  });
});
