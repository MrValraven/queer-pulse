import { describe, expect, it } from "vitest";
import { routes } from "../../app/routeMap";
import { mediaReferenceHref, mediaReferenceLabelKey } from "./mediaReferences";

describe("VJ media references", () => {
  it("links a VJ clip and its preview to the library", () => {
    expect(
      mediaReferenceHref({
        type: "vj-clip",
        entityId: "x",
        label: "",
        slug: "",
      }),
    ).toBe(routes.adminVj);
    expect(
      mediaReferenceHref({
        type: "vj-thumbnail",
        entityId: "x",
        label: "",
        slug: "",
      }),
    ).toBe(routes.adminVj);
  });

  it("names both VJ kinds in the shared catalog", () => {
    expect(mediaReferenceLabelKey("vj-clip")).toBe("shared:mediaRef.vj-clip");
    expect(mediaReferenceLabelKey("vj-thumbnail")).toBe(
      "shared:mediaRef.vj-thumbnail",
    );
  });

  it("links a VJ preview reference to the VJ library", () => {
    expect(
      mediaReferenceHref({
        type: "vj-preview",
        entityId: "x",
        label: "",
        slug: "",
      }),
    ).toBe(routes.adminVj);
    expect(mediaReferenceLabelKey("vj-preview")).toBe(
      "shared:mediaRef.vj-preview",
    );
  });
});
