import { describe, expect, it } from "vitest";
import { workLinkTarget } from "./workLink.data";

describe("workLinkTarget", () => {
  it("builds an internal path for each ref entity", () => {
    expect(
      workLinkTarget({ kind: "ref", entity: "collection", slug: "iberian" }),
    ).toEqual({ kind: "internal", to: "/cinema/collections/iberian" });
    expect(
      workLinkTarget({ kind: "ref", entity: "filmmaker", slug: "maria" }),
    ).toEqual({ kind: "internal", to: "/cinema/filmmakers/maria" });
    expect(
      workLinkTarget({ kind: "ref", entity: "curator", slug: "joao" }),
    ).toEqual({ kind: "internal", to: "/cinema/curators/joao" });
    expect(
      workLinkTarget({ kind: "ref", entity: "gathering", slug: "supper" }),
    ).toEqual({ kind: "internal", to: "/gatherings/supper" });
    expect(
      workLinkTarget({ kind: "ref", entity: "place", slug: "janela" }),
    ).toEqual({ kind: "internal", to: "/local/directory/janela" });
  });

  it("passes an external URL through", () => {
    expect(
      workLinkTarget({ kind: "external", href: "https://bandcamp.com/x" }),
    ).toEqual({ kind: "external", href: "https://bandcamp.com/x" });
  });

  it("rejects a non-http external URL rather than rendering it", () => {
    expect(
      workLinkTarget({ kind: "external", href: "javascript:alert(1)" }),
    ).toBeNull();
  });

  it("returns null for an empty slug", () => {
    expect(
      workLinkTarget({ kind: "ref", entity: "place", slug: "  " }),
    ).toBeNull();
  });
});
