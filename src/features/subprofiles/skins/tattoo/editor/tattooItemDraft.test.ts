import { describe, expect, it } from "vitest";
import type {
  FlashDayEventRef,
  TattooCoverUpFields,
} from "../../../api/subprofiles.api";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import { emptyItem } from "../../../subprofileSectionEditorRows";
import {
  isTattooPrice,
  parsePlacements,
  shopDomain,
  tattooItemBlockReasonKey,
  withFlashDayEvent,
  withImagesChanged,
  withoutFlashDayEvent,
} from "./tattooItemDraft";

const STATUS = "subprofiles:tattooItem.status.";

const healedDraft = (
  overrides: Partial<SubprofileItemView> = {},
): SubprofileItemView => ({ ...emptyItem("healed"), ...overrides });

describe("tattooItemDraft save rules", () => {
  it("clears the consent tick when a new photo comes in and keeps it when a photo is removed", () => {
    const draft = healedDraft({
      imageUrl: "work-image/u1/old.jpg",
      structured: { photo: { hasClientConsent: true, isBlurred: false } },
    });

    const photoPatch = withImagesChanged(draft, {
      imageUrl: "work-image/u1/new.jpg",
    });
    expect(photoPatch.imageUrl).toBe("work-image/u1/new.jpg");
    expect(photoPatch.structured?.photo).toEqual({
      hasClientConsent: false,
      isBlurred: false,
    });

    expect(withImagesChanged(draft, { imageUrl: "" })).toEqual({
      imageUrl: "",
    });

    expect(withImagesChanged(draft, { title: "Healed rose" })).toEqual({
      title: "Healed rose",
    });
  });

  it("blocks a new photo until consent is ticked", () => {
    const draft = healedDraft({ imageUrl: "work-image/u1/healed.jpg" });
    const original = emptyItem("healed");
    expect(tattooItemBlockReasonKey(draft, original, true)).toBe(
      `${STATUS}needsConsent`,
    );

    const consented = {
      ...draft,
      structured: { photo: { hasClientConsent: true } },
    };
    expect(tattooItemBlockReasonKey(consented, original, true)).toBeNull();
  });

  it("saves a legacy healed row unchanged without a tick", () => {
    const original = healedDraft({
      id: "item-1",
      imageUrl: "work-image/u1/legacy.jpg",
    });
    const draft = { ...original };
    expect(tattooItemBlockReasonKey(draft, original, false)).toBeNull();
  });

  it("lets a stored cover-up with an empty before photo save", () => {
    const stored: SubprofileItemView = {
      ...emptyItem("cover_ups"),
      id: "item-2",
      imageUrl: "work-image/u1/after.jpg",
      structured: { coverUp: { type: "cover_up", beforeImageUrl: "" } },
    };
    expect(tattooItemBlockReasonKey({ ...stored }, stored, false)).toBeNull();

    const storedWithoutBeforeKey: SubprofileItemView = {
      ...stored,
      structured: { coverUp: { type: "cover_up" } as TattooCoverUpFields },
    };
    expect(
      tattooItemBlockReasonKey(
        storedWithoutBeforeKey,
        storedWithoutBeforeKey,
        false,
      ),
    ).toBe(`${STATUS}needsBeforePhoto`);

    const original = emptyItem("cover_ups");
    const newCoverUp: SubprofileItemView = {
      ...original,
      imageUrl: "work-image/u1/after.jpg",
    };
    expect(tattooItemBlockReasonKey(newCoverUp, original, true)).toBe(
      `${STATUS}needsType`,
    );

    const newRework: SubprofileItemView = {
      ...newCoverUp,
      structured: { coverUp: { type: "rework", beforeImageUrl: "" } },
    };
    expect(tattooItemBlockReasonKey(newRework, original, true)).toBe(
      `${STATUS}needsBeforePhoto`,
    );
  });

  it("needs a session photo, a date, a type and an https buy link", () => {
    const project = emptyItem("in_progress");
    expect(tattooItemBlockReasonKey(project, project, true)).toBe(
      `${STATUS}needsSession`,
    );

    const crowdedProject: SubprofileItemView = {
      ...project,
      structured: {
        sessions: Array.from({ length: 13 }, (_unused, sessionIndex) => ({
          imageUrl: `work-image/u1/session-${sessionIndex}.jpg`,
        })),
      },
    };
    expect(
      tattooItemBlockReasonKey(crowdedProject, crowdedProject, false),
    ).toBe(`${STATUS}tooManySessions`);

    const undatedSpot: SubprofileItemView = {
      ...emptyItem("guest_spots"),
      date: "",
    };
    expect(tattooItemBlockReasonKey(undatedSpot, undatedSpot, true)).toBe(
      `${STATUS}needsDate`,
    );

    const backwardsSpot: SubprofileItemView = {
      ...emptyItem("guest_spots"),
      date: "2026-11-03",
      structured: { spot: { type: "guest_spot", endDate: "2026-11-01" } },
    };
    expect(tattooItemBlockReasonKey(backwardsSpot, backwardsSpot, true)).toBe(
      `${STATUS}endBeforeStart`,
    );

    const impossibleEndSpot: SubprofileItemView = {
      ...backwardsSpot,
      structured: { spot: { type: "guest_spot", endDate: "2026-11-31" } },
    };
    expect(
      tattooItemBlockReasonKey(impossibleEndSpot, impossibleEndSpot, true),
    ).toBe(`${STATUS}endBeforeStart`);

    const untypedScarWork = emptyItem("scar_work");
    expect(
      tattooItemBlockReasonKey(untypedScarWork, untypedScarWork, true),
    ).toBe(`${STATUS}needsType`);

    const plainHttpShopItem: SubprofileItemView = {
      ...emptyItem("shop"),
      url: "http://shop.example.com",
      structured: { shop: { type: "print" } },
    };
    expect(
      tattooItemBlockReasonKey(plainHttpShopItem, plainHttpShopItem, true),
    ).toBe(`${STATUS}needsBuyLink`);

    const paddedShopItem: SubprofileItemView = {
      ...plainHttpShopItem,
      url: " https://x.shop",
    };
    expect(tattooItemBlockReasonKey(paddedShopItem, paddedShopItem, true)).toBe(
      `${STATUS}needsBuyLink`,
    );
  });

  it("refuses a price off the pattern", () => {
    const flashWithPrice = (price: string): SubprofileItemView => ({
      ...emptyItem("flash"),
      structured: { flash: { price } },
    });

    const offPattern = flashWithPrice("12.345");
    expect(tattooItemBlockReasonKey(offPattern, offPattern, true)).toBe(
      `${STATUS}priceInvalid`,
    );

    const withoutPrice = flashWithPrice("");
    expect(tattooItemBlockReasonKey(withoutPrice, withoutPrice, true)).toBe(
      null,
    );

    const wholePrice = flashWithPrice("120");
    expect(tattooItemBlockReasonKey(wholePrice, wholePrice, true)).toBeNull();

    expect(isTattooPrice("32,50")).toBe(true);
    expect(isTattooPrice("12.345")).toBe(false);
  });
});

describe("tattooItemDraft event links and parsers", () => {
  it("fills date and place from a picked event and keeps them after unlinking", () => {
    const draft: SubprofileItemView = {
      ...emptyItem("flash_days"),
      structured: { flashDay: { cause: "Proceeds to ILGA Portugal" } },
    };
    const event: FlashDayEventRef = {
      slug: "trans-joy-picnic",
      title: "Trans Joy Picnic",
      startsAt: new Date(2026, 10, 14, 15).toISOString(),
      endsAt: null,
      venue: "Casa Tinta",
      neighbourhood: "Arroios",
      isOnline: false,
      imageUrl: null,
    };

    const linkPatch = withFlashDayEvent(draft, event);
    expect(linkPatch.date).toBe("2026-11-14");
    expect(linkPatch.subtitle).toBe("Casa Tinta");
    expect(linkPatch.structured?.flashDay).toEqual({
      eventSlug: "trans-joy-picnic",
      cause: "Proceeds to ILGA Portugal",
    });

    const linked: SubprofileItemView = { ...draft, ...linkPatch };
    const unlinked: SubprofileItemView = {
      ...linked,
      ...withoutFlashDayEvent(linked),
    };
    expect(unlinked.date).toBe("2026-11-14");
    expect(unlinked.subtitle).toBe("Casa Tinta");
    expect(unlinked.structured?.flashDay).toEqual({
      cause: "Proceeds to ILGA Portugal",
    });
  });

  it("reads the shop domain", () => {
    expect(shopDomain("https://www.inkwell.shop/prints/1")).toBe(
      "inkwell.shop",
    );
    expect(shopDomain("mailto:a@b.co")).toBeNull();
    expect(shopDomain("not a link")).toBeNull();
    expect(shopDomain(" https://inkwell.shop")).toBeNull();
    expect(shopDomain("HTTPS://inkwell.shop")).toBeNull();
    expect(shopDomain("https:inkwell.shop")).toBeNull();
  });

  it("cleans placements", () => {
    expect(parsePlacements("forearm, Forearm, calf, ,")).toEqual([
      "forearm",
      "calf",
    ]);

    const nineEntries = [
      "forearm",
      "calf",
      "thigh",
      "ankle",
      "wrist",
      "ribs",
      "back",
      "neck",
      "shin",
    ].join(", ");
    expect(parsePlacements(nineEntries)).toHaveLength(8);
  });
});
