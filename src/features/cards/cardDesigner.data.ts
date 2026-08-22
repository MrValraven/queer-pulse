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

/**
 * Skin/accent pairs where the accent bar would land on its own colour and
 * disappear. The accent no longer carries any text contrast (see the comment
 * in `MembershipCardFace.module.css`), so this is purely about the bar still
 * being visible — the designer warns rather than blocking, since a community
 * may genuinely want the quietest possible card.
 */
const INVISIBLE_ACCENT_PAIRS: ReadonlyArray<`${CardSkin}:${string}`> = [
  "plum:plum",
  "jade:jade",
  "ink:ink",
  "coral:accent",
];

export function isAccentInvisibleOnSkin(
  skin: CardSkin,
  accentToken: string,
): boolean {
  return INVISIBLE_ACCENT_PAIRS.includes(`${skin}:${accentToken}`);
}

/**
 * The date a card issued today would stop working, or `null` for a programme
 * whose cards never expire. "One year" tells an owner nothing about the
 * consequence; a date does.
 */
export function expiryPreviewDate(
  validityMonths: number | null,
  issuedAt: Date,
): Date | null {
  if (validityMonths === null) return null;
  const expiry = new Date(issuedAt.getTime());
  expiry.setUTCMonth(expiry.getUTCMonth() + validityMonths);
  return expiry;
}

/** The serial a first card would carry, given the programme's prefix. Real
 *  serials are minted server-side; this only has to look like one. */
export function previewSerial(serialPrefix: string | undefined): string {
  return `${serialPrefix || "ABC"}-00042`;
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
  extras: {
    /** Who the preview card is made out to. The viewing owner/mod by default,
     *  so the preview reads as a real card rather than a form artefact. */
    holderName?: string;
    crestUrl?: string | null;
    backgroundPreset?: string | null;
    backgroundUrl?: string | null;
    validityMonths?: number | null;
    serialPrefix?: string;
    /** Whether the programme being designed puts photos on its cards. */
    allowsMemberPhoto?: boolean;
    /** The face to draw when it does. The designer passes the viewing
     *  owner's own avatar, so the preview is a real card rather than a
     *  grey box. */
    holderAvatarUrl?: string | null;
  } = {},
): MyCardDTO {
  const issuedAt = new Date();
  const expiresAt = expiryPreviewDate(
    extras.validityMonths ?? null,
    issuedAt,
  );
  return {
    id: "preview",
    serial: previewSerial(extras.serialPrefix),
    status: "active",
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    communityName,
    communitySlug: "preview",
    role: "member",
    holderName: extras.holderName?.trim() || "Preview",
    holderAvatarUrl: extras.allowsMemberPhoto
      ? (extras.holderAvatarUrl ?? null)
      : null,
    isPhotoHidden: false,
    program: {
      isEnabled: true,
      skin,
      accentToken,
      crestUrl: extras.crestUrl ?? null,
      backgroundPreset: extras.backgroundPreset ?? null,
      backgroundUrl: extras.backgroundUrl ?? null,
      cardName,
      validityMonths: extras.validityMonths ?? null,
      allowsPrint: false,
      allowsWallet: false,
      allowsPublicBadge: true,
      allowsMemberPhoto: extras.allowsMemberPhoto ?? false,
      serialPrefix: extras.serialPrefix ?? "ABC",
    },
  };
}
