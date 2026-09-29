import { describe, expect, it } from "vitest";
import {
  DEMO_MODERATOR_CANDIDATES,
  MODERATOR_CANDIDATE_LIMIT,
  searchDemoModeratorCandidates,
} from "./adminModeratorCandidates.data";

describe("searchDemoModeratorCandidates", () => {
  it("caps an unsearched roster at the server's limit", () => {
    expect(DEMO_MODERATOR_CANDIDATES.length).toBeGreaterThan(
      MODERATOR_CANDIDATE_LIMIT,
    );
    expect(searchDemoModeratorCandidates([], "")).toHaveLength(
      MODERATOR_CANDIDATE_LIMIT,
    );
  });

  it("folds accents on both sides, so Joao finds João", () => {
    const matches = searchDemoModeratorCandidates([], "joao");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((match) => match.name.startsWith("João"))).toBe(true);
  });

  it("matches the handle as well as the name", () => {
    const matches = searchDemoModeratorCandidates([], "ines-simoes");
    expect(matches.map((match) => match.name)).toEqual(["Inês Simões"]);
  });

  it("leaves out anyone who already moderates", () => {
    const matches = searchDemoModeratorCandidates(["Inês Simões"], "simoes");
    expect(matches.map((match) => match.name)).not.toContain("Inês Simões");
  });

  it("trims the search and answers nothing for a stranger's name", () => {
    expect(searchDemoModeratorCandidates([], "  zzz  ")).toEqual([]);
  });
});
