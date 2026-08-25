import type {
  LinkVisibility,
  SkinData,
  UpdateSubprofileDTO,
  Visibility,
} from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { MetaSnapshot } from "./subprofileEditorDiff";

/** The persisted persona, mapped to the comparable flat meta shape. */
export function metaSnapshotOf(subprofile: SubprofileView): MetaSnapshot {
  return {
    displayName: subprofile.displayName,
    tagline: subprofile.tagline,
    bio: subprofile.bio,
    avatarUrl: subprofile.avatarUrl ?? "",
    coverUrl: subprofile.coverUrl ?? "",
    slug: subprofile.slug,
    handle: subprofile.handle ?? "",
    link: subprofile.linkVisibility,
    visibility: subprofile.visibility,
    accent: subprofile.accent ?? "",
    availability: subprofile.availability ?? "",
    ctaLabel: subprofile.ctaLabel,
    ctaUrl: subprofile.ctaUrl,
    coverBleed: subprofile.skinData?.coverBleed ?? false,
  };
}

/** Field-by-field equality for two meta snapshots (all values are primitives). */
export function sameMetaSnapshot(a: MetaSnapshot, b: MetaSnapshot): boolean {
  return (Object.keys(a) as (keyof MetaSnapshot)[]).every(
    (key) => a[key] === b[key],
  );
}

/**
 * Builds the exact partial PATCH the old in-hook `save()` sent, from a
 * current field snapshot compared against the editor's baseline. Pure: no
 * mutation, no toast. Returns `null` when nothing is dirty (`current` equals
 * `baseline` field-for-field, the same condition the hook's own `dirty` flag
 * checks since it compares the same fields `MetaSnapshot` holds).
 */
export function buildMetaPatchFrom(
  current: MetaSnapshot,
  baseline: MetaSnapshot,
  existingSkinData: SkinData | null,
): UpdateSubprofileDTO | null {
  if (sameMetaSnapshot(current, baseline)) return null;
  // At mount `baseline.avatarUrl`/`coverUrl` are the backend-RESOLVED display
  // URLs (`toImageUrl` turned the stored storage key into `<api>/files/<key>`),
  // not the raw key. Sending an untouched one back would persist that derived
  // URL in place of the clean key — and since a dev API base is `http://…`,
  // the next read fails `toImageUrl`'s `https://`-only check and resolves to
  // `null`, blanking the image. So only send an image field when the user
  // actually changed it: a fresh pick sets it to a new storage key, and a
  // clear sets it to `""` (→ `null`); an untouched field is omitted, leaving
  // the stored key intact under PATCH semantics. After a save, `markSaved`
  // advances the baseline to the sent key so it isn't re-sent next time.
  const avatarChanged = current.avatarUrl !== baseline.avatarUrl;
  const coverChanged = current.coverUrl !== baseline.coverUrl;
  // slug (the address) and handle live on the Address pane, not Identity. Only
  // send them when the user actually changed them: an Identity-only edit must
  // never touch the address/handle. Critically this stops a nested persona
  // (whose handle is null → local state "") from PATCHing handle: "" on every
  // save — the empty string is NOT null, so it lands in the partial-unique
  // handle index and two of an owner's personas collide on the global handle
  // namespace. A cleared handle is sent as null (never ""), so it stays exempt.
  const slugChanged = current.slug !== baseline.slug;
  const handleChanged = current.handle !== baseline.handle;
  // Only PATCH skinData when the bleed flag actually changed, and merge onto
  // the loaded skinData so we never clobber skin-extras panels' fields.
  const coverBleedChanged = current.coverBleed !== baseline.coverBleed;
  return {
    displayName: current.displayName.trim(),
    tagline: current.tagline.trim() || null,
    bio: current.bio.trim() || null,
    ...(avatarChanged ? { avatarUrl: current.avatarUrl || null } : {}),
    ...(coverChanged ? { coverUrl: current.coverUrl || null } : {}),
    accent: current.accent || null,
    availability: current.availability || null,
    ctaLabel: current.ctaLabel.trim() || null,
    ctaUrl: current.ctaUrl.trim() || null,
    linkVisibility: current.link as LinkVisibility,
    visibility: current.visibility as Visibility,
    ...(slugChanged ? { slug: current.slug.trim() } : {}),
    ...(handleChanged ? { handle: current.handle.trim() || null } : {}),
    ...(coverBleedChanged
      ? {
          skinData: {
            ...(existingSkinData ?? {}),
            coverBleed: current.coverBleed,
          },
        }
      : {}),
  };
}

/** Field-by-field diff result used by `useServerMetaResync`: which keys the
 *  server changed (and the member hasn't locally diverged on), plus the
 *  baseline those keys should advance to. */
export interface ServerMetaResyncResult {
  changedKeys: (keyof MetaSnapshot)[];
  nextBaseline: MetaSnapshot;
}

/**
 * Pure decision step for the "adopt server changes the member hasn't
 * touched" resync (see `useServerMetaResync`). A field is adopted only when
 * the server actually moved it (`serverMeta[key] !== appliedServerMeta[key]`)
 * AND the member's local value still matches the old baseline
 * (`local[key] === baseline[key]`) — a locally-edited field keeps the edit.
 */
export function computeServerMetaResync(
  local: MetaSnapshot,
  baseline: MetaSnapshot,
  serverMeta: MetaSnapshot,
  appliedServerMeta: MetaSnapshot,
): ServerMetaResyncResult {
  const changedKeys: (keyof MetaSnapshot)[] = [];
  const nextBaseline: MetaSnapshot = { ...baseline };
  for (const key of Object.keys(serverMeta) as (keyof MetaSnapshot)[]) {
    if (serverMeta[key] === appliedServerMeta[key]) continue;
    if (local[key] !== baseline[key]) continue;
    changedKeys.push(key);
    // `MetaSnapshot` has no index signature, so the write goes through
    // `unknown` rather than asserting a shape the type does not have.
    (nextBaseline as unknown as Record<string, string | boolean>)[key] =
      serverMeta[key];
  }
  return { changedKeys, nextBaseline };
}
