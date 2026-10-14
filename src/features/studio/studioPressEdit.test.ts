import { describe, expect, it } from "vitest";
import type { StudioPressKitView } from "./api/studio.adapters";
import {
  bodyFromPressForm,
  formFromOwner,
  hasStudioPressKitFormErrors,
  moveItem,
  pressTrackRows,
  savedTrackOptions,
  studioPressKitFormErrors,
  trackOptionsFromStats,
} from "./studioPressEdit";

const empty = formFromOwner(null);

describe("press kit form rules", () => {
  it("accepts an empty kit", () => {
    expect(hasStudioPressKitFormErrors(studioPressKitFormErrors(empty))).toBe(
      false,
    );
  });

  it("takes a contact as https or mailto only", () => {
    expect(
      studioPressKitFormErrors({ ...empty, contact: "http://site.pt" }).contact,
    ).toBe("studio:pressEdit.contactInvalid");
    expect(
      studioPressKitFormErrors({ ...empty, contact: "press@site.pt" }).contact,
    ).toBe("studio:pressEdit.contactInvalid");
    expect(
      studioPressKitFormErrors({ ...empty, contact: "mailto:press" }).contact,
    ).toBe("studio:pressEdit.contactInvalid");
    expect(
      studioPressKitFormErrors({ ...empty, contact: "mailto:press@site.pt" })
        .contact,
    ).toBeUndefined();
    expect(
      studioPressKitFormErrors({ ...empty, contact: "https://site.pt/press" })
        .contact,
    ).toBeUndefined();
  });

  it("needs both halves of a quote", () => {
    const errors = studioPressKitFormErrors({
      ...empty,
      quotes: [{ quote: "Hypnotic", source: " " }],
    });
    expect(errors.quotes[0]?.source).toBe(
      "studio:pressEdit.quoteSourceRequired",
    );
    expect(errors.quotes[0]?.quote).toBeUndefined();
    expect(hasStudioPressKitFormErrors(errors)).toBe(true);
  });

  it("sends every key, trimmed, with null for an empty field", () => {
    expect(
      bodyFromPressForm({
        pitch: "  After-hours  ",
        pressBio: "",
        featuredTrackIds: ["t1"],
        quotes: [{ quote: " Hypnotic ", source: " Rimas ", rowKey: "added-1" }],
        contact: " ",
      }),
    ).toEqual({
      pitch: "After-hours",
      pressBio: null,
      featuredTrackIds: ["t1"],
      quotes: [{ quote: "Hypnotic", source: "Rimas" }],
      contact: null,
    });
  });

  it("sends [] for no tracks and no quotes", () => {
    const body = bodyFromPressForm(empty);
    expect(body.featuredTrackIds).toEqual([]);
    expect(body.quotes).toEqual([]);
    expect(Object.keys(body).sort()).toEqual([
      "contact",
      "featuredTrackIds",
      "pitch",
      "pressBio",
      "quotes",
    ]);
  });

  it("moves an item and leaves the list alone at an edge", () => {
    expect(moveItem(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });
});

describe("trackOptionsFromStats", () => {
  it("offers only published tracks with audio", () => {
    const card = (id: string, title: string) => ({
      id,
      title,
    });
    const options = trackOptionsFromStats({
      subprofileId: "p1",
      followerCount: 0,
      releases: [
        {
          release: card("r1", "Salt water"),
          status: "published",
          tracks: [
            { track: { id: "t1", title: "Tide", hasAudio: true } },
            { track: { id: "t2", title: "Pier", hasAudio: false } },
          ],
        },
        {
          release: card("r2", "Draft"),
          status: "draft",
          tracks: [{ track: { id: "t3", title: "Sketch", hasAudio: true } }],
        },
      ],
    } as unknown as Parameters<typeof trackOptionsFromStats>[0]);
    expect(options).toEqual([
      { id: "t1", title: "Tide", releaseTitle: "Salt water" },
    ]);
  });
});

describe("the picker's rows", () => {
  const tide = { id: "t1", title: "Tide", releaseTitle: "Salt water" };

  it("keeps an unknown pick loading until the track list answers", () => {
    expect(pressTrackRows(["t1", "gone"], [tide], "loading")).toEqual([
      { id: "t1", state: "playable", option: tide },
      { id: "gone", state: "pending" },
    ]);
  });

  it("reads an unknown pick as no longer available once the list is in", () => {
    expect(pressTrackRows(["gone"], [tide], "ready")).toEqual([
      { id: "gone", state: "unavailable" },
    ]);
    expect(pressTrackRows(["gone"], [tide], "error")).toEqual([
      { id: "gone", state: "unavailable" },
    ]);
  });

  it("names the saved playable picks from the press kit itself", () => {
    const pressKit = {
      isFeaturedFallback: false,
      featuredTracks: [
        { id: "t1", title: "Tide", release: { title: "Salt water" } },
      ],
    } as unknown as StudioPressKitView;
    expect(savedTrackOptions(pressKit)).toEqual([tide]);
    expect(
      savedTrackOptions({ ...pressKit, isFeaturedFallback: true }),
    ).toEqual([]);
  });
});
