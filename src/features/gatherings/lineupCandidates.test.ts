import { describe, expect, it } from "vitest";
import { buildLineupCandidates } from "./lineupCandidates";

const connection = (slug: string, name: string) => ({
  slug,
  name,
  avatarUrl: undefined,
  pronouns: undefined,
});

describe("buildLineupCandidates", () => {
  it("lists a connection who is also going once", () => {
    const people = buildLineupCandidates(
      [connection("ana", "Ana Lima")],
      [{ slug: "ana", name: "Ana Lima", pronouns: "she/her" }],
      "",
    );
    expect(people.map((person) => person.slug)).toEqual(["ana"]);
  });

  it("adds going members who are not connections after the connections", () => {
    const people = buildLineupCandidates(
      [connection("ana", "Ana Lima")],
      [{ slug: "rui", name: "Rui Sousa" }],
      "",
    );
    expect(people.map((person) => person.slug)).toEqual(["ana", "rui"]);
  });

  it("filters going members by the search query, accent-insensitively", () => {
    const people = buildLineupCandidates(
      [],
      [
        { slug: "ines", name: "Inês Costa" },
        { slug: "rui", name: "Rui Sousa" },
      ],
      "ines",
    );
    expect(people.map((person) => person.slug)).toEqual(["ines"]);
  });

  it("matches going members by slug as well as name", () => {
    const people = buildLineupCandidates(
      [],
      [{ slug: "dj-ana", name: "Ana" }],
      "@dj-ana",
    );
    expect(people.map((person) => person.slug)).toEqual(["dj-ana"]);
  });
});
