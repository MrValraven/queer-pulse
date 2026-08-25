import { useCallback, useState } from "react";
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
import {
  buildMetaPatchFrom,
  metaSnapshotOf,
  sameMetaSnapshot,
} from "./subprofileMetaEditor.helpers";
import { useServerMetaResync } from "./useServerMetaResync";

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
  setCoverPreview: (value: string | null, crop?: CropRect) => void;
  /** Saved reframe crop for the CURRENTLY COMMITTED `subprofile.coverUrl`, and
   *  the crop of a freshly picked cover that hasn't been saved yet. Pair them
   *  the same way `coverPreview`/`coverUrl` pair: a fresh pick's crop wins
   *  while it's showing. Display-only — the crop is persisted separately,
   *  keyed by the upload, and never rides in the save payload. */
  coverCrop: CropRect | undefined;
  coverPreviewCrop: CropRect | undefined;
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
  const [coverPreview, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverPreviewCrop, setCoverPreviewCrop] = useState<
    CropRect | undefined
  >(undefined);
  // One setter for the (url, crop) pair so the two can never drift apart: a
  // pick without a crop (a GIF, which bypasses the reframer) must CLEAR any
  // crop left over from the previous pick, not inherit it.
  const setCoverPreview = useCallback(
    (value: string | null, crop?: CropRect) => {
      setCoverPreviewUrl(value);
      setCoverPreviewCrop(crop);
    },
    [],
  );
  const [coverBleed, setCoverBleed] = useState<boolean>(
    subprofile.skinData?.coverBleed ?? false,
  );
  const [accent, setAccent] = useState<AccentKey | "">(subprofile.accent ?? "");
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

  // Current field state in the comparable flat shape — shared by the server
  // resync below, `buildMetaPatch()`, and `metaSnapshot()`.
  const currentSnapshot: MetaSnapshot = {
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

  // Adopt server-side changes to fields the member hasn't locally edited (see
  // `useServerMetaResync` for why this exists — the unpublish/handle-null
  // case). Runs during render, not an effect: the fresh values must be in
  // place on this same paint.
  useServerMetaResync(serverMeta, currentSnapshot, baseline, setBaseline, {
    setDisplayName,
    setTagline,
    setBio,
    setAvatarUrl,
    setCoverUrl,
    setSlug,
    setHandle,
    setLink,
    setVisibility,
    setAccent,
    setAvailability,
    setCtaLabel,
    setCtaUrl,
    setCoverBleed,
  });

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
  // on a refetch (see the `baseline` comment above). Equivalent to a
  // field-by-field diff of `currentSnapshot` against `baseline` since
  // `MetaSnapshot` holds exactly these fields.
  const dirty = !sameMetaSnapshot(currentSnapshot, baseline);

  /**
   * Builds the same partial PATCH the old in-hook `save()` sent, from the
   * current field state. Pure — no mutation, no toast, no navigation guard;
   * the provider owns those and calls this only once it has decided a save
   * should happen. Returns `null` when nothing is dirty (nothing to send).
   */
  function buildMetaPatch(): UpdateSubprofileDTO | null {
    return buildMetaPatchFrom(currentSnapshot, baseline, subprofile.skinData);
  }

  function metaSnapshot(): MetaSnapshot {
    return currentSnapshot;
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
    coverCrop: subprofile.coverCrop,
    coverPreviewCrop,
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
