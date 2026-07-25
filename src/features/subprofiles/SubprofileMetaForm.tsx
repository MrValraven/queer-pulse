import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/ProfileProvider";
import type {
  AccentKey,
  AvailabilityKey,
  LinkVisibility,
  Visibility,
} from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { SubprofileIdentityFields } from "./SubprofileIdentityFields";
import { SubprofilePresenceFields } from "./SubprofilePresenceFields";
import { SubprofileLinkFields } from "./SubprofileLinkFields";
import type { HandleAvailability } from "../settings/api/useHandleAvailability";
import styles from "./SubprofileEditor.module.css";

/**
 * The subprofile's meta form: identity (avatar/name/tagline/bio), presence
 * (cover/accent/availability/CTA), and link/visibility (linked vs. standalone,
 * who can see it) — each rendered by a colocated field-group component so this
 * orchestrator stays under the 200-line cap. Saves the lot in one PATCH via
 * `update`.
 */
export function SubprofileMetaForm({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { update } = useSubprofileMutations();
  const { showToast } = useToast();
  const { t } = useTranslation();
  // The signed-in member's own slug for the linked-address preview — the real
  // user in live mode, the mock persona in demo (never the hardcoded slug).
  const { profile } = useProfile();

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

  async function save() {
    if (nameMissing || handleBlocked) return;
    if (ctaMismatch) {
      showToast(t("subprofiles:metaForm.ctaMismatch"), "error");
      return;
    }
    try {
      await update.mutateAsync({
        id: subprofile.id,
        dto: {
          displayName: displayName.trim(),
          tagline: tagline.trim() || null,
          bio: bio.trim() || null,
          avatarUrl: avatarUrl || null,
          coverUrl: coverUrl || null,
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

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon}>
          <FiUser size={20} aria-hidden />
        </span>
        <h2 className={styles.cardTitle}>
          {t("subprofiles:metaForm.sectionTitle")}
        </h2>
      </div>

      <SubprofileIdentityFields
        avatarUrl={avatarUrl}
        onAvatarUrlChange={setAvatarUrl}
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        nameMissing={nameMissing}
        tagline={tagline}
        onTaglineChange={setTagline}
        bio={bio}
        onBioChange={setBio}
      />

      <SubprofilePresenceFields
        coverUrl={coverUrl}
        onCoverUrlChange={setCoverUrl}
        accent={accent}
        onAccentChange={setAccent}
        availability={availability}
        onAvailabilityChange={setAvailability}
        ctaLabel={ctaLabel}
        onCtaLabelChange={setCtaLabel}
        ctaUrl={ctaUrl}
        onCtaUrlChange={setCtaUrl}
      />

      <SubprofileLinkFields
        link={link}
        onLinkChange={setLink}
        ownerSlug={profile.slug}
        slug={slug}
        onSlugChange={setSlug}
        handle={handle}
        onHandleChange={setHandle}
        currentHandle={subprofile.handle ?? undefined}
        onHandleStatusChange={setHandleStatus}
        visibility={visibility}
        onVisibilityChange={setVisibility}
      />

      <div className={styles.formActions}>
        <Button
          variant="primary"
          onClick={save}
          disabled={update.isPending || nameMissing || handleBlocked}
        >
          {update.isPending
            ? t("subprofiles:metaForm.saving")
            : t("subprofiles:metaForm.save")}
        </Button>
      </div>
    </section>
  );
}
