import { describe, expect, it } from "vitest";
import type { Piece } from "../data/desk.data";
import { flattenDeskGroups, groupDeskPieces } from "./pipelineGroups";

const ME = "marta";

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: ME,
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

function idsByGroup(pieces: Piece[]): Record<string, string[]> {
  return Object.fromEntries(
    groupDeskPieces(pieces, ME, "waiting").map((group) => [
      group.id,
      group.pieces.map((piece) => piece.id),
    ]),
  );
}

describe("groupDeskPieces by waiting", () => {
  it("puts each piece in the first group it matches, in priority order", () => {
    const pieces = [
      makePiece({ id: "mine-and-late", wait: "you", late: true }),
      makePiece({ id: "late-writer", wait: "writer", late: true }),
      makePiece({ id: "writer", wait: "writer" }),
      makePiece({ id: "layout", stage: "Layout" }),
      makePiece({ id: "sens", stage: "Sensitivity read" }),
      makePiece({ id: "ready", stage: "Ready" }),
      makePiece({ id: "published", stage: "Published" }),
      makePiece({ id: "idle", stage: "In review" }),
    ];

    const groups = groupDeskPieces(pieces, ME, "waiting");

    expect(groups.map((group) => group.id)).toEqual([
      "your-turn",
      "late",
      "with-writers",
      "in-production",
      "other",
      "ready",
      "published",
    ]);
    expect(idsByGroup(pieces)).toEqual({
      "your-turn": ["mine-and-late"],
      late: ["late-writer"],
      "with-writers": ["writer"],
      "in-production": ["layout", "sens"],
      ready: ["ready"],
      published: ["published"],
      other: ["idle"],
    });
    const groupedCount = groups.reduce(
      (total, group) => total + group.pieces.length,
      0,
    );
    expect(groupedCount).toBe(pieces.length);
  });

  it("draws In progress above Ready and keeps Published last", () => {
    const groups = groupDeskPieces(
      [
        makePiece({ id: "ready", stage: "Ready" }),
        makePiece({ id: "published", stage: "Published" }),
        makePiece({ id: "idle", stage: "In review" }),
      ],
      ME,
      "waiting",
    );

    expect(groups.map((group) => group.id)).toEqual([
      "other",
      "ready",
      "published",
    ]);
  });

  it("notes the chip's pieces an earlier group took", () => {
    const groups = groupDeskPieces(
      [
        makePiece({ id: "late-writer", wait: "writer", late: true }),
        makePiece({ id: "late-writer-2", wait: "writer", late: true }),
        makePiece({ id: "writer", wait: "writer" }),
        makePiece({ id: "mine-and-late", wait: "you", late: true }),
      ],
      ME,
      "waiting",
    );
    const groupById = new Map(groups.map((group) => [group.id, group]));

    expect(groupById.get("with-writers")?.heldElsewhere).toEqual([
      { labelKey: "magazine:desk.groups.late", count: 2 },
    ]);
    expect(groupById.get("late")?.heldElsewhere).toEqual([
      { labelKey: "magazine:desk.groups.yourTurn", count: 1 },
    ]);
    expect(groupById.get("your-turn")?.heldElsewhere).toBeUndefined();
  });

  it("leaves someone else's turn out of your-turn", () => {
    const groups = idsByGroup([
      makePiece({ id: "sara-turn", wait: "you", editorId: "sara" }),
    ]);
    expect(groups).toEqual({ other: ["sara-turn"] });
  });

  it("files my piece out with the sensitivity reader under production", () => {
    const groups = idsByGroup([
      makePiece({ id: "my-read", stage: "Sensitivity read", wait: "you" }),
    ]);
    expect(groups).toEqual({ "in-production": ["my-read"] });
  });

  it("omits empty groups and labels the rest with group keys", () => {
    const groups = groupDeskPieces(
      [makePiece({ stage: "Ready" })],
      ME,
      "waiting",
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]!.labelKey).toBe("magazine:desk.groups.ready");
  });

  it("folds Ready past five pieces and always folds Published", () => {
    const fiveReady = Array.from({ length: 5 }, (_, position) =>
      makePiece({ id: `ready-${position}`, stage: "Ready" }),
    );
    const sixReady = [
      ...fiveReady,
      makePiece({ id: "ready-6", stage: "Ready" }),
    ];
    const published = makePiece({ id: "shipped", stage: "Published" });

    const readyGroupOfFive = groupDeskPieces(fiveReady, ME, "waiting")[0]!;
    const groupsOfSix = groupDeskPieces(
      [...sixReady, published],
      ME,
      "waiting",
    );

    expect(readyGroupOfFive.isCollapsedByDefault).toBe(false);
    expect(groupsOfSix[0]!.isCollapsedByDefault).toBe(true);
    expect(groupsOfSix[1]!.id).toBe("published");
    expect(groupsOfSix[1]!.isCollapsedByDefault).toBe(true);
  });
});

describe("groupDeskPieces by stage, section and none", () => {
  const pieces = [
    makePiece({ id: "b", stage: "Layout", section: "Reported" }),
    makePiece({ id: "a", stage: "Commissioned", section: "Cover" }),
    makePiece({ id: "c", stage: "Layout", section: "Cover" }),
  ];

  it("stage follows pipeline order with stage label keys", () => {
    const groups = groupDeskPieces(pieces, ME, "stage");
    expect(groups.map((group) => group.id)).toEqual(["Commissioned", "Layout"]);
    expect(groups[0]!.labelKey).toBe("magazine:desk.stage.commissioned");
    expect(groups[1]!.pieces.map((piece) => piece.id)).toEqual(["b", "c"]);
  });

  it("section sorts alphabetically and uses the name as the label", () => {
    const groups = groupDeskPieces(pieces, ME, "section");
    expect(groups.map((group) => group.label)).toEqual(["Cover", "Reported"]);
    expect(groups.every((group) => group.labelKey === null)).toBe(true);
    expect(groups[0]!.pieces.map((piece) => piece.id)).toEqual(["a", "c"]);
  });

  it("gathers pieces with no section into a named group, sorted last", () => {
    const groups = groupDeskPieces(
      [...pieces, makePiece({ id: "loose", section: "  " })],
      ME,
      "section",
    );
    const lastGroup = groups.at(-1);
    expect(lastGroup?.labelKey).toBe("magazine:desk.groups.noSection");
    expect(lastGroup?.label).toBeUndefined();
    expect(lastGroup?.pieces.map((piece) => piece.id)).toEqual(["loose"]);
  });

  it("none returns one unlabelled group holding every piece in order", () => {
    const groups = groupDeskPieces(pieces, ME, "none");
    expect(groups).toHaveLength(1);
    expect(groups[0]!.labelKey).toBeNull();
    expect(groups[0]!.pieces).toEqual(pieces);
  });
});

describe("flattenDeskGroups", () => {
  const pieces = [
    makePiece({ id: "writer-first", wait: "writer" }),
    makePiece({ id: "mine", wait: "you" }),
    makePiece({ id: "writer-second", wait: "writer" }),
    makePiece({ id: "shipped", stage: "Published" }),
  ];

  it("lists pieces in the order the groups draw them", () => {
    const groups = groupDeskPieces(pieces, ME, "waiting");

    expect(
      flattenDeskGroups(groups, new Set()).map((piece) => piece.id),
    ).toEqual(["mine", "writer-first", "writer-second", "shipped"]);
  });

  it("leaves out every piece in a folded group", () => {
    const groups = groupDeskPieces(pieces, ME, "waiting");

    expect(
      flattenDeskGroups(groups, new Set(["with-writers", "published"])).map(
        (piece) => piece.id,
      ),
    ).toEqual(["mine"]);
  });

  it("keeps the flat list whole when nothing groups it", () => {
    const groups = groupDeskPieces(pieces, ME, "none");

    expect(flattenDeskGroups(groups, new Set())).toEqual(pieces);
  });
});
