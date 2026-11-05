import { beforeEach, describe, expect, it } from "vitest";
import { pickDirectoryCardImage } from "./api/directoryCard.adapters";
import { DEMO_PERSONA_WALL_NINE_SHOWN } from "./data/personaWallDemoSeed.data";
import { DEMO_SUBPROFILES } from "./data/subprofiles.data";
import {
  demoAddPersonaWallPick,
  demoAdminPersonaWall,
  demoPersonaPublicState,
  demoPublicPersonaWall,
  demoRemovePersonaWallPick,
  demoReorderPersonaWallPicks,
  demoSearchPersonaWall,
  demoSetPersonaWallFillOrder,
  resetDemoPersonaWall,
} from "./personaWallDemoStore";
import type { PersonaWallPreviewCardDTO } from "./api/personaWall.api";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

const TODAY = new Date(2026, 10, 5);

const personaById = (id: string) =>
  DEMO_SUBPROFILES.find((persona) => persona.id === id)!;
const endorsementsOf = (id: string) => personaById(id).endorsementCount;
const followersOf = (id: string) => personaById(id).followerCount;

/** True when each value is no larger than the one before it. */
const isNonIncreasing = (values: number[]) =>
  values.every((value, index) => index === 0 || value <= values[index - 1]!);

/** The filled preview cards split into the photo group and the tint group. */
function filledGroups(): { photo: string[]; tint: string[] } {
  const filled = demoAdminPersonaWall(TODAY).preview.filter(
    (card: PersonaWallPreviewCardDTO) => card.wallSource === "filled",
  );
  return {
    photo: filled
      .filter((card) => pickDirectoryCardImage(card) !== null)
      .map((card) => card.id!),
    tint: filled
      .filter((card) => pickDirectoryCardImage(card) === null)
      .map((card) => card.id!),
  };
}

beforeEach(() => resetDemoPersonaWall());

describe("demo persona wall reads", () => {
  it("lists the seeded picks in order with positions from 1 and their states", () => {
    const wall = demoAdminPersonaWall(TODAY);
    expect(wall.picks.map((pick) => pick.persona.id)).toEqual([
      "sp-diogo-nightform",
      "sp-vera-bloco",
      "sp-bea-cadeira",
      "sp-tiago-draft",
    ]);
    expect(wall.picks.map((pick) => pick.position)).toEqual([1, 2, 3, 4]);
    expect(wall.picks.map((pick) => pick.publicState)).toEqual([
      "shown",
      "shown",
      "shown",
      "draft",
    ]);
    expect(wall.fillOrder).toBe("endorsed");
  });

  it("puts the shown picks first and fills the wall to nine", () => {
    const cards = demoPublicPersonaWall(TODAY);
    expect(cards).toHaveLength(9);
    expect(cards.slice(0, 3).map((card) => card.id)).toEqual([
      "sp-diogo-nightform",
      "sp-vera-bloco",
      "sp-bea-cadeira",
    ]);
    expect(new Set(cards.map((card) => card.id)).size).toBe(9);
  });

  it("skips a pick that is no longer listed and tops the wall up", () => {
    const ids = demoPublicPersonaWall(TODAY).map((card) => card.id);
    expect(ids).not.toContain("sp-tiago-draft");
    expect(ids).toHaveLength(9);
  });

  it("fills with photo personas before tinted ones", () => {
    const filled = demoAdminPersonaWall(TODAY).preview.filter(
      (card) => card.wallSource === "filled",
    );
    const hasPhoto = filled.map(
      (card) => pickDirectoryCardImage(card) !== null,
    );
    const firstTint = hasPhoto.indexOf(false);
    expect(firstTint === -1 || !hasPhoto.slice(firstTint).includes(true)).toBe(
      true,
    );
  });

  it("orders the endorsed fill by active endorsements within each photo group", () => {
    const { photo, tint } = filledGroups();
    expect(isNonIncreasing(photo.map(endorsementsOf))).toBe(true);
    expect(isNonIncreasing(tint.map(endorsementsOf))).toBe(true);
  });

  it("orders the followed fill by follower count", () => {
    demoSetPersonaWallFillOrder("followed");
    const { photo, tint } = filledGroups();
    expect(isNonIncreasing(photo.map(followersOf))).toBe(true);
    expect(isNonIncreasing(tint.map(followersOf))).toBe(true);
  });

  it("keeps the daily shuffle stable for a day and changes it the next day", () => {
    demoSetPersonaWallFillOrder("daily_shuffle");
    const todayIds = demoPublicPersonaWall(TODAY).map((card) => card.id);
    expect(demoPublicPersonaWall(TODAY).map((card) => card.id)).toEqual(
      todayIds,
    );
    expect(
      demoPublicPersonaWall(new Date(2026, 10, 6)).map((card) => card.id),
    ).not.toEqual(todayIds);
  });

  it("marks preview cards as picked or filled", () => {
    const sources = demoAdminPersonaWall(TODAY).preview.map(
      (card) => card.wallSource,
    );
    expect(sources.slice(0, 3)).toEqual(["picked", "picked", "picked"]);
    expect(sources.slice(3)).toEqual(Array(6).fill("filled"));
  });

  it("reads each state with the contract's precedence", () => {
    expect(
      demoPersonaPublicState(personaById("sp-tomas-casa-corvo-antiga")),
    ).toBe("removed");
    expect(demoPersonaPublicState(personaById("sp-anika-journal"))).toBe(
      "not_open",
    );
    expect(demoPersonaPublicState(personaById("sp-jordan-afterhours"))).toBe(
      "not_open",
    );
    expect(demoPersonaPublicState(personaById("sp-tiago-draft"))).toBe("draft");
    expect(demoPersonaPublicState(personaById("sp-vera-bloco"))).toBe("shown");
  });
});

describe("demo persona wall writes", () => {
  it("appends an added pick at the end", () => {
    const wall = demoAddPersonaWallPick("sp-ines-fonseca-vanda-diesel");
    const lastPick = wall.picks.at(-1);
    expect(lastPick).toBeDefined();
    expect(lastPick!.persona.id).toBe("sp-ines-fonseca-vanda-diesel");
    expect(lastPick!.position).toBe(5);
  });

  it.each([
    ["no-such-persona", "PERSONA_WALL_PERSONA_NOT_FOUND", 404],
    ["sp-vera-bloco", "PERSONA_WALL_ALREADY_PICKED", 409],
    ["sp-anika-journal", "PERSONA_WALL_NOT_LISTED", 409],
    ["sp-tomas-casa-corvo-antiga", "PERSONA_WALL_NOT_LISTED", 409],
  ])("refuses %s with %s", (personaId, code, status) => {
    expect(() => demoAddPersonaWallPick(personaId)).toThrow(
      expect.objectContaining({
        status,
        data: expect.objectContaining({ code, statusCode: status }),
      }),
    );
  });

  it("names the hidden state on a not-listed refusal", () => {
    expect(() => demoAddPersonaWallPick("sp-tiago-draft")).toThrow(
      expect.objectContaining({
        data: expect.objectContaining({
          code: "PERSONA_WALL_NOT_LISTED",
          publicState: "draft",
        }),
      }),
    );
    expect(() => demoAddPersonaWallPick("sp-anika-journal")).toThrow(
      expect.objectContaining({
        data: expect.objectContaining({ publicState: "not_open" }),
      }),
    );
    expect(() => demoAddPersonaWallPick("sp-tomas-casa-corvo-antiga")).toThrow(
      expect.objectContaining({
        data: expect.objectContaining({ publicState: "removed" }),
      }),
    );
  });

  it("refuses a tenth pick with PERSONA_WALL_FULL", () => {
    resetDemoPersonaWall({
      pickPersonaIds: DEMO_PERSONA_WALL_NINE_SHOWN,
      fillOrder: "endorsed",
    });
    expect(() =>
      demoAddPersonaWallPick("sp-ines-fonseca-vanda-diesel"),
    ).toThrow(
      expect.objectContaining({
        status: 409,
        data: expect.objectContaining({ code: "PERSONA_WALL_FULL" }),
      }),
    );
  });

  it("refuses an order that misses or repeats an id with PERSONA_WALL_REORDER_MISMATCH", () => {
    const pickIds = demoAdminPersonaWall(TODAY).picks.map((pick) => pick.id);
    const mismatch = expect.objectContaining({
      status: 409,
      data: expect.objectContaining({ code: "PERSONA_WALL_REORDER_MISMATCH" }),
    });
    expect(() => demoReorderPersonaWallPicks(pickIds.slice(1))).toThrow(
      mismatch,
    );
    expect(() =>
      demoReorderPersonaWallPicks([
        pickIds[0]!,
        pickIds[0]!,
        pickIds[2]!,
        pickIds[3]!,
      ]),
    ).toThrow(mismatch);
  });

  it("reorders the picks", () => {
    const before = demoAdminPersonaWall(TODAY).picks;
    const wall = demoReorderPersonaWallPicks(
      [...before].reverse().map((pick) => pick.id),
    );
    expect(wall.picks.map((pick) => pick.persona.id)).toEqual(
      [...before].reverse().map((pick) => pick.persona.id),
    );
    expect(wall.picks.map((pick) => pick.position)).toEqual([1, 2, 3, 4]);
  });

  it("closes the gap after a removal", () => {
    const secondPickId = demoAdminPersonaWall(TODAY).picks[1]!.id;
    const wall = demoRemovePersonaWallPick(secondPickId);
    expect(wall.picks.map((pick) => pick.position)).toEqual([1, 2, 3]);
    expect(wall.picks.map((pick) => pick.id)).not.toContain(secondPickId);
  });

  it("refuses an unknown pick id with PERSONA_WALL_PICK_NOT_FOUND", () => {
    expect(() => demoRemovePersonaWallPick("no-such-pick")).toThrow(
      expect.objectContaining({
        status: 404,
        data: expect.objectContaining({ code: "PERSONA_WALL_PICK_NOT_FOUND" }),
      }),
    );
  });

  it("refuses an unknown fill order with PERSONA_WALL_INVALID_FILL_ORDER", () => {
    expect(() => demoSetPersonaWallFillOrder("loudest")).toThrow(
      expect.objectContaining({
        status: 400,
        data: expect.objectContaining({
          code: "PERSONA_WALL_INVALID_FILL_ORDER",
        }),
      }),
    );
  });
});

describe("demo persona wall search", () => {
  it("searches listed personas and flags the picked ones", () => {
    expect(
      demoSearchPersonaWall("vanda").map(
        (result) => result.persona.displayName,
      ),
    ).toEqual(["Vanda Diesel"]);
    expect(demoSearchPersonaWall("bloco")[0]).toMatchObject({ isPicked: true });
    expect(demoSearchPersonaWall("   ")).toEqual([]);
    // A private persona is never listed.
    expect(demoSearchPersonaWall("journal")).toEqual([]);
  });

  it("projects a persona with no owner fields", () => {
    const [result] = demoSearchPersonaWall("vanda");
    expect(result).toBeDefined();
    expect(Object.keys(result!.persona).sort()).toEqual(
      [
        "accent",
        "displayName",
        "handle",
        "id",
        "imageCrop",
        "imageSource",
        "imageUrl",
        "kind",
      ].sort(),
    );
  });
});
