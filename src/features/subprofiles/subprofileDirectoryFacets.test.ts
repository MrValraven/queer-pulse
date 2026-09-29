import { describe, expect, it } from "vitest";
import type { SubprofileCardDTO } from "./api/subprofiles.api";
import {
  countByTableFormat,
  countByTableVibe,
  matchesTable,
} from "./subprofileDirectoryFacets";

const cardWithTable = (table?: SubprofileCardDTO["table"]) =>
  ({ kind: "game_master", tags: [], table }) as unknown as SubprofileCardDTO;

describe("matchesTable", () => {
  it("passes every card when nothing is picked", () => {
    expect(matchesTable(cardWithTable(undefined), [], [])).toBe(true);
  });

  it("matches a both-table under either format chip", () => {
    const bothTable = cardWithTable({ format: "both", vibe: [] });
    expect(matchesTable(bothTable, ["online"], [])).toBe(true);
    expect(matchesTable(bothTable, ["in_person"], [])).toBe(true);
  });

  it("ORs formats and ANDs vibes", () => {
    const onlineTable = cardWithTable({
      format: "online",
      vibe: ["queer_led"],
    });
    expect(matchesTable(onlineTable, ["online", "in_person"], [])).toBe(true);
    expect(matchesTable(onlineTable, [], ["queer_led"])).toBe(true);
    expect(matchesTable(onlineTable, [], ["queer_led", "adults_only"])).toBe(
      false,
    );
  });

  it("excludes cards without table data once any table chip is on", () => {
    expect(matchesTable(cardWithTable(undefined), ["online"], [])).toBe(false);
    expect(matchesTable(cardWithTable(undefined), [], ["queer_led"])).toBe(
      false,
    );
  });
});

describe("table counts", () => {
  it("counts a both-table under both format chips", () => {
    const counts = countByTableFormat([
      cardWithTable({ format: "both", vibe: [] }),
      cardWithTable({ format: "online", vibe: [] }),
      cardWithTable(undefined),
    ]);
    expect(counts).toEqual({ online: 2, in_person: 1, both: 0 });
  });

  it("counts each vibe once per card", () => {
    const counts = countByTableVibe([
      cardWithTable({ format: null, vibe: ["queer_led"] }),
    ]);
    expect(counts.queer_led).toBe(1);
  });
});
