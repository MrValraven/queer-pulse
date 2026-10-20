import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/client";
import type { SubprofileItemInputDTO } from "../../api/subprofiles.api";
import {
  availabilityForTattooStatus,
  prepareTattooItemsForSave,
  tattooRefusalCopy,
} from "./tattooSaveGraph";

function makeFlashDays(): SubprofileItemInputDTO[] {
  return [
    {
      title: "Flash day",
      date: "2026-11-14",
      structured: {
        flashDay: {
          eventSlug: "trans-joy-picnic",
          cause: "Proceeds to ILGA Portugal",
        },
      },
    },
    {
      title: "Fundraiser",
      date: "2026-12-05",
      structured: { flashDay: { eventSlug: "stone-butch-blues" } },
    },
  ];
}

const healedContext = {
  sectionLabel: "Healed work",
  controlLabelForPath: () => null,
};

describe("availabilityForTattooStatus", () => {
  it("sends the paired availability with a changed status", () => {
    expect(
      availabilityForTattooStatus("tattoo_artist", "open", "booking"),
    ).toBe("open_to_collabs");
  });

  it("adds nothing for a seeded status that already matches", () => {
    expect(
      availabilityForTattooStatus("tattoo_artist", "waitlist", "booking"),
    ).toBeNull();
  });

  it("leaves other kinds and unlisted values alone", () => {
    expect(
      availabilityForTattooStatus("therapist", "open", "booking"),
    ).toBeNull();
    expect(
      availabilityForTattooStatus("tattoo_artist", "wait", "booking"),
    ).toBeNull();
    expect(
      availabilityForTattooStatus("tattoo_artist", undefined, ""),
    ).toBeNull();
  });
});

describe("prepareTattooItemsForSave", () => {
  it("drops every eventSlug when the draft unlinks the persona", () => {
    const [first, second] = prepareTattooItemsForSave(
      "flash_days",
      makeFlashDays(),
      { isUnlinked: true },
    );
    expect(first?.structured).toEqual({
      flashDay: { cause: "Proceeds to ILGA Portugal" },
    });
    expect(first?.title).toBe("Flash day");
    expect(first?.date).toBe("2026-11-14");
    expect(second).toBeDefined();
    expect("structured" in second!).toBe(false);
    expect(second?.title).toBe("Fundraiser");
  });

  it("keeps event links on a linked persona", () => {
    const flashDays = makeFlashDays();
    expect(
      prepareTattooItemsForSave("flash_days", flashDays, { isUnlinked: false }),
    ).toEqual(makeFlashDays());
  });

  it("drops collaborators from body photo items before saving", () => {
    const [healed] = prepareTattooItemsForSave(
      "healed",
      [{ title: "Peony sleeve", collaborators: ["mara"] }],
      { isUnlinked: false },
    );
    expect(healed?.collaborators).toEqual([]);
    const [flash] = prepareTattooItemsForSave(
      "flash",
      [{ title: "Sheet one", collaborators: ["mara"] }],
      { isUnlinked: false },
    );
    expect(flash?.collaborators).toEqual(["mara"]);
  });

  it("drops sessions whose photo is empty", () => {
    const [project] = prepareTattooItemsForSave(
      "in_progress",
      [
        {
          title: "Back piece",
          structured: {
            sessions: [
              { imageUrl: "a.jpg" },
              { imageUrl: "" },
              { imageUrl: "b.jpg", note: "second pass" },
            ],
          },
        },
      ],
      { isUnlinked: false },
    );
    expect(project?.structured?.sessions).toEqual([
      { imageUrl: "a.jpg" },
      { imageUrl: "b.jpg", note: "second pass" },
    ]);
  });

  it("drops sessions whose photo is only spaces", () => {
    const [project] = prepareTattooItemsForSave(
      "in_progress",
      [
        {
          title: "Back piece",
          structured: {
            sessions: [
              { imageUrl: "a.jpg" },
              { imageUrl: "   " },
              { imageUrl: "\t" },
            ],
          },
        },
      ],
      { isUnlinked: false },
    );
    expect(project?.structured?.sessions).toEqual([{ imageUrl: "a.jpg" }]);
  });

  it("leaves every other section as it came", () => {
    const healed: SubprofileItemInputDTO[] = [
      { title: "Peony sleeve", imageUrl: "healed-1.jpg" },
      {
        title: "Swallow",
        imageUrl: "healed-2.jpg",
        structured: { healed: { healedFor: "2 years" } },
      },
    ];
    const gallery: SubprofileItemInputDTO[] = [
      { title: "Studio wall", imageUrl: "gallery-1.jpg" },
    ];
    expect(
      prepareTattooItemsForSave("healed", healed, { isUnlinked: true }),
    ).toBe(healed);
    expect(
      prepareTattooItemsForSave("gallery", gallery, { isUnlinked: true }),
    ).toBe(gallery);
  });
});

describe("tattooRefusalCopy", () => {
  it("names the section and the item number for a consent refusal", () => {
    const error = new ApiError(400, "x", {
      code: "CLIENT_CONSENT_REQUIRED",
      itemIndex: 1,
    });
    expect(tattooRefusalCopy(error, healedContext)).toEqual({
      messageKey: "subprofiles:tattoo.refusal.consent",
      params: { section: "Healed work", number: 2 },
    });
  });

  it("names the field of a skin refusal", () => {
    const error = new ApiError(400, "x", {
      code: "TATTOO_SKIN_INVALID",
      path: "tattooPrices.deposit.amount",
    });
    const pathsAsked: string[] = [];
    expect(
      tattooRefusalCopy(error, {
        sectionLabel: "Page blocks",
        controlLabelForPath: (path) => {
          pathsAsked.push(path);
          return "Deposit";
        },
      }),
    ).toEqual({
      messageKey: "subprofiles:tattoo.refusal.skin",
      params: { field: "Deposit" },
    });
    expect(pathsAsked).toEqual(["tattooPrices.deposit.amount"]);
    expect(
      tattooRefusalCopy(error, {
        sectionLabel: "Page blocks",
        controlLabelForPath: () => null,
      }),
    ).toEqual({
      messageKey: "subprofiles:tattoo.refusal.skinUnknown",
      params: {},
    });
  });

  it("maps both event refusals and ignores other errors", () => {
    const flashDaysContext = {
      sectionLabel: "Flash days & fundraisers",
      controlLabelForPath: () => null,
    };
    expect(
      tattooRefusalCopy(
        new ApiError(400, "x", {
          code: "FLASH_DAY_EVENT_UNLINKED_PERSONA",
          itemIndex: 0,
        }),
        flashDaysContext,
      ),
    ).toEqual({
      messageKey: "subprofiles:tattoo.refusal.eventUnlinked",
      params: { section: "Flash days & fundraisers", number: 1 },
    });
    expect(
      tattooRefusalCopy(
        new ApiError(400, "x", {
          code: "FLASH_DAY_EVENT_NOT_ELIGIBLE",
          itemIndex: 3,
        }),
        flashDaysContext,
      ),
    ).toEqual({
      messageKey: "subprofiles:tattoo.refusal.eventNotEligible",
      params: { section: "Flash days & fundraisers", number: 4 },
    });
    expect(
      tattooRefusalCopy(
        new ApiError(409, "x", { code: "PERSONA_EDIT_CONFLICT" }),
        healedContext,
      ),
    ).toBeNull();
    expect(
      tattooRefusalCopy(new ApiError(400, "x", {}), healedContext),
    ).toBeNull();
    expect(tattooRefusalCopy(new Error("x"), healedContext)).toBeNull();
  });

  it("maps an invalid item to its own copy", () => {
    expect(
      tattooRefusalCopy(
        new ApiError(400, "x", {
          code: "TATTOO_ITEM_INVALID",
          itemIndex: 2,
          field: "structured.sessions.3.imageUrl",
        }),
        healedContext,
      ),
    ).toEqual({
      messageKey: "subprofiles:tattoo.refusal.item",
      params: { section: "Healed work", number: 3 },
    });
  });
});
