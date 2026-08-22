import { useState } from "react";
import type {
  AccentKey,
  AvailabilityKey,
  LinkVisibility,
  UpdateSubprofileDTO,
  Visibility,
} from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { HandleAvailability } from "../settings/api/useHandleAvailability";
import type { MetaSnapshot } from "./subprofileEditorDiff";
import type { CropRect } from "../../shared/components/ui/cropGeometry";

export interface SubprofileMetaEditor {
  displayName: string;
  setDisplayName: (value: string) => void;
  tagline: string;
  setTagline: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  avatarUrl: string;
  setAvatarUrl: (value: string) => void;
  /**
   * Local `blob:` URL for a freshly picked avatar/cover, or `null`. `avatarUrl`/
   * `coverUrl` hold the storage KEY once picked, which isn't fetchable, so these
   * let the docked live preview render the pick instantly. Display-only — never
   * part of `dirty` or the save payload.
   */
  avatarPreview: string | null;
  setAvatarPreview: (value: string | null) => void;
  /** Saved reframe crop for the CURRENTLY COMMITTED `subprofile.avatarUrl` —
   *  display-only, mirrors `avatarUrl` without a save-payload role (crop is
   *  persisted separately, keyed by the upload). `ImageUploadField` itself
   *  handles overlaying a FRESH pick's own crop internally, so there's no
   *  separate "preview crop" to thread through here. */
  avatarCrop: CropRect | undefined;
  link: LinkVisibility;
  setLink: (value: LinkVisibility) => void;
  visibility: Visibility;
  setVisibility: (value: Visibility) => void;
  slug: string;
  setSlug: (value: string) => void;
  handle: string;
  setHandle: (value: string) => void;
  handleStatus: HandleAvailability;
  setHandleStatus: (status: HandleAvailability) => void;
  coverUrl: string;
  setCoverUrl: (value: string) => void;
  coverPreview: string | null;
  setCoverPreview: (value: string | null) => void;
  coverBleed: boolean;
  setCoverBleed: (value: boolean) => void;
  accent: AccentKey | "";
  setAccent: (value: AccentKey) => void;
  availability: AvailabilityKey | "";
  setAvailability: (value: AvailabilityKey | "") => void;
  ctaLabel: string;
  setCtaLabel: (value: string) => void;
  ctaUrl: string;
  setCtaUrl: (value: string) => void;
  nameMissing: boolean;
  handleBlocked: boolean;
  /** True when the CTA label and URL are out of sync (one set, one blank). */
  ctaMismatch: boolean;
  dirty: boolean;
  /**
   * Builds the exact partial PATCH the old in-hook `save()` sent — every
   * always-present field plus the conditionally-included ones (avatar/cover/
   * slug/handle/coverBleed, only when actually changed). Pure: no mutation,
   * no toast. Returns `null` when nothing is dirty.
   */
  buildMetaPatch: () => UpdateSubprofileDTO | null;
  /** Current field values, mapped to the comparable `MetaSnapshot` shape. */
  metaSnapshot: () => MetaSnapshot;
  /** The loaded `subprofile`'s values, mapped to the same shape. */
  baselineSnapshot: () => MetaSnapshot;
  /** Reset every field back to the editor's baseline (last-saved) — powers the
   *  global editor's "Discard all". Clears the transient blob previews too. */
  reset: () => void;
  /**
   * Advance the baseline after a successful save, so `dirty` clears without
   * depending on a refetch (demo-safe). Takes the snapshot captured at
   * `buildMetaPatch()` time (via `metaSnapshot()`) rather than re-reading live
   * field state: if the user keeps typing while the PATCH is in flight, marking
   * the LIVE values saved would advance the baseline past keystrokes that were
   * never sent, silently swallowing them. Marking the SENT snapshot keeps those
   * later edits `dirty` and re-sendable.
   */
  markSaved: (snapshot: MetaSnapshot) => void;
}

/** The persisted persona, mapped to the comparable flat meta shape. */
function metaSnapshotOf(subprofile: SubprofileView): MetaSnapshot {
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
function sameMetaSnapshot(a: MetaSnapshot, b: MetaSnapshot): boolean {
  return (Object.keys(a) as (keyof MetaSnapshot)[]).every(
    (key) => a[key] === b[key],
  );
}

/**
 * The subprofile's meta editor state: identity (avatar/name/tagline/bio),
 * presence (cover/accent/availability/CTA), and link/visibility (linked vs.
 * standalone, who can see it) — everything the design's three "This side"
 * rail panes (Identity/Presence/Address) jointly edit. Lifted out of the old
 * `SubprofileMetaForm` orchestrator so `EditorPaneRouter` can call this ONE
 * hook and hand its fields to three separately-routed panes while preserving
 * the exact same behaviour that component had: a single `dirty` diff against
 * the loaded `subprofile`. Saving (the mutation, toast, and unsaved-changes
 * guard) is owned by the global editor provider, which reads `dirty`,
 * `buildMetaPatch()`, and the two snapshot getters from this hook instead of
 * calling a save function directly — switching rail panes never fragments
 * this into three saves, and one save button covers every pane.
 */
export function useSubprofileMetaEditor(
  subprofile: SubprofileView,
): SubprofileMetaEditor {
  const [displayName, setDisplayName] = useState(subprofile.displayName);
  const [tagline, setTagline] = useState(subprofile.tagline);
  const [bio, setBio] = useState(subprofile.bio);
  const [avatarUrl, setAvatarUrl] = useState(subprofile.avatarUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [link, setLink] = useState<LinkVisibility>(subprofile.linkVisibility);
  const [visibility, setVisibility] = useState<Visibility>(
    subprofile.visibility,
  );
  const [slug, setSlug] = useState(subprofile.slug);
  const [handle, setHandle] = useState(subprofile.handle ?? "");
  const [handleStatus, setHandleStatus] = useState<HandleAvailability>({
    status: "idle",
    reason: null,
  });
  const [coverUrl, setCoverUrl] = useState(subprofile.coverUrl ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverBleed, setCoverBleed] = useState<boolean>(
    subprofile.skinData?.coverBleed ?? false,
  );
  const [accent, setAccent] = useState<AccentKey | "">(
    subprofile.accent ?? "",
  );
  const [availability, setAvailability] = useState<AvailabilityKey | "">(
    subprofile.availability ?? "",
  );
  const [ctaLabel, setCtaLabel] = useState(subprofile.ctaLabel);
  const [ctaUrl, setCtaUrl] = useState(subprofile.ctaUrl);

  // What the SERVER currently holds, in the same comparable shape.
  const serverMeta = metaSnapshotOf(subprofile);

  // The editor's OWN baseline — what "saved" currently means. Seeded from the
  // loaded persona and advanced by `markSaved()` after a successful save. This
  // is why `dirty` must NOT depend on the post-save refetch: in demo mode the
  // refetch reverts to the unedited mock, and in live mode it returns the
  // backend-RESOLVED image URL (not the storage key we sent) and trimmed text —
  // so comparing local state to the refetched prop would leave the editor stuck
  // dirty after a successful save. The list editors advance their own baseline
  // the same way in `SubprofileEditorProvider`.
  const [baseline, setBaseline] = useState<MetaSnapshot>(() =>
    metaSnapshotOf(subprofile),
  );

  // ── Server resync ───────────────────────────────────────────────────────
  // Every field above is seeded ONCE, and the shell only remounts on a
  // different persona — so a refetch that changes a value server-side used to
  // go unnoticed. Unpublish is the sharp case: it NULLs an unlinked persona's
  // handle, while local `handle` and `baseline.handle` kept the old value, so
  // `handleChanged` computed false, the handle was never re-sent, and `dirty`
  // stayed false with Save disabled. The address silently stopped saving and
  // Publish then failed a "handle" completeness check against a null row.
  //
  // So: when the server value for a field changes and the member has NOT
  // edited that field locally (local === baseline), adopt the new value into
  // both the field and the baseline. A locally-edited field keeps the edit and
  // stays dirty, so their work is never overwritten by a background refetch.
  // Snap-during-render (React's "adjust state while rendering"), not an effect,
  // so the fresh values are already in place on this same paint.
  const [appliedServerMeta, setAppliedServerMeta] =
    useState<MetaSnapshot>(serverMeta);
  if (!sameMetaSnapshot(appliedServerMeta, serverMeta)) {
    const local: MetaSnapshot = {
      displayName,
      tagline,
      bio,
      avatarUrl,
      coverUrl,
      slug,
      handle,
      link,
      visibility,
      accent,
      availability,
      ctaLabel,
      ctaUrl,
      coverBleed,
    };
    const adopters: [keyof MetaSnapshot, (server: MetaSnapshot) => void][] = [
      ["displayName", (server) => setDisplayName(server.displayName)],
      ["tagline", (server) => setTagline(server.tagline)],
      ["bio", (server) => setBio(server.bio)],
      ["avatarUrl", (server) => setAvatarUrl(server.avatarUrl)],
      ["coverUrl", (server) => setCoverUrl(server.coverUrl)],
      ["slug", (server) => setSlug(server.slug)],
      ["handle", (server) => setHandle(server.handle)],
      ["link", (server) => setLink(server.link as LinkVisibility)],
      ["visibility", (server) => setVisibility(server.visibility as Visibility)],
      ["accent", (server) => setAccent(server.accent as AccentKey)],
      [
        "availability",
        (server) => setAvailability(server.availability as AvailabilityKey | ""),
      ],
      ["ctaLabel", (server) => setCtaLabel(server.ctaLabel)],
      ["ctaUrl", (server) => setCtaUrl(server.ctaUrl)],
      ["coverBleed", (server) => setCoverBleed(server.coverBleed)],
    ];
    const nextBaseline: MetaSnapshot = { ...baseline };
    for (const [key, adopt] of adopters) {
      if (serverMeta[key] === appliedServerMeta[key]) continue;
      if (local[key] !== baseline[key]) continue;
      adopt(serverMeta);
      // `MetaSnapshot` has no index signature, so the write goes through
      // `unknown` rather than asserting a shape the type does not have.
      (nextBaseline as unknown as Record<string, string | boolean>)[key] =
        serverMeta[key];
    }
    setAppliedServerMeta(serverMeta);
    setBaseline(nextBaseline);
  }

  const nameMissing = displayName.trim().length === 0;
  // A standalone (unlinked) handle shares the global namespace — don't let a
  // known-taken/invalid one be saved; publish would reject it anyway.
  const handleBlocked =
    link === "unlinked" && handleStatus.status === "unavailable";
  // The CTA label and URL only make sense as a pair — a label with nowhere to
  // go, or a bare link with no call to action, is worse than neither.
  const ctaMismatch = Boolean(ctaLabel.trim()) !== Boolean(ctaUrl.trim());

  // Any local field diverged from the editor's baseline (last-saved state)?
  // Advancing `baseline` on save settles this back to false without depending
  // on a refetch (see the `baseline` comment above).
  const dirty =
    displayName !== baseline.displayName ||
    tagline !== baseline.tagline ||
    bio !== baseline.bio ||
    avatarUrl !== baseline.avatarUrl ||
    link !== baseline.link ||
    visibility !== baseline.visibility ||
    slug !== baseline.slug ||
    handle !== baseline.handle ||
    coverUrl !== baseline.coverUrl ||
    accent !== baseline.accent ||
    availability !== baseline.availability ||
    ctaLabel !== baseline.ctaLabel ||
    ctaUrl !== baseline.ctaUrl ||
    coverBleed !== baseline.coverBleed;

  /**
   * Builds the same partial PATCH the old in-hook `save()` sent, from the
   * current field state. Pure — no mutation, no toast, no navigation guard;
   * the provider owns those and calls this only once it has decided a save
   * should happen. Returns `null` when nothing is dirty (nothing to send).
   */
  function buildMetaPatch(): UpdateSubprofileDTO | null {
    if (!dirty) return null;
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
    const avatarChanged = avatarUrl !== baseline.avatarUrl;
    const coverChanged = coverUrl !== baseline.coverUrl;
    // slug (the address) and handle live on the Address pane, not Identity. Only
    // send them when the user actually changed them: an Identity-only edit must
    // never touch the address/handle. Critically this stops a nested persona
    // (whose handle is null → local state "") from PATCHing handle: "" on every
    // save — the empty string is NOT null, so it lands in the partial-unique
    // handle index and two of an owner's personas collide on the global handle
    // namespace. A cleared handle is sent as null (never ""), so it stays exempt.
    const slugChanged = slug !== baseline.slug;
    const handleChanged = handle !== baseline.handle;
    // Only PATCH skinData when the bleed flag actually changed, and merge onto
    // the loaded skinData so we never clobber skin-extras panels' fields.
    const coverBleedChanged = coverBleed !== baseline.coverBleed;
    return {
      displayName: displayName.trim(),
      tagline: tagline.trim() || null,
      bio: bio.trim() || null,
      ...(avatarChanged ? { avatarUrl: avatarUrl || null } : {}),
      ...(coverChanged ? { coverUrl: coverUrl || null } : {}),
      accent: accent || null,
      availability: availability || null,
      ctaLabel: ctaLabel.trim() || null,
      ctaUrl: ctaUrl.trim() || null,
      linkVisibility: link,
      visibility,
      ...(slugChanged ? { slug: slug.trim() } : {}),
      ...(handleChanged ? { handle: handle.trim() || null } : {}),
      ...(coverBleedChanged
        ? { skinData: { ...(subprofile.skinData ?? {}), coverBleed } }
        : {}),
    };
  }

  function metaSnapshot(): MetaSnapshot {
    return {
      displayName,
      tagline,
      bio,
      avatarUrl,
      coverUrl,
      slug,
      handle,
      link,
      visibility,
      accent,
      availability,
      ctaLabel,
      ctaUrl,
      coverBleed,
    };
  }

  function baselineSnapshot(): MetaSnapshot {
    return baseline;
  }

  // Restore every field to the editor's baseline (last-saved state), and drop
  // the transient blob previews so the docked preview snaps back. Powers
  // "Discard all" — after saves, this returns to the saved values, not the
  // original mount values.
  function reset(): void {
    setDisplayName(baseline.displayName);
    setTagline(baseline.tagline);
    setBio(baseline.bio);
    setAvatarUrl(baseline.avatarUrl);
    setAvatarPreview(null);
    setLink(baseline.link as LinkVisibility);
    setVisibility(baseline.visibility as Visibility);
    setSlug(baseline.slug);
    setHandle(baseline.handle);
    setHandleStatus({ status: "idle", reason: null });
    setCoverUrl(baseline.coverUrl);
    setCoverPreview(null);
    setCoverBleed(baseline.coverBleed);
    setAccent(baseline.accent as AccentKey);
    setAvailability(baseline.availability as AvailabilityKey | "");
    setCtaLabel(baseline.ctaLabel);
    setCtaUrl(baseline.ctaUrl);
  }

  // Advance the baseline to the snapshot that was actually PATCHed (captured at
  // build time, passed in here), so `dirty` clears without waiting on (or being
  // contradicted by) a refetch — while any keystrokes made during the in-flight
  // save stay `dirty` rather than being folded into the baseline and lost.
  // Called by the provider's meta save task on success — the exact analogue of
  // the list editors advancing their row baselines to the rows they sent.
  function markSaved(snapshot: MetaSnapshot): void {
    setBaseline(snapshot);
  }

  return {
    displayName,
    setDisplayName,
    tagline,
    setTagline,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    avatarPreview,
    setAvatarPreview,
    avatarCrop: subprofile.avatarCrop,
    link,
    setLink,
    visibility,
    setVisibility,
    slug,
    setSlug,
    handle,
    setHandle,
    handleStatus,
    setHandleStatus,
    coverUrl,
    setCoverUrl,
    coverPreview,
    setCoverPreview,
    coverBleed,
    setCoverBleed,
    accent,
    setAccent,
    availability,
    setAvailability,
    ctaLabel,
    setCtaLabel,
    ctaUrl,
    setCtaUrl,
    nameMissing,
    handleBlocked,
    ctaMismatch,
    dirty,
    buildMetaPatch,
    metaSnapshot,
    baselineSnapshot,
    reset,
    markSaved,
  };
}
