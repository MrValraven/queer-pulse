import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SkinData, SubprofileKind } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";

/**
 * Deep paths and the tattoo books status seed in the Page blocks editor. A
 * minimal persona view stands in for the loaded persona; its section rows
 * are empty, since these paths all point into `skinData`.
 */
function personaView(
  kind: SubprofileKind,
  overrides: Partial<SubprofileView> = {},
): SubprofileView {
  return {
    id: "persona-1",
    kind,
    slug: "inkwell-mariana",
    handle: "inkwell-mariana",
    displayName: "Mariana",
    avatarUrl: null,
    tagline: "",
    bio: "",
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "linked",
    visibility: "open",
    status: "draft",
    position: 0,
    sections: [],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    followerCount: 0,
    skinData: null,
    memberCount: 1,
    editVersion: 0,
    ...overrides,
  };
}

function renderEditor(subprofile: SubprofileView) {
  return renderHook(() => useSubprofileSkinBlocksEditor(subprofile, {}));
}

describe("useSubprofileSkinBlocksEditor deep paths", () => {
  it("reads and writes a two-level path and keeps its siblings", () => {
    const { result } = renderEditor(personaView("tattoo_artist"));
    act(() => result.current.setValue("tattooPrices.deposit.amount", "50"));
    act(() =>
      result.current.setValue("tattooPrices.deposit.isRefundable", true),
    );
    act(() => result.current.setValue("tattooPrices.minimum", "80"));

    expect(result.current.getValue("tattooPrices")).toEqual({
      deposit: { amount: "50", isRefundable: true },
      minimum: "80",
    });
    expect(result.current.getValue("tattooPrices.deposit.amount")).toBe("50");
  });

  it("drops a toggle switched off", () => {
    const { result } = renderEditor(personaView("tattoo_artist"));
    act(() => result.current.setValue("tattooStudio.isPrivateStudio", true));
    act(() =>
      result.current.setValue("tattooStudio.isPrivateStudio", undefined),
    );

    expect(result.current.getValue("tattooStudio")).toBeUndefined();
    expect(result.current.buildSkinBlocks().tattooStudio).toBeUndefined();
  });

  it("sends null for a nested block the owner emptied", () => {
    const skinData = {
      tattooPrices: { deposit: { amount: "50" } },
    } as unknown as SkinData;
    const { result } = renderEditor(personaView("tattoo_artist", { skinData }));
    act(() => result.current.setValue("tattooPrices.deposit.amount", ""));

    expect(result.current.buildSkinBlocks().tattooPrices).toBeNull();
  });
});

describe("useSubprofileSkinBlocksEditor books status seed", () => {
  it("seeds the books status from availability for an older tattoo persona", () => {
    const { result } = renderEditor(
      personaView("tattoo_artist", {
        availability: "booking",
        skinData: {},
      }),
    );

    expect(result.current.getValue("tattoo.status")).toBe("waitlist");
    expect(result.current.dirty).toBe(false);
  });

  it("keeps a stored status as it is", () => {
    const skinData = {
      tattoo: { status: "closed", waitNote: "" },
    } as unknown as SkinData;
    const { result } = renderEditor(
      personaView("tattoo_artist", {
        availability: "open_to_collabs",
        skinData,
      }),
    );

    expect(result.current.getValue("tattoo.status")).toBe("closed");
  });

  it("leaves a therapist draft as before", () => {
    const skinData = {
      therapist: { status: "wait" },
    } as unknown as SkinData;
    const { result } = renderEditor(personaView("therapist", { skinData }));

    expect(result.current.getValue("therapist.status")).toBe("wait");
    act(() => result.current.setValue("therapist.waitNote", "Two weeks"));
    expect(result.current.buildSkinBlocks().therapist).toEqual({
      status: "wait",
      waitNote: "Two weeks",
    });
  });
});
