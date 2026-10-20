import { describe, expect, it } from "vitest";
import { gatheringDetails } from "../../gatherings/data";
import {
  ownerViewToShowcaseView,
  subprofileToView,
} from "../api/subprofiles.adapters";
import { buildTattooView } from "../skins/tattoo/tattooView";
import { localIsoDate } from "../skins/tattoo/tattooView.helpers";
import { TATTOO_BODY_PHOTO_SECTIONS } from "../skins/tattoo/tattooVocab.data";
import { TATTOO_ARTIST_DEMO_SUBPROFILE } from "./tattooArtistDemoSubprofile.data";
import { DEMO_SUBPROFILES } from "./subprofiles.data";

// The contract's "Per-section rules" table: the structured keys each section allows.
const ALLOWED_STRUCTURED_KEYS: Record<string, string[]> = {
  flash: ["flash"],
  wanna_dos: ["flash"],
  healed: ["healed", "photo"],
  in_progress: ["sessions", "photo"],
  cover_ups: ["coverUp", "photo"],
  scar_work: ["scarWork", "photo"],
  guest_spots: ["spot"],
  flash_days: ["flashDay"],
  shop: ["shop"],
  aftercare: [],
  credentials: [],
  gallery: [],
};

const items = TATTOO_ARTIST_DEMO_SUBPROFILE.items;

describe("tattooArtistDemoSubprofile", () => {
  it("fills every tattoo block", () => {
    const view = buildTattooView(
      ownerViewToShowcaseView(
        subprofileToView(TATTOO_ARTIST_DEMO_SUBPROFILE),
        "mariana",
      ),
      localIsoDate(new Date()),
    );
    expect(Object.values(view.hasContent).every(Boolean)).toBe(true);
  });

  it("blurs at least one scar work photo and gives every body photo explicit flags", () => {
    expect(
      items.some(
        (entry) =>
          entry.section === "scar_work" &&
          entry.structured?.photo?.isBlurred === true,
      ),
    ).toBe(true);
    const bodyItems = items.filter((entry) =>
      (TATTOO_BODY_PHOTO_SECTIONS as readonly string[]).includes(entry.section),
    );
    expect(bodyItems.length).toBeGreaterThan(0);
    for (const entry of bodyItems) {
      expect(typeof entry.structured?.photo?.isBlurred).toBe("boolean");
      expect(entry.structured?.photo?.hasClientConsent).toBe(true);
    }
  });

  it("keeps each section's structured keys inside the contract whitelist", () => {
    for (const entry of items) {
      const allowedKeys = ALLOWED_STRUCTURED_KEYS[entry.section];
      expect(allowedKeys).toBeDefined();
      for (const key of Object.keys(entry.structured ?? {})) {
        expect(allowedKeys).toContain(key);
      }
    }
  });

  it("links one flash day to a real demo event", () => {
    const linkedItems = items.filter(
      (entry) => entry.structured?.flashDay?.eventSlug,
    );
    expect(linkedItems).toHaveLength(1);
    const linkedItem = linkedItems[0];
    expect(linkedItem).toBeDefined();
    const eventSlug = linkedItem?.structured?.flashDay?.eventSlug ?? "";
    expect(Object.keys(gatheringDetails)).toContain(eventSlug);
    expect(linkedItem?.linkedEvent?.slug).toBe(eventSlug);
  });

  it("links the shop out over https", () => {
    const shopItems = items.filter((entry) => entry.section === "shop");
    expect(shopItems.length).toBeGreaterThan(0);
    for (const entry of shopItems) {
      expect(entry.url?.startsWith("https://")).toBe(true);
    }
  });

  it("registers once in DEMO_SUBPROFILES with a unique handle", () => {
    expect(
      DEMO_SUBPROFILES.filter((entry) => entry.id === "sp-mariana-inkwell"),
    ).toHaveLength(1);
    expect(
      DEMO_SUBPROFILES.filter((entry) => entry.handle === "inkwell-mariana"),
    ).toHaveLength(1);
  });
});
