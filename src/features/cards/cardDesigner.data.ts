import type { CardSkin, MyCardDTO } from "./api/cards.api";

export interface CardSkinOption {
  value: CardSkin;
  /** Catalog key: `cards:skin.<value>`. */
  labelKey: string;
}

export const CARD_SKIN_OPTIONS: CardSkinOption[] = [
  { value: "plum", labelKey: "cards:skin.plum" },
  { value: "cream", labelKey: "cards:skin.cream" },
  { value: "jade", labelKey: "cards:skin.jade" },
  { value: "coral", labelKey: "cards:skin.coral" },
  { value: "ink", labelKey: "cards:skin.ink" },
];

export interface CardAccentOption {
  value: string;
  /** Catalog key: `cards:accent.<value>`. */
  labelKey: string;
}

/** Design token NAMES only, a closed set. A community may never supply a raw
 *  hex here: that would break theming and could fail the contrast each skin
 *  guarantees. The backend DTO enforces the same closed set with `@IsIn`. */
export const ACCENT_OPTIONS: CardAccentOption[] = [
  { value: "accent", labelKey: "cards:accent.accent" },
  { value: "plum", labelKey: "cards:accent.plum" },
  { value: "jade", labelKey: "cards:accent.jade" },
  { value: "ink", labelKey: "cards:accent.ink" },
];

export interface CardValidityOption {
  value: number | null;
  /** Catalog key: `cards:validity.<never|oneYear|twoYears>`. */
  labelKey: string;
}

export const VALIDITY_OPTIONS: CardValidityOption[] = [
  { value: null, labelKey: "cards:validity.never" },
  { value: 12, labelKey: "cards:validity.oneYear" },
  { value: 24, labelKey: "cards:validity.twoYears" },
];

/** `null` (never expires) round-trips through `Select`'s string-only value as
 *  the sentinel `"never"` — the DTO itself keeps the real `number | null`. */
export function validityToSelectValue(months: number | null): string {
  return months === null ? "never" : String(months);
}

export function selectValueToValidity(value: string | null): number | null {
  if (!value || value === "never") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** A stand-in card: the designer's own live preview of the owner's in-progress
 *  choices, and (via `ModToolsCardSection`) a preview of the community's
 *  current live design. Kept here (data-shaping, not a component) rather than
 *  in `CardDesignerModal.tsx`, which fast-refresh's lint rule wants to only
 *  export components. */
export function previewCard(
  communityName: string,
  cardName: string,
  skin: CardSkin,
  accentToken: string,
): MyCardDTO {
  return {
    id: "preview",
    serial: "ABC-00000",
    status: "active",
    issuedAt: new Date().toISOString(),
    expiresAt: null,
    communityName,
    communitySlug: "preview",
    role: "member",
    holderName: "Preview",
    program: {
      isEnabled: true,
      skin,
      accentToken,
      crestUrl: null,
      cardName,
      validityMonths: null,
      allowsPrint: false,
      allowsWallet: false,
      allowsPublicBadge: true,
      serialPrefix: "ABC",
    },
  };
}
