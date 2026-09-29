import { describe, expect, it } from "vitest";
import type {
  StickerPackResponse,
  StickerResponse,
} from "../../shared/contracts/contracts";
import {
  normalizeStickerSearchText,
  searchStickers,
  stickerMatchesQuery,
} from "./stickerSearch";

function sticker(overrides: Partial<StickerResponse>): StickerResponse {
  return {
    id: "sticker-1",
    slug: "sticker-1",
    label: "Blip in love",
    labelPt: "Blip apaixonade",
    url: "https://example.test/sticker.png",
    width: 512,
    height: 512,
    keywords: { en: ["love", "heart eyes"], pt: ["amor", "coração"] },
    ...overrides,
  };
}

function pack(id: string, stickers: StickerResponse[]): StickerPackResponse {
  return {
    id,
    slug: id,
    name: id,
    namePt: null,
    description: null,
    coverStickerId: null,
    stickers,
  };
}

describe("normalizeStickerSearchText", () => {
  it("lowercases, trims and strips accents", () => {
    expect(normalizeStickerSearchText("  Coração ")).toBe("coracao");
    expect(normalizeStickerSearchText("OLÁ")).toBe("ola");
    expect(normalizeStickerSearchText("Género")).toBe("genero");
  });
});

describe("stickerMatchesQuery", () => {
  it("matches the name in the reader's language", () => {
    expect(stickerMatchesQuery(sticker({}), "in love", "en")).toBe(true);
    expect(stickerMatchesQuery(sticker({}), "apaixon", "pt")).toBe(true);
    expect(stickerMatchesQuery(sticker({}), "apaixon", "en")).toBe(false);
  });

  it("matches keywords in the reader's language only", () => {
    expect(stickerMatchesQuery(sticker({}), "heart", "en")).toBe(true);
    expect(stickerMatchesQuery(sticker({}), "amor", "pt")).toBe(true);
    expect(stickerMatchesQuery(sticker({}), "amor", "en")).toBe(false);
  });

  it("ignores accents on both sides", () => {
    expect(stickerMatchesQuery(sticker({}), "coracao", "pt")).toBe(true);
    const accentedQuery = normalizeStickerSearchText("CORAÇÃO");
    expect(stickerMatchesQuery(sticker({}), accentedQuery, "pt")).toBe(true);
  });

  it("falls back to the English name when there is no Portuguese one", () => {
    const englishOnly = sticker({ labelPt: null });
    expect(stickerMatchesQuery(englishOnly, "in love", "pt")).toBe(true);
  });
});

describe("searchStickers", () => {
  const love = sticker({ id: "love" });
  const hug = sticker({
    id: "hug",
    label: "Blip hug",
    labelPt: "Blip abraço",
    keywords: { en: ["hug", "care"], pt: ["abraço", "carinho"] },
  });

  it("returns matches across packs in pack order", () => {
    const packs = [pack("first", [love]), pack("second", [hug])];
    expect(
      searchStickers(packs, "blip", "en").map((match) => match.id),
    ).toEqual(["love", "hug"]);
    expect(
      searchStickers(packs, "abraco", "pt").map((match) => match.id),
    ).toEqual(["hug"]);
  });

  it("lists a sticker once even when two packs carry it", () => {
    const packs = [pack("first", [hug]), pack("second", [hug])];
    expect(searchStickers(packs, "hug", "en")).toHaveLength(1);
  });

  it("returns nothing for an empty or blank query", () => {
    const packs = [pack("first", [love, hug])];
    expect(searchStickers(packs, "", "en")).toEqual([]);
    expect(searchStickers(packs, "   ", "en")).toEqual([]);
  });

  it("returns nothing when no sticker matches", () => {
    expect(searchStickers([pack("first", [love, hug])], "zebra", "en")).toEqual(
      [],
    );
  });
});
