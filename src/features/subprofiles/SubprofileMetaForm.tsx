import { useState } from "react";
import { FiUser } from "react-icons/fi";
import {
  Button,
  FormField,
  SegmentedControl,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/ProfileProvider";
import type { LinkVisibility, Visibility } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import {
  LINK_HELP_KEY,
  LINK_OPTIONS,
  LINK_TO_LABEL_KEY,
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
      showToast(t("subprofiles:metaForm.toastSaved"), "success");
    } catch {
      showToast(t("subprofiles:metaForm.toastError"), "error");
    }
  }

  const linkChoices = LINK_OPTIONS.map((value) => ({
    value,
    label: t(LINK_TO_LABEL_KEY[value]),
  }));

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

      <FormField label={t("subprofiles:metaForm.avatarLabel")}>
        <ImageUploadField
          value={avatarUrl}
          kind="avatar"
          circle
          size={120}
          placeholder={t("subprofiles:metaForm.avatarPlaceholder")}
          onChange={setAvatarUrl}
        />
      </FormField>

      <FormField
        label={t("subprofiles:metaForm.displayNameLabel")}
        required
        error={
          nameMissing ? t("subprofiles:metaForm.displayNameError") : undefined
        }
      >
        <input
          value={displayName}
          placeholder={t("subprofiles:metaForm.displayNamePlaceholder")}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </FormField>

      <FormField
        label={t("subprofiles:metaForm.taglineLabel")}
        helper={t("subprofiles:metaForm.taglineHelper")}
      >
        <input
          value={tagline}
          placeholder={t("subprofiles:metaForm.taglinePlaceholder")}
          onChange={(e) => setTagline(e.target.value)}
        />
      </FormField>

      <FormField
        label={t("subprofiles:metaForm.bioLabel")}
        labelAside={`${bio.length}/${MIN_BIO}`}
        helper={t("subprofiles:metaForm.bioHelper")}
      >
        <textarea
          value={bio}
          rows={4}
          placeholder={t("subprofiles:metaForm.bioPlaceholder")}
          onChange={(e) => setBio(e.target.value)}
        />
      </FormField>

      <FormField label={t("subprofiles:metaForm.linkLabel")}>
        <SegmentedControl
          fullWidth
          options={linkChoices.map((c) => c.label)}
          value={t(LINK_TO_LABEL_KEY[link])}
          onChange={(v) => {
            const match = linkChoices.find((c) => c.label === v);
            if (match) setLink(match.value);
          }}
        />
      </FormField>
      <p className={styles.linkHelp}>{t(LINK_HELP_KEY[link])}</p>

      {link === "linked" ? (
        <FormField
          label={t("subprofiles:metaForm.addressLabel")}
          helper={
            <>
              {t("subprofiles:metaForm.livesAt")}{" "}
              <span className={styles.pathPreview}>
                /members/{profile.slug}/{slug || "…"}
              </span>
            </>
          }
        >
          <input
            value={slug}
            placeholder={t("subprofiles:metaForm.addressPlaceholder")}
            onChange={(e) => setSlug(e.target.value)}
          />
        </FormField>
      ) : (
        <UsernameField
          value={handle}
          onChange={setHandle}
          currentName={subprofile.handle ?? undefined}
          label={t("subprofiles:metaForm.handleLabel")}
          hint={
            <>
              {t("subprofiles:metaForm.livesAt")}{" "}
              <span className={styles.pathPreview}>/p/{handle || "…"}</span>
            </>
          }
          onStatusChange={setHandleStatus}
        />
      )}

      <FormField
        label={t("subprofiles:metaForm.visibilityLabel")}
        helper={t(
          VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.helpKey ??
            VISIBILITY_OPTIONS[0]!.helpKey,
        )}
      >
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
        >
          {VISIBILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
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
          {update.isPending
            ? t("subprofiles:metaForm.saving")
            : t("subprofiles:metaForm.save")}
        </Button>
      </div>
    </section>
  );
}
