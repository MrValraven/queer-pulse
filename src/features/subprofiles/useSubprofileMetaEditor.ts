import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import type {
  AccentKey,
  AvailabilityKey,
  LinkVisibility,
  Visibility,
} from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import type { HandleAvailability } from "../settings/api/useHandleAvailability";

export interface SubprofileMetaEditor {
  displayName: string;
  setDisplayName: (value: string) => void;
  tagline: string;
  setTagline: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  avatarUrl: string;
  setAvatarUrl: (value: string) => void;
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
  dirty: boolean;
  saving: boolean;
  save: () => Promise<void>;
}

/**
 * The subprofile's meta editor state: identity (avatar/name/tagline/bio),
 * presence (cover/accent/availability/CTA), and link/visibility (linked vs.
 * standalone, who can see it) — everything the design's three "This side"
 * rail panes (Identity/Presence/Address) jointly edit. Lifted out of the old
 * `SubprofileMetaForm` orchestrator so `EditorPaneRouter` can call this ONE
 * hook and hand its fields to three separately-routed panes while preserving
 * the exact same behaviour that component had: a single `dirty` diff against
 * the loaded `subprofile`, one `useUnsavedChangesGuard`, and one explicit
 * `save()` that PATCHes every field in a single request — switching rail
 * panes never fragments this into three saves.
 */
export function useSubprofileMetaEditor(
  subprofile: SubprofileView,
): SubprofileMetaEditor {
  const { update } = useSubprofileMutations();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [displayName, setDisplayName] = useState(subprofile.displayName);
  const [tagline, setTagline] = useState(subprofile.tagline);
  const [bio, setBio] = useState(subprofile.bio);
  const [avatarUrl, setAvatarUrl] = useState(subprofile.avatarUrl ?? "");
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
  const [accent, setAccent] = useState<AccentKey | "">(
    subprofile.accent ?? "",
  );
  const [availability, setAvailability] = useState<AvailabilityKey | "">(
    subprofile.availability ?? "",
  );
  const [ctaLabel, setCtaLabel] = useState(subprofile.ctaLabel);
  const [ctaUrl, setCtaUrl] = useState(subprofile.ctaUrl);

  const nameMissing = displayName.trim().length === 0;
  // A standalone (unlinked) handle shares the global namespace — don't let a
  // known-taken/invalid one be saved; publish would reject it anyway.
  const handleBlocked =
    link === "unlinked" && handleStatus.status === "unavailable";
  // The CTA label and URL only make sense as a pair — a label with nowhere to
  // go, or a bare link with no call to action, is worse than neither.
  const ctaMismatch = Boolean(ctaLabel.trim()) !== Boolean(ctaUrl.trim());

  // Any local field diverged from the persisted persona? Compared against the
  // same prop expressions the useState initializers use; once a save-
  // triggered refetch lands (same id), this settles back to false — no stale
  // "unsaved changes" prompt.
  const dirty =
    displayName !== subprofile.displayName ||
    tagline !== subprofile.tagline ||
    bio !== subprofile.bio ||
    avatarUrl !== (subprofile.avatarUrl ?? "") ||
    link !== subprofile.linkVisibility ||
    visibility !== subprofile.visibility ||
    slug !== subprofile.slug ||
    handle !== (subprofile.handle ?? "") ||
    coverUrl !== (subprofile.coverUrl ?? "") ||
    accent !== (subprofile.accent ?? "") ||
    availability !== (subprofile.availability ?? "") ||
    ctaLabel !== subprofile.ctaLabel ||
    ctaUrl !== subprofile.ctaUrl;

  // Warn before navigating away from unsaved persona edits (this form saves
  // only on an explicit click; a click into any other rail entry or page
  // would otherwise drop them — the guard fires on ROUTE navigation, not on
  // switching between the three `hidden`-toggled rail panes, which keep this
  // same hook instance mounted).
  useUnsavedChangesGuard({
    active: dirty && !update.isPending,
    confirmMessage: t("subprofiles:metaForm.leaveConfirm"),
  });

  async function save() {
    if (nameMissing || handleBlocked) return;
    if (ctaMismatch) {
      showToast(t("subprofiles:metaForm.ctaMismatch"), "error");
      return;
    }
    // The loaded `avatarUrl`/`coverUrl` are the backend-RESOLVED display URLs
    // (`toImageUrl` turned the stored storage key into `<api>/files/<key>`), not
    // the raw key. Sending an untouched one back would persist that derived URL
    // in place of the clean key — and since a dev API base is `http://…`, the
    // next read fails `toImageUrl`'s `https://`-only check and resolves to
    // `null`, blanking the image. So only send an image field when the user
    // actually changed it: a fresh pick sets it to a new storage key, and a
    // clear sets it to `""` (→ `null`); an untouched field is omitted, leaving
    // the stored key intact under PATCH semantics.
    const avatarChanged = avatarUrl !== (subprofile.avatarUrl ?? "");
    const coverChanged = coverUrl !== (subprofile.coverUrl ?? "");
    try {
      await update.mutateAsync({
        id: subprofile.id,
        dto: {
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
          slug: slug.trim(),
          handle: handle.trim(),
        },
      });
      showToast(t("subprofiles:metaForm.toastSaved"), "success");
    } catch {
      showToast(t("subprofiles:metaForm.toastError"), "error");
    }
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
    dirty,
    saving: update.isPending,
    save,
  };
}
