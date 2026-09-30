import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import {
  CARE_GATE_OPEN_CODE,
  PUBLISH_NOT_READY_CODE,
} from "../api/piecePublish.api";
import { publishGateLabel, publishRefusalReasons } from "./publishGateReason";

/** Echoes the chosen key and its params, so each test pins WHICH catalog
 *  entry the mapper picked without depending on the catalog's wording. */
const echo: TFunction = (key, options) =>
  options && Object.keys(options).length > 0
    ? `${key} ${JSON.stringify(options)}`
    : key;

/** The server's fixed English sentences and the catalog key each maps to. */
const EXACT_SENTENCES: [string, string][] = [
  ["Care record not started", "magazine:piece.gateReason.careNotStarted"],
  [
    "Sensitivity read not started",
    "magazine:piece.gateReason.sensitivityNotStarted",
  ],
  ["Content notes written", "magazine:piece.gateReason.contentNotes"],
  [
    "The article needs a standfirst.",
    "magazine:piece.gateReason.articleStandfirst",
  ],
  ["Every image needs alt text.", "magazine:piece.gateReason.articleImageAlt"],
  [
    "The deck has not been started yet.",
    "magazine:piece.gateReason.deckNotStarted",
  ],
  ["The deck has no slides yet.", "magazine:piece.gateReason.deckNoSlides"],
  [
    "Every image slide needs alt text.",
    "magazine:piece.gateReason.deckSlideAlt",
  ],
  [
    "The cover image needs a description.",
    "magazine:piece.gateReason.deckCoverDescription",
  ],
];

describe("publishGateLabel", () => {
  it("maps every fixed server sentence to its own key, in any language", () => {
    for (const [sentence, key] of EXACT_SENTENCES) {
      expect(publishGateLabel(sentence, false, echo, "en")).toBe(key);
      expect(publishGateLabel(sentence, true, echo, "pt")).toBe(key);
    }
  });

  it("translates the consent prefix and keeps the subject's name as written", () => {
    expect(publishGateLabel("Consent: Ana Sousa", false, echo, "pt")).toBe(
      'magazine:piece.gateReason.consent {"name":"Ana Sousa"}',
    );
  });

  it("translates the sensitivity-read prefix and keeps the check's label as written", () => {
    expect(
      publishGateLabel(
        "Sensitivity read: Trans lived experience",
        true,
        echo,
        "pt",
      ),
    ).toBe(
      'magazine:piece.gateReason.sensitivityCheck {"check":"Trans lived experience"}',
    );
  });

  it("shows an unknown label verbatim in English", () => {
    expect(publishGateLabel("A brand new check", false, echo, "en")).toBe(
      "A brand new check",
    );
    expect(publishGateLabel("A brand new check", true, echo, "en-GB")).toBe(
      "A brand new check",
    );
  });

  it("shows an unknown label as the generic line for its state in Portuguese", () => {
    expect(publishGateLabel("A brand new check", true, echo, "pt")).toBe(
      "magazine:piece.gateReason.unknownCareItemDone",
    );
    expect(publishGateLabel("A brand new check", false, echo, "pt-PT")).toBe(
      "magazine:piece.gateReason.unknownCareItem",
    );
  });
});

describe("publishRefusalReasons", () => {
  it("maps fixed sentences and both prefixes, one line each", () => {
    expect(
      publishRefusalReasons(
        [
          "The article needs a standfirst.",
          "Consent: Rui",
          "Sensitivity read: Disability",
        ],
        PUBLISH_NOT_READY_CODE,
        echo,
        "pt",
      ),
    ).toEqual([
      "magazine:piece.gateReason.articleStandfirst",
      'magazine:piece.gateReason.consent {"name":"Rui"}',
      'magazine:piece.gateReason.sensitivityCheck {"check":"Disability"}',
    ]);
  });

  it("keeps an unknown sentence verbatim in English", () => {
    expect(
      publishRefusalReasons(
        ["Something the map does not know."],
        CARE_GATE_OPEN_CODE,
        echo,
        "en",
      ),
    ).toEqual(["Something the map does not know."]);
  });

  it("uses the generic line for the refusal's kind in Portuguese", () => {
    expect(
      publishRefusalReasons(["Unknown one"], CARE_GATE_OPEN_CODE, echo, "pt"),
    ).toEqual(["magazine:piece.gateReason.unknownCareItem"]);
    expect(
      publishRefusalReasons(
        ["Unknown one"],
        PUBLISH_NOT_READY_CODE,
        echo,
        "pt",
      ),
    ).toEqual(["magazine:piece.gateReason.unknownNotReady"]);
  });

  it("collapses unknown sentences that share a generic line into one", () => {
    expect(
      publishRefusalReasons(
        ["Unknown one", "Unknown two", "Content notes written"],
        CARE_GATE_OPEN_CODE,
        echo,
        "pt",
      ),
    ).toEqual([
      "magazine:piece.gateReason.unknownCareItem",
      "magazine:piece.gateReason.contentNotes",
    ]);
  });

  it("drops a repeated sentence and keeps the first-seen order", () => {
    expect(
      publishRefusalReasons(
        [
          "Every image needs alt text.",
          "The article needs a standfirst.",
          "Every image needs alt text.",
        ],
        PUBLISH_NOT_READY_CODE,
        echo,
        "en",
      ),
    ).toEqual([
      "magazine:piece.gateReason.articleImageAlt",
      "magazine:piece.gateReason.articleStandfirst",
    ]);
  });
});
