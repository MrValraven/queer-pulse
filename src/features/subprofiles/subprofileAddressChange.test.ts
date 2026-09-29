import { describe, expect, it } from "vitest";
import { pathFor, warningPathsForPending } from "./subprofileAddressChange";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

describe("pathFor", () => {
  it("previews a linked persona's typed handle", () => {
    expect(pathFor("linked", "tiago-costa", "therapist", "tc-therapy")).toBe(
      "/p/tc-therapy",
    );
  });
  it("previews the derived default for a linked persona with an empty handle", () => {
    expect(pathFor("linked", "tiago-costa", "therapist", "")).toBe(
      "/p/tiago-costa-therapist",
    );
  });
  it("shows a placeholder for an unlinked persona with an empty handle", () => {
    expect(pathFor("unlinked", "tiago-costa", "therapist", "")).toBe("/p/…");
  });
});

describe("warningPathsForPending", () => {
  const current = {
    link: "linked" as const,
    ownerSlug: "tiago-costa",
    slug: "therapist",
    handle: "tiago-costa-therapist",
  };
  it("switching to unlinked releases the handle and waits for a new one", () => {
    expect(
      warningPathsForPending(
        { kind: "switchMode", target: "unlinked" },
        current,
      ),
    ).toEqual({
      oldPath: "/p/tiago-costa-therapist",
      newPath: null,
      releasesHandle: true,
    });
  });
  it("switching to linked previews the derived default", () => {
    expect(
      warningPathsForPending(
        { kind: "switchMode", target: "linked" },
        { ...current, link: "unlinked", handle: "nightform" },
      ).newPath,
    ).toBe("/p/tiago-costa-therapist");
  });
  it("editing the handle releases the old one", () => {
    expect(
      warningPathsForPending(
        {
          kind: "editField",
          field: "handle",
          value: "tc-therapy",
          previous: "tiago-costa-therapist",
        },
        current,
      ),
    ).toEqual({
      oldPath: "/p/tiago-costa-therapist",
      newPath: "/p/tc-therapy",
      releasesHandle: true,
    });
  });
  it("clearing an unlinked handle waits for a new one", () => {
    expect(
      warningPathsForPending(
        {
          kind: "editField",
          field: "handle",
          value: "",
          previous: "nightform",
        },
        { ...current, link: "unlinked", handle: "" },
      ),
    ).toEqual({
      oldPath: "/p/nightform",
      newPath: null,
      releasesHandle: true,
    });
  });
});
