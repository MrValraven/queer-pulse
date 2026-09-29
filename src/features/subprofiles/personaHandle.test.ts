import { describe, expect, it } from "vitest";
import {
  handleNamesOwner,
  linkedPersonaHandleCandidate,
} from "./personaHandle";

describe("linkedPersonaHandleCandidate", () => {
  it("joins creator and persona slugs", () => {
    expect(linkedPersonaHandleCandidate("tiago-costa", "therapist")).toBe(
      "tiago-costa-therapist",
    );
  });

  it("adds a numeric suffix from 2 upward", () => {
    expect(linkedPersonaHandleCandidate("tiago-costa", "therapist", 2)).toBe(
      "tiago-costa-therapist-2",
    );
  });

  it("cuts the persona part to fit 30 chars and drops a dangling hyphen", () => {
    const candidate = linkedPersonaHandleCandidate(
      "tiago-costa",
      "community-organiser-and-facilitator",
    );
    expect(candidate.length).toBeLessThanOrEqual(30);
    expect(candidate.startsWith("tiago-costa-")).toBe(true);
    expect(candidate).not.toMatch(/-$/);
    expect(candidate).not.toMatch(/--/);
  });

  it("keeps at least 3 persona chars when the creator slug is long", () => {
    const creatorSlug = "a-very-long-creator-slug-xyz"; // 28 chars
    const candidate = linkedPersonaHandleCandidate(
      creatorSlug,
      "therapist",
      12,
    );
    expect(candidate).toBe("a-very-long-creator-slu-the-12");
    expect(candidate.length).toBeLessThanOrEqual(30);
    expect(candidate).toMatch(/-the-12$/);
    expect(candidate).toMatch(/^[a-z0-9][a-z0-9-]{2,29}$/);
    expect(candidate).not.toMatch(/--/);
  });

  it("lowercases a mixed-case creator slug", () => {
    expect(linkedPersonaHandleCandidate("John", "poet")).toBe("john-poet");
  });
});

describe("handleNamesOwner", () => {
  it("matches the creator slug as a hyphen-delimited run", () => {
    expect(handleNamesOwner("tiago-costa-therapist", "tiago-costa")).toBe(true);
    expect(handleNamesOwner("the-tiago-costa", "tiago-costa")).toBe(true);
  });

  it("matches the creator slug with its hyphens squashed", () => {
    expect(handleNamesOwner("tiagocosta-art", "tiago-costa")).toBe(true);
  });

  it("ignores a partial overlap", () => {
    expect(handleNamesOwner("tiago-art", "tiago-costa")).toBe(false);
    expect(handleNamesOwner("nightform", "tiago-costa")).toBe(false);
  });
});
