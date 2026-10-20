import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import { studioSharePreviewText } from "./studioSharePreview";

const TRACK_URL =
  "https://queerpulse.com/studio/track?id=3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f";
const echoT: TFunction = (key) => key;
const realT: TFunction = (key) =>
  key === "shared:studioShare.track" ? "Faixa do Studio" : key;

describe("studioSharePreviewText", () => {
  it("puts the label after the note where the URL stood", () => {
    expect(studioSharePreviewText(`ouve isto\n${TRACK_URL}`, echoT)).toBe(
      "ouve isto · Studio track",
    );
  });

  it("is the label alone for a link-only share", () => {
    expect(studioSharePreviewText(TRACK_URL)).toBe("Studio track");
  });

  it("uses the translator when it resolves", () => {
    expect(studioSharePreviewText(TRACK_URL, realT)).toBe("Faixa do Studio");
  });

  it("leaves text without a Studio link alone", () => {
    expect(studioSharePreviewText("see you at 7", echoT)).toBe("see you at 7");
  });
});
