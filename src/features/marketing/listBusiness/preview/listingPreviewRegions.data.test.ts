import { describe, expect, it } from "vitest";
import {
  ANCHOR,
  type ListingDraft,
  type OwnerVisibility,
} from "../listBusiness.data";
import { blankDraft } from "../listingFormDraft";
import { emptyAccessibilityAnswers } from "../listingAccessibility.data";
import { BLANK_OWNER_PERSONAL_FIELDS } from "../ownerPersonalFields";
import {
  hasCardAccessAnswers,
  highlightedRegionsFor,
  LISTING_PREVIEW_IDLE_CAPTION_KEY,
  LISTING_PREVIEW_RENDERED_REGIONS,
  LISTING_PREVIEW_WILL_SHOW_CAPTION_KEY,
  ownerPlaceholderKey,
  placementForAnchor,
  renderedPreviewRegions,
  shownOwnerName,
} from "./listingPreviewRegions.data";

const CAPTION_PREFIX = "marketing:listBusiness.livePreview.caption.";
const VISIBILITY_MODES: OwnerVisibility[] = ["public", "role", "anon"];

function draftWith(fields: Partial<ListingDraft>): ListingDraft {
  return { ...blankDraft(), ...fields };
}

/** A draft whose card accessibility row renders: one question answered yes. */
function withYesAccessAnswer(fields: Partial<ListingDraft>): ListingDraft {
  const answers = emptyAccessibilityAnswers();
  answers["step-free-entrance"] = "yes";
  return draftWith({ ...fields, accessibility: { answers, note: "" } });
}

/** Every owner mode, for an owner and for a co-manager, online and not, with
 *  and without yes answers: each draft-aware rule sees each of its inputs. */
const DRAFT_VARIANTS: { label: string; draft: ListingDraft }[] =
  VISIBILITY_MODES.flatMap((visibility) =>
    [true, false].flatMap((isOnline) => [
      {
        label: `owner ${visibility} online=${isOnline}`,
        draft: draftWith({ visibility, online: isOnline, name: "Rosa" }),
      },
      {
        label: `owner ${visibility} yes-answer online=${isOnline}`,
        draft: withYesAccessAnswer({
          visibility,
          online: isOnline,
          linkToProfile: false,
        }),
      },
      {
        // A co-manager's draft always carries the blank stand-ins
        // (`BLANK_OWNER_PERSONAL_FIELDS`), whatever the owner chose.
        label: `co-manager online=${isOnline}`,
        draft: draftWith({
          ...BLANK_OWNER_PERSONAL_FIELDS,
          online: isOnline,
          managementRole: "co_manager",
        }),
      },
    ]),
  );

describe("LISTING_FIELD_PLACEMENTS", () => {
  it("gives every field anchor a placement in every owner mode", () => {
    for (const { label, draft } of DRAFT_VARIANTS) {
      for (const anchor of Object.values(ANCHOR)) {
        expect(
          placementForAnchor(anchor, draft),
          `${anchor} ${label}`,
        ).not.toBeNull();
      }
    }
  });

  it("points every preview placement at regions the preview renders", () => {
    for (const { label, draft } of DRAFT_VARIANTS) {
      for (const anchor of Object.values(ANCHOR)) {
        const placement = placementForAnchor(anchor, draft);
        if (placement?.kind !== "preview") continue;
        expect(placement.regions.length, `${anchor} ${label}`).toBeGreaterThan(
          0,
        );
        for (const region of placement.regions) {
          expect(LISTING_PREVIEW_RENDERED_REGIONS, anchor).toContain(region);
        }
      }
    }
  });

  it("keeps every caption in the live preview namespace", () => {
    for (const { draft } of DRAFT_VARIANTS) {
      for (const anchor of Object.values(ANCHOR)) {
        const placement = placementForAnchor(anchor, draft);
        expect(placement?.captionKey.startsWith(CAPTION_PREFIX), anchor).toBe(
          true,
        );
      }
    }
    for (const key of [
      LISTING_PREVIEW_IDLE_CAPTION_KEY,
      LISTING_PREVIEW_WILL_SHOW_CAPTION_KEY,
    ]) {
      expect(key.startsWith(CAPTION_PREFIX)).toBe(true);
    }
  });

  it("outlines a drawn spot for every named-card preview field", () => {
    // The caption's "once it has a name" line assumes the placeholder card is
    // the only state that hides a preview field's spots.
    for (const { label, draft } of DRAFT_VARIANTS) {
      const named = { ...draft, name: "Livraria Rosa" };
      for (const anchor of Object.values(ANCHOR)) {
        const placement = placementForAnchor(anchor, named);
        if (placement?.kind !== "preview") continue;
        expect(
          highlightedRegionsFor(placement, named).length,
          `${anchor} ${label}`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe("placementForAnchor", () => {
  const draft = blankDraft();

  it("returns null when no field is focused", () => {
    expect(placementForAnchor(null, draft)).toBeNull();
  });

  it("returns null for an id that is no field anchor", () => {
    expect(placementForAnchor("lb-editor-basics", draft)).toBeNull();
    expect(placementForAnchor("toString", draft)).toBeNull();
  });

  it("finds the placement of a known anchor", () => {
    expect(placementForAnchor(ANCHOR.blurb, draft)).toEqual({
      kind: "preview",
      regions: ["desc"],
      captionKey: `${CAPTION_PREFIX}blurb`,
    });
    expect(placementForAnchor(ANCHOR.contactEmail, draft)?.kind).toBe(
      "private",
    );
  });
});

describe("owner placements follow the chosen visibility", () => {
  const modeDraft = (visibility: OwnerVisibility) =>
    draftWith({ visibility, ownerName: "Sandra", ownerRole: "Owner" });

  it("shows the owner's name only in public mode", () => {
    expect(placementForAnchor(ANCHOR.ownerName, modeDraft("public"))).toEqual({
      kind: "preview",
      regions: ["host", "owner"],
      captionKey: `${CAPTION_PREFIX}ownerName`,
    });
    for (const visibility of ["role", "anon"] as const) {
      const placement = placementForAnchor(
        ANCHOR.ownerName,
        modeDraft(visibility),
      );
      expect(placement?.kind, visibility).toBe("private");
    }
    expect(
      placementForAnchor(ANCHOR.ownerName, modeDraft("role"))?.captionKey,
    ).toBe(`${CAPTION_PREFIX}ownerNameRoleMode`);
    expect(
      placementForAnchor(ANCHOR.ownerName, modeDraft("anon"))?.captionKey,
    ).toBe(`${CAPTION_PREFIX}ownerNameAnon`);
  });

  it("never outlines a spot for the name in a private mode", () => {
    for (const visibility of ["role", "anon"] as const) {
      const draft = { ...modeDraft(visibility), name: "Livraria Rosa" };
      const placement = placementForAnchor(ANCHOR.ownerName, draft);
      expect(highlightedRegionsFor(placement, draft), visibility).toEqual([]);
    }
  });

  it("shows the role beside the name, in its place, or not at all", () => {
    const captionFor = (visibility: OwnerVisibility) =>
      placementForAnchor(ANCHOR.ownerRole, modeDraft(visibility));
    expect(captionFor("public")).toEqual({
      kind: "preview",
      regions: ["owner"],
      captionKey: `${CAPTION_PREFIX}ownerRole`,
    });
    expect(captionFor("role")).toEqual({
      kind: "preview",
      regions: ["owner"],
      captionKey: `${CAPTION_PREFIX}ownerRoleInPlace`,
    });
    expect(captionFor("anon")).toEqual({
      kind: "private",
      captionKey: `${CAPTION_PREFIX}ownerRoleAnon`,
    });
  });

  it("gives a co-manager a role caption that makes no claim about their name", () => {
    for (const visibility of VISIBILITY_MODES) {
      const coManaged = draftWith({
        visibility,
        ownerName: "",
        managementRole: "co_manager",
      });
      expect(
        placementForAnchor(ANCHOR.ownerRole, coManaged)?.captionKey,
        visibility,
      ).toBe(`${CAPTION_PREFIX}ownerRoleCoManager`);
    }
  });

  it("points the profile link at the card and byline only in public mode", () => {
    // Linking also adds the card's Member-run pill, so the pills row counts.
    expect(placementForAnchor(ANCHOR.linkProfile, modeDraft("public"))).toEqual(
      {
        kind: "preview",
        regions: ["host", "pills", "owner"],
        captionKey: `${CAPTION_PREFIX}linkProfile`,
      },
    );
    for (const visibility of ["role", "anon"] as const) {
      expect(
        placementForAnchor(ANCHOR.linkProfile, modeDraft(visibility)),
        visibility,
      ).toEqual({
        kind: "private",
        captionKey: `${CAPTION_PREFIX}linkProfileUnused`,
      });
    }
  });

  it("outlines the owner spots for the visibility choice unless anonymous", () => {
    for (const visibility of ["public", "role"] as const) {
      expect(
        placementForAnchor(ANCHOR.ownerVisibility, modeDraft(visibility))?.kind,
        visibility,
      ).toBe("preview");
    }
    expect(
      placementForAnchor(ANCHOR.ownerVisibility, modeDraft("anon")),
    ).toEqual({
      kind: "private",
      captionKey: `${CAPTION_PREFIX}ownerVisibilityAnon`,
    });
  });

  it("says the bio shows nowhere yet, with no claim that it is private", () => {
    // The public detail payload carries the bio in public and role modes, so
    // a lock caption would promise a privacy the API does not keep.
    for (const visibility of VISIBILITY_MODES) {
      expect(
        placementForAnchor(ANCHOR.ownerBio, modeDraft(visibility)),
        visibility,
      ).toEqual({
        kind: "notShown",
        captionKey: `${CAPTION_PREFIX}ownerBio`,
      });
    }
  });

  it("gives an empty role-mode owner block a placeholder about the role alone", () => {
    expect(ownerPlaceholderKey(draftWith({ visibility: "role" }))).toBe(
      "marketing:listBusiness.livePreview.placeholder.ownerRoleMode",
    );
    expect(ownerPlaceholderKey(draftWith({ visibility: "public" }))).toBe(
      "marketing:listBusiness.livePreview.placeholder.owner",
    );
  });
});

describe("listing settings", () => {
  it("gives the pause and co-manager controls the neutral setting kind", () => {
    for (const anchor of [ANCHOR.directoryVisibility, ANCHOR.coManagers]) {
      expect(placementForAnchor(anchor, blankDraft())?.kind, anchor).toBe(
        "setting",
      );
    }
  });
});

describe("online listings", () => {
  const onlineNamed = draftWith({ name: "Livraria Rosa", online: true });
  const onlinePlaceholder = draftWith({ name: "", online: true });

  it("leaves the excerpt's hours block out, as the page leaves out its hours", () => {
    expect(renderedPreviewRegions(onlineNamed).has("hours")).toBe(false);
    expect(
      renderedPreviewRegions({ ...onlineNamed, online: false }).has("hours"),
    ).toBe(true);
  });

  it("points the hours and their tools at the card's status line alone", () => {
    for (const anchor of [ANCHOR.hours, ANCHOR.hoursTools]) {
      expect(placementForAnchor(anchor, onlineNamed), anchor).toEqual({
        kind: "preview",
        regions: ["status"],
        captionKey: `${CAPTION_PREFIX}hoursOnline`,
      });
      expect(
        highlightedRegionsFor(
          placementForAnchor(anchor, onlineNamed),
          onlineNamed,
        ),
        anchor,
      ).toEqual(["status"]);
    }
  });

  it("says the hours note and special dates leave the page", () => {
    expect(placementForAnchor(ANCHOR.hoursNote, onlineNamed)).toEqual({
      kind: "notShown",
      captionKey: `${CAPTION_PREFIX}hoursNoteOnline`,
    });
    expect(placementForAnchor(ANCHOR.hoursExceptions, onlineNamed)).toEqual({
      kind: "preview",
      regions: ["status"],
      captionKey: `${CAPTION_PREFIX}hoursExceptionsOnline`,
    });
    expect(
      placementForAnchor(ANCHOR.hoursNote, { ...onlineNamed, online: false })
        ?.kind,
    ).toBe("fullPage");
  });

  it("outlines no stand-in meta line for Online on the placeholder card", () => {
    // The placeholder card's meta line never says Online, so the caption
    // falls back to the "once it has a name" line instead of "here".
    for (const anchor of [ANCHOR.online, ANCHOR.hood]) {
      expect(
        highlightedRegionsFor(
          placementForAnchor(anchor, onlinePlaceholder),
          onlinePlaceholder,
        ),
        anchor,
      ).toEqual([]);
      expect(
        highlightedRegionsFor(
          placementForAnchor(anchor, onlineNamed),
          onlineNamed,
        ),
        anchor,
      ).toEqual(["meta"]);
    }
  });

  it("still outlines the placeholder meta line for the category", () => {
    expect(
      highlightedRegionsFor(
        placementForAnchor(ANCHOR.cats, onlinePlaceholder),
        onlinePlaceholder,
      ),
    ).toEqual(["meta"]);
  });
});

describe("other draft-aware placements", () => {
  it("says Online for the neighbourhood of an online listing", () => {
    expect(
      placementForAnchor(ANCHOR.hood, draftWith({ online: true }))?.captionKey,
    ).toBe(`${CAPTION_PREFIX}hoodOnline`);
    expect(
      placementForAnchor(ANCHOR.hood, draftWith({ online: false }))?.captionKey,
    ).toBe(`${CAPTION_PREFIX}hood`);
  });

  it("points accessibility at the card row only when it has a yes answer", () => {
    expect(
      placementForAnchor(ANCHOR.accessibility, withYesAccessAnswer({})),
    ).toEqual({
      kind: "preview",
      regions: ["access"],
      captionKey: `${CAPTION_PREFIX}accessibilityCard`,
    });
    expect(placementForAnchor(ANCHOR.accessibility, blankDraft())).toEqual({
      kind: "fullPage",
      captionKey: `${CAPTION_PREFIX}accessibility`,
    });
  });

  it("gives the hours tools the same spots as the hours grid", () => {
    const draft = blankDraft();
    expect(placementForAnchor(ANCHOR.hoursTools, draft)).toEqual(
      placementForAnchor(ANCHOR.hours, draft),
    );
  });
});

describe("hasCardAccessAnswers", () => {
  it("is false until some answer is yes", () => {
    expect(hasCardAccessAnswers(blankDraft())).toBe(false);
    expect(hasCardAccessAnswers(draftWith({ accessibility: undefined }))).toBe(
      false,
    );
    const answers = emptyAccessibilityAnswers();
    answers["step-free-entrance"] = "no";
    expect(
      hasCardAccessAnswers(draftWith({ accessibility: { answers, note: "" } })),
    ).toBe(false);
    expect(hasCardAccessAnswers(withYesAccessAnswer({}))).toBe(true);
  });
});

describe("renderedPreviewRegions", () => {
  it("draws only the placeholder card's lines before there is a name", () => {
    const regions = renderedPreviewRegions(draftWith({ name: "" }));
    for (const region of ["name", "meta", "desc"] as const) {
      expect(regions.has(region), region).toBe(true);
    }
    for (const region of [
      "photo",
      "badge",
      "pills",
      "status",
      "host",
    ] as const) {
      expect(regions.has(region), region).toBe(false);
    }
  });

  it("draws the card regions once the listing has a name", () => {
    const regions = renderedPreviewRegions(
      draftWith({ name: "Livraria Rosa", blurb: "Books and coffee." }),
    );
    for (const region of [
      "photo",
      "badge",
      "name",
      "meta",
      "desc",
      "pills",
      "status",
    ] as const) {
      expect(regions.has(region), region).toBe(true);
    }
  });

  it("keeps an empty one-liner on the real card, which always renders it", () => {
    const regions = renderedPreviewRegions(
      draftWith({ name: "Livraria Rosa", blurb: "  " }),
    );
    expect(regions.has("desc")).toBe(true);
  });

  it("draws the owner block in role mode from the role alone", () => {
    const roleOnly = draftWith({
      visibility: "role",
      ownerName: "",
      ownerRole: "Owner",
    });
    expect(renderedPreviewRegions(roleOnly).has("owner")).toBe(true);
    expect(shownOwnerName(roleOnly)).toBe("Owner");
  });

  it("names the host only for a public, profile-linked owner", () => {
    const linked = draftWith({
      name: "Livraria Rosa",
      ownerName: "Sandra Lopes",
      visibility: "public",
      linkToProfile: true,
    });
    expect(renderedPreviewRegions(linked).has("host")).toBe(true);
    expect(
      renderedPreviewRegions({ ...linked, linkToProfile: false }).has("host"),
    ).toBe(false);
    expect(
      renderedPreviewRegions({ ...linked, visibility: "role" }).has("host"),
    ).toBe(false);
  });

  it("always draws the excerpt blocks, and the owner unless anonymous", () => {
    const regions = renderedPreviewRegions(draftWith({ visibility: "public" }));
    for (const region of [
      "tagline",
      "whatItIs",
      "goodFor",
      "languages",
      "hours",
      "owner",
    ] as const) {
      expect(regions.has(region), region).toBe(true);
    }
    expect(
      renderedPreviewRegions(draftWith({ visibility: "anon" })).has("owner"),
    ).toBe(false);
  });

  it("only returns regions the preview has an attribute for", () => {
    const regions = renderedPreviewRegions(
      draftWith({ name: "Livraria Rosa", ownerName: "Sandra" }),
    );
    for (const region of regions) {
      expect(LISTING_PREVIEW_RENDERED_REGIONS).toContain(region);
    }
  });
});

describe("highlightedRegionsFor", () => {
  it("outlines nothing for a private or full-page field", () => {
    const draft = draftWith({ name: "Livraria Rosa" });
    expect(
      highlightedRegionsFor(
        placementForAnchor(ANCHOR.contactEmail, draft),
        draft,
      ),
    ).toEqual([]);
    expect(
      highlightedRegionsFor(placementForAnchor(ANCHOR.address, draft), draft),
    ).toEqual([]);
    expect(highlightedRegionsFor(null, draft)).toEqual([]);
  });

  it("outlines nothing when none of the field's spots are drawn yet", () => {
    const placeholderCard = draftWith({ name: "" });
    expect(
      highlightedRegionsFor(
        placementForAnchor(ANCHOR.photos, placeholderCard),
        placeholderCard,
      ),
    ).toEqual([]);
  });

  it("keeps only the drawn spots of a field with several", () => {
    const unlinked = draftWith({
      name: "Livraria Rosa",
      ownerName: "Sandra",
      linkToProfile: false,
    });
    expect(
      highlightedRegionsFor(
        placementForAnchor(ANCHOR.ownerName, unlinked),
        unlinked,
      ),
    ).toEqual(["owner"]);
    expect(
      highlightedRegionsFor(
        placementForAnchor(ANCHOR.hours, unlinked),
        unlinked,
      ),
    ).toEqual(["status", "hours"]);
  });
});

describe("shownOwnerName", () => {
  it("shows the name in public mode", () => {
    expect(
      shownOwnerName(
        draftWith({
          visibility: "public",
          ownerName: " Sandra ",
          ownerRole: "Owner",
        }),
      ),
    ).toBe("Sandra");
  });

  it("shows the role in role mode, keeping the name private", () => {
    expect(
      shownOwnerName(
        draftWith({
          visibility: "role",
          ownerName: "Sandra",
          ownerRole: "Owner",
        }),
      ),
    ).toBe("Owner");
  });

  it("shows nothing for an anonymous owner", () => {
    expect(
      shownOwnerName(
        draftWith({
          visibility: "anon",
          ownerName: "Sandra",
          ownerRole: "Owner",
        }),
      ),
    ).toBe("");
  });
});
