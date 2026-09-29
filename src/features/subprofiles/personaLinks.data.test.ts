import { describe, expect, it } from "vitest";
import {
  personaCardPath,
  personaHrefWithOwnerFallback,
  personaOwnerAddress,
  personaPublicPathForOwnerOrNull,
  personaPublicPathOrNull,
  personaShareUrl,
} from "./personaLinks.data";

describe("personaPublicPathOrNull", () => {
  it("uses the handle for a linked persona that has one", () => {
    expect(
      personaPublicPathOrNull({
        handle: "tiago-costa-therapist",
        ownerSlug: "tiago-costa",
        slug: "therapist",
      } as never),
    ).toBe("/p/tiago-costa-therapist");
  });
  it("falls back to the nested path for a linked persona with no handle", () => {
    expect(
      personaPublicPathOrNull({
        handle: null,
        linkVisibility: "linked",
        ownerSlug: "tiago-costa",
        slug: "therapist",
      } as never),
    ).toBe("/members/tiago-costa/therapist");
  });
  it("returns null for an unlinked persona with no handle", () => {
    expect(
      personaPublicPathOrNull({ handle: null, slug: "nightform" } as never),
    ).toBeNull();
  });
  it("returns null for a standalone persona with no handle when an owner slug is present (the editor preview)", () => {
    expect(
      personaPublicPathOrNull({
        handle: null,
        linkVisibility: "unlinked",
        ownerSlug: "tiago",
        slug: "code",
      } as never),
    ).toBeNull();
  });
});

describe("personaShareUrl", () => {
  it("hands out no link for a draft, stored handle or not", () => {
    expect(
      personaShareUrl({
        handle: "codeworks",
        linkVisibility: "unlinked",
        slug: "code",
        status: "draft",
      } as never),
    ).toBeNull();
  });
  it("builds the absolute handle URL for a published persona", () => {
    expect(
      personaShareUrl({
        handle: "codeworks",
        linkVisibility: "unlinked",
        slug: "code",
        status: "published",
      } as never),
    ).toMatch(/\/p\/codeworks$/);
  });
});

describe("personaCardPath", () => {
  it("prefers the handle for a linked card", () => {
    expect(
      personaCardPath({
        handle: "tiago-costa-therapist",
        linkVisibility: "linked",
        ownerSlug: "tiago-costa",
        slug: "therapist",
      } as never),
    ).toBe("/p/tiago-costa-therapist");
  });
  it("falls back to nested for a linked card with an empty handle", () => {
    expect(
      personaCardPath({
        handle: "",
        linkVisibility: "linked",
        ownerSlug: "tiago-costa",
        slug: "therapist",
      } as never),
    ).toBe("/members/tiago-costa/therapist");
  });
});

describe("owner dashboard addresses", () => {
  const linkedRow = {
    handle: "tiago-costa-therapist",
    slug: "therapist",
    linkVisibility: "linked" as const,
  };
  it("settles a linked row with a handle without waiting for the creator slug", () => {
    expect(personaOwnerAddress(linkedRow, undefined)).toMatchObject({
      status: "ready",
      path: "/p/tiago-costa-therapist",
    });
  });
  it("stays pending for a linked row with no handle until the creator slug resolves", () => {
    expect(
      personaOwnerAddress({ ...linkedRow, handle: null }, undefined),
    ).toEqual({ status: "pending" });
  });
  it("builds the nested fallback once the creator slug is known", () => {
    expect(
      personaPublicPathForOwnerOrNull(
        { ...linkedRow, handle: null },
        "tiago-costa",
      ),
    ).toBe("/members/tiago-costa/therapist");
  });
  it("answers none for an unlinked row with no handle", () => {
    expect(
      personaOwnerAddress(
        { handle: null, slug: "nightform", linkVisibility: "unlinked" },
        "tiago-costa",
      ),
    ).toEqual({ status: "none" });
  });
  it("answers draft for an unpublished row even with a stored handle (PRD-429)", () => {
    expect(
      personaOwnerAddress({ ...linkedRow, status: "draft" }, "tiago-costa"),
    ).toEqual({ status: "draft" });
  });
  it("answers draft for an unpublished unlinked row regardless of its handle", () => {
    expect(
      personaOwnerAddress(
        {
          handle: null,
          slug: "nightform",
          linkVisibility: "unlinked",
          status: "draft",
        },
        "tiago-costa",
      ),
    ).toEqual({ status: "draft" });
  });
  it("reads no status as published (a followed persona or a directory card)", () => {
    expect(personaOwnerAddress(linkedRow, undefined)).toMatchObject({
      status: "ready",
    });
  });
});

describe("personaHrefWithOwnerFallback", () => {
  it("uses the handle when present", () => {
    expect(
      personaHrefWithOwnerFallback(
        { handle: "tiago-costa-therapist", slug: "therapist", ownerSlug: null },
        "someone-else",
      ),
    ).toBe("/p/tiago-costa-therapist");
  });
  it("prefers the persona's own ownerSlug over the fallback", () => {
    expect(
      personaHrefWithOwnerFallback(
        { handle: null, slug: "therapist", ownerSlug: "tiago-costa" },
        "someone-else",
      ),
    ).toBe("/members/tiago-costa/therapist");
  });
});
