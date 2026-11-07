import { describe, expect, it, vi } from "vitest";
import type { TranslateInFunction } from "../../../../app/providers/i18nContext";
import {
  VJ_ALL_EFFECTS_SHORT_KEY,
  vjPadLabelKey,
  vjShortLabelOf,
} from "./vjPadLabel";

const SHORT_LABELS: Record<string, Record<string, string>> = {
  en: { "vj:effects.padLabel.kaleidoscope": "Kaleido" },
  pt: { "vj:effects.padLabel.strobe": "Estrobo" },
};

const translateIn: TranslateInFunction = (language, key) =>
  SHORT_LABELS[language]?.[key];

describe("vjPadLabel", () => {
  it("names a pad's short label key after its pad id", () => {
    expect(vjPadLabelKey("kaleidoscope")).toBe(
      "vj:effects.padLabel.kaleidoscope",
    );
    expect(vjPadLabelKey("strobe")).toBe("vj:effects.padLabel.strobe");
    expect(VJ_ALL_EFFECTS_SHORT_KEY).toBe("vj:pads.allEffectsShort");
  });

  it("shows the short label when the site language has one", () => {
    expect(
      vjShortLabelOf(
        translateIn,
        "en",
        vjPadLabelKey("kaleidoscope"),
        "Kaleidoscope",
      ),
    ).toBe("Kaleido");
  });

  it("falls back to the full name in the site language when the short key is missing", () => {
    expect(
      vjShortLabelOf(
        translateIn,
        "pt",
        vjPadLabelKey("kaleidoscope"),
        "Caleidoscópio",
      ),
    ).toBe("Caleidoscópio");
  });

  it("asks only the site language, so a PT pad never borrows the English short label", () => {
    const spy = vi.fn(translateIn);
    vjShortLabelOf(spy, "pt", vjPadLabelKey("kaleidoscope"), "Caleidoscópio");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("pt", "vj:effects.padLabel.kaleidoscope");
  });

  it("falls back to the full name for an empty short label", () => {
    const emptyTranslate: TranslateInFunction = () => "";
    expect(
      vjShortLabelOf(emptyTranslate, "en", vjPadLabelKey("invert"), "Invert"),
    ).toBe("Invert");
  });
});
