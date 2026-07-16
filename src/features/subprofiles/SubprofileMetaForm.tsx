import { useState } from "react";
import { FiUser } from "react-icons/fi";
import {
  Button,
  FormField,
  SegmentedControl,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { currentUserSlug } from "../members/data/members";
import type { LinkVisibility, Visibility } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import {
  LINK_HELP,
  LINK_OPTIONS,
  LINK_TO_LABEL,
  MIN_BIO,
  VISIBILITY_OPTIONS,
} from "./subprofileEditor.data";
import { ImageUploadField } from "./ImageUploadField";
import { UsernameField } from "../settings/UsernameField";
import type { HandleAvailability } from "../settings/api/useHandleAvailability";
import styles from "./SubprofileEditor.module.css";

/**
 * The subprofile's meta form: display name, tagline, bio (with a live count
 * against the 80-char publish minimum), avatar, link visibility with its
 * trade-off explained, who-can-see visibility, and the linked slug / standalone
 * handle. Saves the lot in one PATCH via `update`.
 */
export function SubprofileMetaForm({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { update } = useSubprofileMutations();
  const { showToast } = useToast();

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

  const nameMissing = displayName.trim().length === 0;
  // A standalone (unlinked) handle shares the global namespace — don't let a
  // known-taken/invalid one be saved; publish would reject it anyway.
  const handleBlocked =
    link === "unlinked" && handleStatus.status === "unavailable";

  async function save() {
    if (nameMissing || handleBlocked) return;
    try {
      await update.mutateAsync({
        id: subprofile.id,
        dto: {
          displayName: displayName.trim(),
          tagline: tagline.trim() || null,
          bio: bio.trim() || null,
          avatarUrl: avatarUrl || null,
          linkVisibility: link,
          visibility,
          slug: slug.trim(),
          handle: handle.trim(),
        },
      });
      showToast("Details saved", "success");
    } catch {
      showToast("We couldn't save that just now — try again.", "error");
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon}>
          <FiUser size={20} aria-hidden />
        </span>
        <h2 className={styles.cardTitle}>The basics</h2>
      </div>

      <FormField label="Avatar">
        <ImageUploadField
          value={avatarUrl}
          kind="avatar"
          circle
          size={120}
          placeholder="Avatar"
          onChange={setAvatarUrl}
        />
      </FormField>

      <FormField
        label="Display name"
        required
        error={
          nameMissing ? "This persona needs a name to go live." : undefined
        }
      >
        <input
          value={displayName}
          placeholder="How this persona is known"
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </FormField>

      <FormField label="Tagline" helper="One line on what you make.">
        <input
          value={tagline}
          placeholder="e.g. After-hours electronics for queer dancefloors"
          onChange={(e) => setTagline(e.target.value)}
        />
      </FormField>

      <FormField
        label="Bio"
        labelAside={`${bio.length}/${MIN_BIO}`}
        helper="At least 80 characters to publish a standalone persona."
      >
        <textarea
          value={bio}
          rows={4}
          placeholder="A few sentences in your own words."
          onChange={(e) => setBio(e.target.value)}
        />
      </FormField>

      <FormField label="Link to your main profile">
        <SegmentedControl
          fullWidth
          options={[...LINK_OPTIONS]}
          value={LINK_TO_LABEL[link]}
          onChange={(v) =>
            setLink(v === LINK_TO_LABEL.linked ? "linked" : "unlinked")
          }
        />
      </FormField>
      <p className={styles.linkHelp}>{LINK_HELP[link]}</p>

      {link === "linked" ? (
        <FormField
          label="Profile address"
          helper={
            <>
              Lives at{" "}
              <span className={styles.pathPreview}>
                /members/{currentUserSlug}/{slug || "…"}
              </span>
            </>
          }
        >
          <input
            value={slug}
            placeholder="e.g. engineering"
            onChange={(e) => setSlug(e.target.value)}
          />
        </FormField>
      ) : (
        <UsernameField
          value={handle}
          onChange={setHandle}
          currentName={subprofile.handle ?? undefined}
          label="Handle"
          hint={
            <>
              Lives at{" "}
              <span className={styles.pathPreview}>/p/{handle || "…"}</span>
            </>
          }
          onStatusChange={setHandleStatus}
        />
      )}

      <FormField
        label="Who can see it"
        helper={VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.help}
      >
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
        >
          {VISIBILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className={styles.formActions}>
        <Button
          variant="primary"
          onClick={save}
          disabled={update.isPending || nameMissing || handleBlocked}
        >
          {update.isPending ? "Saving…" : "Save details"}
        </Button>
      </div>
    </section>
  );
}
