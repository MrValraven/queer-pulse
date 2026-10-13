import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import {
  COVER_POLICY_LABEL_KEYS,
  ENTRY_MODE_LABEL_KEYS,
  coverPolicyLabel,
  entryModeLabel,
  hasCoverCategory,
  INCLUSION_PRACTICE_HELP_KEYS,
  INCLUSION_PRACTICE_LABEL_KEYS,
  LANGUAGE_LABEL_KEYS,
  LISTING_COVER_POLICIES,
  LISTING_ENTRY_MODES,
  LISTING_INCLUSION_PRACTICES,
  LISTING_LANGUAGE_CODES,
  LISTING_PAYMENT_METHODS,
  languageLabel,
  normalizeCoverFreeBefore,
  normalizeCoverPolicy,
  normalizeEntryMode,
  normalizeInclusionPractices,
  normalizeLanguageCodes,
  normalizePaymentMethods,
  offeredInclusionPractices,
  PAYMENT_METHOD_LABEL_KEYS,
  paymentsSummary,
  toggleInOrder,
} from "./listingFacts.data";

const t: TFunction = (key, options) =>
  options?.time === undefined ? key : `${key}|${String(options.time)}`;

describe("vocabularies", () => {
  it("mirrors the contract's lists in order", () => {
    expect(LISTING_ENTRY_MODES).toEqual([
      "walkIn",
      "bookingRecommended",
      "appointmentOnly",
      "membersOnly",
    ]);
    expect(LISTING_COVER_POLICIES).toEqual([
      "free",
      "freeBefore",
      "cover",
      "ticketed",
    ]);
    expect(LISTING_PAYMENT_METHODS).toEqual([
      "card",
      "mbway",
      "multibanco",
      "cash",
    ]);
    expect(LISTING_LANGUAGE_CODES).toHaveLength(17);
  });

  it("gives every value a label key", () => {
    expect(Object.keys(ENTRY_MODE_LABEL_KEYS)).toEqual([
      ...LISTING_ENTRY_MODES,
    ]);
    expect(Object.keys(COVER_POLICY_LABEL_KEYS)).toEqual([
      ...LISTING_COVER_POLICIES,
    ]);
    expect(Object.keys(PAYMENT_METHOD_LABEL_KEYS)).toEqual([
      ...LISTING_PAYMENT_METHODS,
    ]);
    expect(Object.keys(INCLUSION_PRACTICE_LABEL_KEYS)).toEqual([
      ...LISTING_INCLUSION_PRACTICES,
    ]);
    expect(Object.keys(INCLUSION_PRACTICE_HELP_KEYS)).toEqual([
      ...LISTING_INCLUSION_PRACTICES,
    ]);
    expect(Object.keys(LANGUAGE_LABEL_KEYS)).toEqual([
      ...LISTING_LANGUAGE_CODES,
    ]);
  });
});

describe("normalisers", () => {
  it("keeps known values once each, in canonical order", () => {
    expect(
      normalizePaymentMethods(["cash", "card", "cash", "paypal", 3]),
    ).toEqual(["card", "cash"]);
    expect(normalizeLanguageCodes(["en", "Português", "pt", "pt-BR"])).toEqual([
      "pt",
      "pt-BR",
      "en",
    ]);
    expect(
      normalizeInclusionPractices(["harm-reduction", "chosen-name", "bogus"]),
    ).toEqual(["chosen-name", "harm-reduction"]);
    expect(normalizePaymentMethods("card")).toEqual([]);
  });

  it("reads one entry mode or cover policy, and null for anything else", () => {
    expect(normalizeEntryMode("walkIn")).toBe("walkIn");
    expect(normalizeEntryMode("Walk-ins welcome")).toBeNull();
    expect(normalizeEntryMode(undefined)).toBeNull();
    expect(normalizeCoverPolicy("freeBefore")).toBe("freeBefore");
    expect(normalizeCoverPolicy(null)).toBeNull();
  });

  it("keeps a free-before time only in HH:MM", () => {
    expect(normalizeCoverFreeBefore("23:30")).toBe("23:30");
    expect(normalizeCoverFreeBefore("24:00")).toBe("");
    expect(normalizeCoverFreeBefore("9:00")).toBe("");
    expect(normalizeCoverFreeBefore(null)).toBe("");
  });

  it("toggles a value in and out, keeping the given order", () => {
    expect(toggleInOrder(["cash"], "card", LISTING_PAYMENT_METHODS)).toEqual([
      "card",
      "cash",
    ]);
    expect(
      toggleInOrder(["card", "cash"], "card", LISTING_PAYMENT_METHODS),
    ).toEqual(["cash"]);
  });
});

describe("scopes", () => {
  it("asks about cover only with nightlife or culture", () => {
    expect(hasCoverCategory(["food", "nightlife"])).toBe(true);
    expect(hasCoverCategory(["culture"])).toBe(true);
    expect(hasCoverCategory(["food"])).toBe(false);
  });

  it("offers each practice to its own kinds and categories", () => {
    expect(offeredInclusionPractices("online", ["therapy"])).toEqual([
      "chosen-name",
      "safer-space-policy",
    ]);
    expect(offeredInclusionPractices("place", ["food"])).toEqual([
      "chosen-name",
      "safer-space-policy",
      "named-contact",
    ]);
    expect(offeredInclusionPractices("mobile", ["nightlife"])).toEqual([
      "chosen-name",
      "safer-space-policy",
      "named-contact",
      "harm-reduction",
    ]);
  });
});

describe("labels", () => {
  it("says Just turn up for an out-and-about walk-in", () => {
    expect(entryModeLabel(t, "walkIn", "place")).toBe(
      "marketing:listingFacts.entry.walkIn",
    );
    expect(entryModeLabel(t, "walkIn", "mobile")).toBe(
      "marketing:listingFacts.entry.walkInMobile",
    );
  });

  it("puts the time into Free before", () => {
    expect(coverPolicyLabel(t, "freeBefore", "23:00")).toBe(
      "marketing:listingFacts.cover.freeBefore|23:00",
    );
    expect(coverPolicyLabel(t, "ticketed", "")).toBe(
      "marketing:listingFacts.cover.ticketed",
    );
  });

  it("reads cash alone as Cash only", () => {
    expect(paymentsSummary(t, ["cash"])).toBe(
      "marketing:listingFacts.payment.cashOnly",
    );
    expect(paymentsSummary(t, ["card", "cash"])).toBe(
      "marketing:listingFacts.payment.card · marketing:listingFacts.payment.cash",
    );
    expect(paymentsSummary(t, [])).toBe("");
  });

  it("falls back to the raw code for a language this build does not know", () => {
    expect(languageLabel(t, "pt-BR")).toBe(
      "marketing:listingFacts.language.ptBR",
    );
    expect(languageLabel(t, "eu")).toBe("eu");
  });
});
