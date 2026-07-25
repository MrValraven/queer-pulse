import { useEffect, useRef, useState } from "react";
import { AdminDrawer } from "./ui";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage } from "../members/api/useUploadImage";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { ApiError } from "../../shared/api/client";
import { useAdminBotProfile } from "./api/useAdminBots";
import { useUpdateBot } from "./api/useUpdateBot";
import {
  AdminBotEditorFields,
  createSocialRow,
  type BotFormState,
} from "./AdminBotEditorFields";
import type { AdminBotSummaryDTO } from "./api/adminBots.api";
import styles from "./AdminBotEditor.module.css";

interface Props {
  bot: AdminBotSummaryDTO;
  onClose: () => void;
}

/**
 * Editor drawer for one system ("bot") account. Loads current values via
 * `useAdminBotProfile(bot.slug)` and saves via `useUpdateBot`. Demo mode is a
 * no-op save (the hook returns without touching the network), so the drawer
 * still walks through the full form + close flow standalone.
 */
export function AdminBotEditorDrawer({ bot, onClose }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: profile, isLoading } = useAdminBotProfile(bot.slug);
  const updateBot = useUpdateBot();
  const uploadAvatar = useUploadImage("avatar");

  const [form, setForm] = useState<BotFormState | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    bot.avatarUrl,
  );
  const [uploading, setUploading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const previewToRevoke = useRef<string | null>(null);
  const seededRef = useRef(false);

  // Seed the form once the current profile first loads. Username starts from
  // the list summary's slug (the profile fetch doesn't round-trip a
  // "username"). Guarded by `seededRef` so a later background refetch of
  // `profile` (e.g. refetchOnWindowFocus) can't clobber unsaved edits.
  useEffect(() => {
    if (!profile || seededRef.current) return;
    seededRef.current = true;
    setForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      username: bot.slug,
      pronouns: profile.pronouns ?? "",
      tagline: profile.tagline ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
      avatarKey: null,
      socials: (profile.socials ?? []).map((social) => createSocialRow(social)),
    });
    setAvatarPreview(profile.avatarUrl ?? null);
  }, [profile, bot.slug]);

  // Release the most recent picked-avatar object URL when the drawer
  // unmounts (e.g. the admin picks a photo then cancels/closes) — otherwise
  // it only gets revoked when a *second* avatar is picked, leaking the blob.
  useEffect(() => {
    return () => {
      if (previewToRevoke.current) URL.revokeObjectURL(previewToRevoke.current);
    };
  }, []);

  async function handlePickAvatar(file: File) {
    setUploading(true);
    try {
      const { key, previewUrl } = await uploadAvatar(file);
      if (previewToRevoke.current) URL.revokeObjectURL(previewToRevoke.current);
      previewToRevoke.current = previewUrl;
      setAvatarPreview(previewUrl);
      setForm((previous) =>
        previous ? { ...previous, avatarKey: key } : previous,
      );
    } catch (error) {
      showToast(
        error instanceof ImageProcessingError
          ? t(error.i18nKey, error.values)
          : t("admin:bots.saveFailed"),
        "error",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    if (!form) return;
    setUsernameError(null);
    updateBot.mutate(
      {
        userId: bot.userId,
        originalUsername: bot.slug,
        username: form.username,
        profile: {
          firstName: form.firstName,
          lastName: form.lastName,
          pronouns: form.pronouns,
          tagline: form.tagline,
          location: form.location,
          bio: form.bio,
          // Only send avatarUrl when the admin picked a new one — the update
          // DTO otherwise leaves the current avatar untouched.
          ...(form.avatarKey ? { avatarUrl: form.avatarKey } : {}),
        },
        // Drop the client-only `id` and any blank rows before sending.
        socials: form.socials
          .filter((social) => social.platform && social.urlOrHandle)
          .map((social) => ({
            platform: social.platform,
            urlOrHandle: social.urlOrHandle,
          })),
      },
      {
        onSuccess: () => {
          showToast(t("admin:bots.saved", { name: form.firstName }), "success");
          onClose();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setUsernameError(t("admin:bots.usernameTaken"));
            return;
          }
          showToast(t("admin:bots.saveFailed"), "error");
        },
      },
    );
  }

  const displayName = `${bot.firstName} ${bot.lastName}`.trim();
  const title = t("admin:bots.editTitle", { name: displayName });

  function updateForm(updater: (previous: BotFormState) => BotFormState) {
    setForm((previous) => (previous ? updater(previous) : previous));
  }

  return (
    <AdminDrawer
      label={title}
      onClose={onClose}
      head={<strong>{title}</strong>}
      foot={
        <div className={styles.foot}>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:bots.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!form || updateBot.isPending || uploading}
          >
            {t("admin:bots.save")}
          </Button>
        </div>
      }
    >
      {!form || isLoading ? (
        <SkeletonLine />
      ) : (
        <AdminBotEditorFields
          form={form}
          setForm={updateForm}
          avatarPreview={avatarPreview}
          uploading={uploading}
          onPickAvatar={handlePickAvatar}
          usernameError={usernameError}
        />
      )}
    </AdminDrawer>
  );
}
