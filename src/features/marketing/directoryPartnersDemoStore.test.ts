import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  directoryPartnerRefusalOf,
  type DirectoryPartnerRefusalReason,
} from "./api/directoryPartners.api";
import { ADULT_ONLINE_DIRECTORY_PLACES } from "./directoryOnlinePlaces.data";
import {
  demoAddDirectoryPartner,
  demoAdminDirectoryPartners,
  demoPublicDirectoryPartners,
  demoRemoveDirectoryPartner,
  demoReorderDirectoryPartners,
  demoSearchDirectoryPartnerCandidates,
  demoUpdateDirectoryPartnerNote,
  resetDemoDirectoryPartners,
} from "./directoryPartnersDemoStore";
import type { DemoDirectoryPartnerSeed } from "./directoryPartnersDemoSeed.data";

const TWELVE_PICK_SLUGS = [
  "atelier-pulso",
  "queer-supper-club",
  "estudio-beatriz-pinto",
  "mare-lilas",
  "livraria-bertha",
  "cafe-mouraria-velha",
  "bairro-alto-studio",
  "espaco-intendente",
  "a-farinha",
  "studio-andre-quintela",
  "clinica-da-estrela",
  "galeria-lume",
];

const TWELVE_PICK_SEED: DemoDirectoryPartnerSeed[] = TWELVE_PICK_SLUGS.map(
  (slug) => ({ slug, note: null, publicState: "showing" }),
);

/** One code point, two UTF-16 units. Built from its number because the
 *  repo's emoji lint reads the escaped literal as a glyph. */
const RAINBOW = String.fromCodePoint(0x1f308);

/** The item at `index`, failing the test when the list is too short. */
function itemAt<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`Expected an item at index ${index} of ${items.length}`);
  }
  return item;
}

function refusalFrom(run: () => unknown): ApiError {
  try {
    run();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("Expected the store to refuse the write");
}

/** Every refusal carries the backend's full body, `error` and `reason` included. */
function expectRefusal(
  run: () => unknown,
  reason: DirectoryPartnerRefusalReason,
  status: number,
): void {
  const refusal = refusalFrom(run);
  expect(refusal.status).toBe(status);
  expect(refusal.data).toMatchObject({ statusCode: status, reason });
  expect(refusal.data).toHaveProperty("error");
  expect(refusal.data).toHaveProperty("reason");
  expect(directoryPartnerRefusalOf(refusal)).toBe(reason);
}

beforeEach(() => resetDemoDirectoryPartners());

describe("directory partners demo store reads", () => {
  it("lists the seeded partners in order with positions from 1", () => {
    const partners = demoAdminDirectoryPartners();
    expect(partners.map((partner) => partner.slug)).toEqual([
      "livraria-bertha",
      "queer-supper-club",
      "fio-solto",
      "noite-aberta",
    ]);
    expect(partners.map((partner) => partner.position)).toEqual([1, 2, 3, 4]);
    expect(itemAt(partners, 3).publicState).toBe("closed_for_good");
  });

  it("keys a demo pick on the place slug", () => {
    expect(demoAdminDirectoryPartners()[0]).toMatchObject({
      id: "demo-partner-livraria-bertha",
      listingId: "livraria-bertha",
      listingRef: "livraria-bertha",
      note: "Members get 10% off",
    });
  });

  it("leaves a partner that is not showing out of the public row", () => {
    expect(
      demoPublicDirectoryPartners().map(({ place }) => place.slug),
    ).toEqual(["livraria-bertha", "queer-supper-club", "fio-solto"]);
    expect(itemAt(demoPublicDirectoryPartners(), 0).note).toBe(
      "Members get 10% off",
    );
  });
});

describe("adding a directory partner in demo", () => {
  it("appends an added partner with a trimmed note", () => {
    const partners = demoAddDirectoryPartner({
      listingId: "navalha",
      note: "  Hosts our monthly quiz  ",
    });
    expect(partners.at(-1)).toMatchObject({
      slug: "navalha",
      position: 5,
      note: "Hosts our monthly quiz",
      publicState: "showing",
    });
  });

  it("stores a whitespace-only note as null", () => {
    expect(
      demoAddDirectoryPartner({ listingId: "navalha", note: "   " }).at(-1)
        ?.note,
    ).toBeNull();
  });

  it("accepts a 140 character note and refuses 141 with note_too_long", () => {
    expect(
      demoAddDirectoryPartner({
        listingId: "navalha",
        note: "a".repeat(140),
      }).at(-1)?.note,
    ).toHaveLength(140);
    expectRefusal(
      () =>
        demoAddDirectoryPartner({
          listingId: "galeria-lume",
          note: "a".repeat(141),
        }),
      "note_too_long",
      400,
    );
  });

  it("counts the note in code points", () => {
    const acceptedNote = demoAddDirectoryPartner({
      listingId: "navalha",
      note: RAINBOW.repeat(140),
    }).at(-1)?.note;
    expect(Array.from(acceptedNote ?? "")).toHaveLength(140);
    expectRefusal(
      () =>
        demoAddDirectoryPartner({
          listingId: "galeria-lume",
          note: RAINBOW.repeat(141),
        }),
      "note_too_long",
      400,
    );
  });

  it("checks the note before anything else", () => {
    expectRefusal(
      () =>
        demoAddDirectoryPartner({
          listingId: "no-such-place",
          note: "a".repeat(141),
        }),
      "note_too_long",
      400,
    );
  });

  it("refuses an unknown listing with listing_not_found", () => {
    expectRefusal(
      () => demoAddDirectoryPartner({ listingId: "no-such-place" }),
      "listing_not_found",
      404,
    );
  });

  it("refuses an 18+ listing with listing_adult_only", () => {
    expectRefusal(
      () =>
        demoAddDirectoryPartner({
          listingId: itemAt(ADULT_ONLINE_DIRECTORY_PLACES, 0).slug,
        }),
      "listing_adult_only",
      409,
    );
  });

  it("refuses a listing that is not showing with listing_not_live", () => {
    resetDemoDirectoryPartners([]);
    expectRefusal(
      () => demoAddDirectoryPartner({ listingId: "noite-aberta" }),
      "listing_not_live",
      409,
    );
  });

  it("refuses a listing already picked with already_partner", () => {
    expectRefusal(
      () => demoAddDirectoryPartner({ listingId: "livraria-bertha" }),
      "already_partner",
      409,
    );
  });

  it("reports already_partner before the limit", () => {
    resetDemoDirectoryPartners(TWELVE_PICK_SEED);
    expectRefusal(
      () => demoAddDirectoryPartner({ listingId: "livraria-bertha" }),
      "already_partner",
      409,
    );
  });

  it("refuses a thirteenth partner with partner_limit_reached", () => {
    resetDemoDirectoryPartners(TWELVE_PICK_SEED);
    expectRefusal(
      () => demoAddDirectoryPartner({ listingId: "navalha" }),
      "partner_limit_reached",
      409,
    );
  });
});

describe("editing, reordering and removing demo partners", () => {
  it("updates a note, and a blank note clears it", () => {
    const updated = demoUpdateDirectoryPartnerNote(
      "demo-partner-fio-solto",
      "  Ships zines across Europe ",
    );
    expect(itemAt(updated, 2).note).toBe("Ships zines across Europe");
    const cleared = demoUpdateDirectoryPartnerNote(
      "demo-partner-fio-solto",
      "  ",
    );
    expect(itemAt(cleared, 2).note).toBeNull();
  });

  it("refuses a note edit for an unknown pick with partner_not_found", () => {
    expectRefusal(
      () => demoUpdateDirectoryPartnerNote("demo-partner-no-such-place", "Hi"),
      "partner_not_found",
      404,
    );
  });

  it("reorders the picks to the given ids", () => {
    const reversedIds = demoAdminDirectoryPartners()
      .map((partner) => partner.id)
      .reverse();
    const reordered = demoReorderDirectoryPartners(reversedIds);
    expect(reordered.map((partner) => partner.slug)).toEqual([
      "noite-aberta",
      "fio-solto",
      "queer-supper-club",
      "livraria-bertha",
    ]);
    expect(reordered.map((partner) => partner.position)).toEqual([1, 2, 3, 4]);
  });

  it("refuses an order that misses or repeats an id with order_mismatch", () => {
    const pickIds = demoAdminDirectoryPartners().map((partner) => partner.id);
    expectRefusal(
      () => demoReorderDirectoryPartners(pickIds.slice(1)),
      "order_mismatch",
      409,
    );
    expectRefusal(
      () =>
        demoReorderDirectoryPartners([
          itemAt(pickIds, 0),
          ...pickIds.slice(0, -1),
        ]),
      "order_mismatch",
      409,
    );
  });

  it("closes the gap after a removal", () => {
    const remaining = demoRemoveDirectoryPartner(
      "demo-partner-queer-supper-club",
    );
    expect(remaining.map((partner) => partner.slug)).toEqual([
      "livraria-bertha",
      "fio-solto",
      "noite-aberta",
    ]);
    expect(remaining.map((partner) => partner.position)).toEqual([1, 2, 3]);
  });

  it("refuses removing an unknown pick with partner_not_found", () => {
    expectRefusal(
      () => demoRemoveDirectoryPartner("demo-partner-no-such-place"),
      "partner_not_found",
      404,
    );
  });
});

describe("searching demo partner candidates", () => {
  it("finds a place by its folded name and marks picked ones", () => {
    const salaoHit = demoSearchDirectoryPartnerCandidates("salao").find(
      (result) => result.slug === "salao-mouraria",
    );
    expect(salaoHit).toMatchObject({
      name: "Salão Mouraria",
      isPartner: false,
    });
    const berthaHit = demoSearchDirectoryPartnerCandidates("bertha").find(
      (result) => result.slug === "livraria-bertha",
    );
    expect(berthaHit?.isPartner).toBe(true);
  });

  it("answers nothing for a blank term", () => {
    expect(demoSearchDirectoryPartnerCandidates("")).toEqual([]);
    expect(demoSearchDirectoryPartnerCandidates("   ")).toEqual([]);
  });

  it("skips 18+ places and places that are not showing", () => {
    const adultSlugs = new Set(
      ADULT_ONLINE_DIRECTORY_PLACES.map((place) => place.slug),
    );
    const searchTerms = [
      ...ADULT_ONLINE_DIRECTORY_PLACES.map((place) => place.name),
      "a",
      "e",
    ];
    for (const searchTerm of searchTerms) {
      const resultSlugs = demoSearchDirectoryPartnerCandidates(searchTerm).map(
        (result) => result.slug,
      );
      expect(resultSlugs.filter((slug) => adultSlugs.has(slug))).toEqual([]);
    }
    expect(demoSearchDirectoryPartnerCandidates("noite")).toEqual([]);
  });

  it("ranks name hits first and caps the list at 20", () => {
    const results = demoSearchDirectoryPartnerCandidates("a");
    expect(results.length).toBeLessThanOrEqual(20);
    const mourariaSlugs = demoSearchDirectoryPartnerCandidates("mouraria").map(
      (result) => result.slug,
    );
    expect(mourariaSlugs.slice(0, 2)).toEqual([
      "cafe-mouraria-velha",
      "salao-mouraria",
    ]);
    expect(mourariaSlugs.indexOf("queer-supper-club")).toBeGreaterThan(1);
  });
});
