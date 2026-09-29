import { describe, expect, it } from "vitest";
import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import type { TranslateInFunction } from "../../../app/providers/i18nContext";
import type { TFunction } from "../../../shared/i18n/types";
import { BLIP_TEMPLATE } from "../../stickers/templates/blip/blip.template";
import { TEA_TEMPLATE } from "../../stickers/templates/tea/tea.template";
import { UNO_REVERSE_TEMPLATE } from "../../stickers/templates/unoReverse.template";
import {
  DEFAULT_TEMPLATE_ID,
  buildItemPlan,
  itemIdOfSticker,
  itemName,
  packStateByItem,
  packTemplateId,
  packTemplateStyle,
  resolveTemplate,
  sortItemIds,
  stickerLabelFor,
  stickerLabelsFor,
  templateItemIds,
  warmStickerLabelCatalogs,
} from "./stickerItems";

let stickerCounter = 0;

function stickerFixture(
  overrides: Partial<AdminStickerResponse>,
): AdminStickerResponse {
  stickerCounter += 1;
  return {
    id: `sticker-${stickerCounter}`,
    slug: `sticker-${stickerCounter}`,
    label: "Sticker",
    labelPt: null,
    url: "https://example.test/sticker.png",
    width: 512,
    height: 512,
    keywords: { en: [], pt: [] },
    templateId: "uno-reverse",
    templateParams: {},
    sortOrder: stickerCounter,
    ...overrides,
  };
}

function packFixture(
  stickers: AdminStickerResponse[],
): AdminStickerPackResponse {
  return {
    id: "pack-1",
    slug: "pack-one",
    name: "Pack one",
    namePt: null,
    description: null,
    coverStickerId: null,
    status: "draft",
    sortOrder: 0,
    createdAt: "2026-09-28T00:00:00.000Z",
    updatedAt: "2026-09-28T00:00:00.000Z",
    stickers,
  };
}

const UNO_STORED_STYLE = {
  frameColor: "#202020",
  frameWidth: 20,
  ringAngleDeg: 30,
  ringStrokeWidth: 10,
  hasCornerArrows: false,
  cornerArrowScale: 0.5,
};

const blipHiSticker = () =>
  stickerFixture({
    slug: "blip-hi",
    templateId: "blip",
    templateParams: { itemId: "hi", ...BLIP_TEMPLATE.defaultStyle },
  });

describe("packTemplateId", () => {
  it("passes over a sticker from an unknown template", () => {
    const pack = packFixture([
      stickerFixture({ slug: "mystery-thing", templateId: "mystery" }),
      blipHiSticker(),
    ]);
    expect(packTemplateId(pack)).toBe("blip");
  });

  it("is null for no pack, an empty pack, or only unknown templates", () => {
    expect(packTemplateId(null)).toBeNull();
    expect(packTemplateId(packFixture([]))).toBeNull();
    expect(
      packTemplateId(packFixture([stickerFixture({ templateId: "mystery" })])),
    ).toBeNull();
  });

  it("locks a pack of legacy Uno stickers whose params do not parse", () => {
    const pack = packFixture([
      stickerFixture({ slug: "uno-reverse-lesbian", templateParams: {} }),
    ]);
    expect(packTemplateId(pack)).toBe("uno-reverse");
  });
});

describe("resolveTemplate", () => {
  it("resolves a known id", () => {
    expect(resolveTemplate("tea-slang")).toBe(TEA_TEMPLATE);
  });

  it("falls back to the default template for null or an unknown id", () => {
    expect(resolveTemplate(null).id).toBe(DEFAULT_TEMPLATE_ID);
    expect(resolveTemplate("mystery").id).toBe(DEFAULT_TEMPLATE_ID);
  });
});

describe("itemIdOfSticker", () => {
  it("is null for a sticker of another template", () => {
    expect(itemIdOfSticker(blipHiSticker(), UNO_REVERSE_TEMPLATE)).toBeNull();
  });

  it("reads the item from the params first", () => {
    const sticker = stickerFixture({
      slug: "uno-reverse-rainbow",
      templateParams: { ...UNO_STORED_STYLE, flagId: "lesbian" },
    });
    expect(itemIdOfSticker(sticker, UNO_REVERSE_TEMPLATE)).toBe("lesbian");
    expect(itemIdOfSticker(blipHiSticker(), BLIP_TEMPLATE)).toBe("hi");
  });

  it("falls back to the slug suffix for a legacy Uno sticker", () => {
    const sticker = stickerFixture({
      slug: "uno-reverse-lesbian",
      templateParams: {},
    });
    expect(itemIdOfSticker(sticker, UNO_REVERSE_TEMPLATE)).toBe("lesbian");
  });

  it("is null when neither the params nor the slug name an item", () => {
    const sticker = stickerFixture({
      slug: "uno-reverse-",
      templateParams: {},
    });
    expect(itemIdOfSticker(sticker, UNO_REVERSE_TEMPLATE)).toBeNull();
  });

  it("is null for a slug suffix the template does not know", () => {
    const sticker = stickerFixture({
      slug: "blip-zzz",
      templateId: "blip",
      templateParams: {},
    });
    expect(itemIdOfSticker(sticker, BLIP_TEMPLATE)).toBeNull();
  });

  it("is null for a params item id the template does not know", () => {
    const sticker = stickerFixture({
      slug: "uno-reverse-zzz-unknown",
      templateParams: { ...UNO_STORED_STYLE, flagId: "zzz-unknown" },
    });
    expect(itemIdOfSticker(sticker, UNO_REVERSE_TEMPLATE)).toBeNull();
  });
});

describe("sortItemIds", () => {
  it("sorts into the template's order, dropping unknown ids and repeats", () => {
    expect(
      sortItemIds(BLIP_TEMPLATE, ["zzz-unknown", "sad", "hi", "sad"]),
    ).toEqual(["hi", "sad"]);
  });

  it("drops every id of another template", () => {
    expect(sortItemIds(BLIP_TEMPLATE, ["rainbow", "lesbian"])).toEqual([]);
  });
});

describe("templateItemIds", () => {
  it("returns every item id of the template, in order", () => {
    for (const template of [
      UNO_REVERSE_TEMPLATE,
      BLIP_TEMPLATE,
      TEA_TEMPLATE,
    ]) {
      expect(templateItemIds(template)).toEqual(
        template.items.map((item) => item.id),
      );
    }
  });

  it("gives a fresh template a selection with no id from the previous one", () => {
    const blipSelection = templateItemIds(BLIP_TEMPLATE);
    const unoItemIds = new Set(templateItemIds(UNO_REVERSE_TEMPLATE));
    expect(blipSelection.some((itemId) => unoItemIds.has(itemId))).toBe(false);
  });
});

describe("buildItemPlan", () => {
  it("replaces a legacy Uno sticker found through its slug under replace", () => {
    const legacySticker = stickerFixture({
      slug: "uno-reverse-lesbian",
      templateParams: {},
    });
    const pack = packFixture([legacySticker]);
    const plan = buildItemPlan(
      UNO_REVERSE_TEMPLATE,
      ["lesbian"],
      pack,
      "replace",
    );
    expect(plan[0]?.action).toBe("replace");
    expect(plan[0]?.existingSticker).toBe(legacySticker);
  });

  it("skips an item the pack holds under add-missing and adds the rest", () => {
    const pack = packFixture([blipHiSticker()]);
    const plan = buildItemPlan(
      BLIP_TEMPLATE,
      ["sad", "hi"],
      pack,
      "add-missing",
    );
    expect(plan.map((entry) => [entry.itemId, entry.action])).toEqual([
      ["hi", "skip"],
      ["sad", "add"],
    ]);
  });

  it("keeps ids from another template out of the plan", () => {
    const selection = [...templateItemIds(UNO_REVERSE_TEMPLATE), "hi"];
    const plan = buildItemPlan(BLIP_TEMPLATE, selection, null, "add-missing");
    expect(plan.map((entry) => entry.itemId)).toEqual(["hi"]);
  });

  it("does not throw on a pack holding unknown-template stickers", () => {
    const pack = packFixture([
      stickerFixture({ slug: "mystery-hi", templateId: "mystery" }),
    ]);
    const plan = buildItemPlan(BLIP_TEMPLATE, ["hi"], pack, "replace");
    expect(plan).toEqual([
      { itemId: "hi", action: "add", existingSticker: null },
    ]);
  });
});

describe("packStateByItem", () => {
  it("marks the items the pack holds under the template", () => {
    const pack = packFixture([
      blipHiSticker(),
      stickerFixture({ slug: "mystery-sad", templateId: "mystery" }),
    ]);
    const stateByItem = packStateByItem(pack, BLIP_TEMPLATE);
    expect(Object.keys(stateByItem)).toEqual(templateItemIds(BLIP_TEMPLATE));
    expect(stateByItem.hi).toBe("in-pack");
    expect(stateByItem.sad).toBe("new");
  });
});

describe("packTemplateStyle", () => {
  it("skips stickers whose params do not parse", () => {
    const pack = packFixture([
      stickerFixture({
        templateId: "mystery",
        templateParams: UNO_STORED_STYLE,
      }),
      stickerFixture({ slug: "uno-reverse-lesbian", templateParams: {} }),
      stickerFixture({
        templateParams: { ...UNO_STORED_STYLE, frameWidth: "wide" },
      }),
      stickerFixture({
        slug: "uno-reverse-rainbow",
        templateParams: { ...UNO_STORED_STYLE, flagId: "rainbow" },
      }),
    ]);
    expect(packTemplateStyle(pack, UNO_REVERSE_TEMPLATE)).toEqual(
      UNO_STORED_STYLE,
    );
  });

  it("is null when no sticker of the template parses", () => {
    const pack = packFixture([
      stickerFixture({ slug: "uno-reverse-lesbian", templateParams: {} }),
    ]);
    expect(packTemplateStyle(pack, UNO_REVERSE_TEMPLATE)).toBeNull();
    expect(packTemplateStyle(pack, BLIP_TEMPLATE)).toBeNull();
    expect(packTemplateStyle(null, BLIP_TEMPLATE)).toBeNull();
  });
});

describe("itemName and stickerLabelFor", () => {
  const echoTranslate: TFunction = (key, options) =>
    `${key}|${String(options?.flag ?? "")}`;

  it("names an item in the requested language, or by its id when unknown", () => {
    expect(itemName(UNO_REVERSE_TEMPLATE, "lesbian", "en")).toBe("Lesbian");
    expect(itemName(UNO_REVERSE_TEMPLATE, "lesbian", "pt")).toBe("Lésbica");
    expect(itemName(BLIP_TEMPLATE, "zzz-unknown", "en")).toBe("zzz-unknown");
  });

  it("keeps the Uno reverse label and uses the item label elsewhere", () => {
    expect(
      stickerLabelFor(UNO_REVERSE_TEMPLATE, "lesbian", echoTranslate, "en"),
    ).toBe("admin:stickerPacks.publish.stickerLabel|Lesbian");
    const blipHiLabel = BLIP_TEMPLATE.items.find((item) => item.id === "hi")
      ?.label.pt;
    expect(stickerLabelFor(BLIP_TEMPLATE, "hi", echoTranslate, "pt")).toBe(
      blipHiLabel,
    );
  });
});

describe("stickerLabelsFor", () => {
  const echoTranslate: TFunction = (key, options) =>
    `active:${key}|${String(options?.flag ?? "")}`;
  const translateInLoaded: TranslateInFunction = (language, key, options) =>
    `${language}:${key}|${String(options?.flag ?? "")}`;
  const translateInPending: TranslateInFunction = () => undefined;

  it("gives both item labels, whatever language the builder is in", () => {
    const blipHi = BLIP_TEMPLATE.items.find((item) => item.id === "hi");
    expect(
      stickerLabelsFor(BLIP_TEMPLATE, "hi", echoTranslate, translateInLoaded),
    ).toEqual({ en: blipHi?.label.en, pt: blipHi?.label.pt });
  });

  it("wraps each Uno flag name in its own language's sentence", () => {
    expect(
      stickerLabelsFor(
        UNO_REVERSE_TEMPLATE,
        "lesbian",
        echoTranslate,
        translateInLoaded,
      ),
    ).toEqual({
      en: "en:admin:stickerPacks.publish.stickerLabel|Lesbian",
      pt: "pt:admin:stickerPacks.publish.stickerLabel|Lésbica",
    });
  });

  it("falls back to the active-language sentence while a catalog loads", () => {
    expect(
      stickerLabelsFor(
        UNO_REVERSE_TEMPLATE,
        "lesbian",
        echoTranslate,
        translateInPending,
      ).pt,
    ).toBe("active:admin:stickerPacks.publish.stickerLabel|Lésbica");
  });
});

describe("warmStickerLabelCatalogs", () => {
  it("asks for the sentence in both languages", () => {
    const requestedLanguages: string[] = [];
    const recordingTranslateIn: TranslateInFunction = (language) => {
      requestedLanguages.push(language);
      return language === "en" ? "{flag} reverse" : undefined;
    };
    expect(warmStickerLabelCatalogs(recordingTranslateIn)).toBe(false);
    expect(requestedLanguages).toEqual(["en", "pt"]);
  });

  it("reports ready once both languages resolve", () => {
    const loadedTranslateIn: TranslateInFunction = () => "{flag} reverse";
    expect(warmStickerLabelCatalogs(loadedTranslateIn)).toBe(true);
  });
});
