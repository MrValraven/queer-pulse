/**
 * "Who runs it": the owner-identity tags a listing can carry, in canonical
 * order. Mirrors `LISTING_OWNER_IDENTITY_SLUGS` in the backend's
 * `listings/listing-owner-identities.ts`, which rejects any other value.
 *
 * Self-declared and optional. The tags describe the business and name nobody,
 * so they show on the public card and page whatever the owner's visibility.
 */
export const OWNER_IDENTITY_SLUGS = [
  "women",
  "trans",
  "non-binary",
  "bipoc",
] as const;

export type OwnerIdentitySlug = (typeof OWNER_IDENTITY_SLUGS)[number];

const LABEL_KEY_PREFIX = "marketing:listBusiness.ownerIdentity";

/** Each tag with its catalog label, in canonical order. */
export const OWNER_IDENTITIES: ReadonlyArray<{
  slug: OwnerIdentitySlug;
  labelKey: string;
}> = [
  { slug: "women", labelKey: `${LABEL_KEY_PREFIX}.women` },
  { slug: "trans", labelKey: `${LABEL_KEY_PREFIX}.trans` },
  { slug: "non-binary", labelKey: `${LABEL_KEY_PREFIX}.nonBinary` },
  { slug: "bipoc", labelKey: `${LABEL_KEY_PREFIX}.bipoc` },
];

const LABEL_KEY_BY_SLUG = Object.fromEntries(
  OWNER_IDENTITIES.map((identity) => [identity.slug, identity.labelKey]),
) as Record<OwnerIdentitySlug, string>;

export function ownerIdentityLabelKey(slug: OwnerIdentitySlug): string {
  return LABEL_KEY_BY_SLUG[slug];
}

/**
 * Any stored or received value, read as the tags it names: non-arrays and
 * unknown entries drop out, repeats collapse, and the order is canonical, so
 * two equivalent lists compare and cache as one.
 */
export function normalizeOwnerIdentities(raw: unknown): OwnerIdentitySlug[] {
  if (!Array.isArray(raw)) return [];
  const wanted = new Set(
    raw.filter((entry): entry is string => typeof entry === "string"),
  );
  return OWNER_IDENTITY_SLUGS.filter((slug) => wanted.has(slug));
}
