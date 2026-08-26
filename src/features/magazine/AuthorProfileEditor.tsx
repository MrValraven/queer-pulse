import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ImageUrlField } from "./ImageUrlField";
import { useUpdateAuthor } from "./api/useAuthorMutations";
import styles from "./AuthorProfileEditor.module.css";

/** The byline fields this editor writes. */
export interface AuthorProfileDraft {
  slug: string;
  name: string;
  bio: string;
  avatarUrl: string;
}

/**
 * CON-11 — the editor that makes a byline a real person.
 *
 * A byline row is auto-created on publish with `bio: null` and
 * `avatarUrl: null`, and until this existed there was no way to fill either
 * in. A `magazine_editor` edits any byline including its NAME; a linked
 * member edits their own bio and portrait, because the name is what is
 * already printed on their published pieces.
 *
 * Only CHANGED fields are sent. That is what lets a staff editor re-open a
 * byline whose portrait another editor uploaded without the save being
 * refused by the backend's foreign-upload check.
 */
export function AuthorProfileEditor({
  initial,
  canEditName,
  asStaff,
  onClose,
}: {
  initial: AuthorProfileDraft;
  /** Staff only: the byline name is printed on published pieces. */
  canEditName: boolean;
  /** Route through the admin endpoint rather than `/authors/me`. */
  asStaff: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateAuthor = useUpdateAuthor();
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);

  const trimmedName = name.trim();
  const isNameEmpty = canEditName && trimmedName.length === 0;
  const hasChanges =
    (canEditName && trimmedName !== initial.name.trim()) ||
    bio.trim() !== initial.bio.trim() ||
    avatarUrl.trim() !== initial.avatarUrl.trim();

  async function save() {
    try {
      await updateAuthor.mutateAsync({
        slug: initial.slug,
        asStaff,
        dto: {
          ...(canEditName && trimmedName !== initial.name.trim()
            ? { name: trimmedName }
            : {}),
          ...(bio.trim() !== initial.bio.trim() ? { bio: bio.trim() } : {}),
          ...(avatarUrl.trim() !== initial.avatarUrl.trim()
            ? { avatarUrl: avatarUrl.trim() }
            : {}),
        },
      });
      showToast(t("magazine:author.editor.savedToast"), "success");
      onClose();
    } catch {
      showToast(t("magazine:author.editor.errorToast"), "error");
    }
  }

  return (
    <Modal
      title={t("magazine:author.editor.title")}
      eyebrow={t("magazine:author.editor.eyebrow")}
      sub={t("magazine:author.editor.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:author.editor.cancelCta")}
          </Button>
          <Button
            onClick={() => void save()}
            disabled={!hasChanges || isNameEmpty || updateAuthor.isPending}
          >
            {updateAuthor.isPending
              ? t("magazine:author.editor.savingCta")
              : t("magazine:author.editor.saveCta")}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        {canEditName && (
          <FormField
            label={t("magazine:author.editor.nameLabel")}
            required
            helper={t("magazine:author.editor.nameHelper")}
            error={
              isNameEmpty ? t("magazine:author.editor.nameRequired") : undefined
            }
          >
            <input
              type="text"
              className={styles.input}
              value={name}
              maxLength={200}
              onChange={(event) => setName(event.target.value)}
            />
          </FormField>
        )}

        <FormField
          label={t("magazine:author.editor.bioLabel")}
          helper={t("magazine:author.editor.bioHelper")}
          labelAside={`${bio.length}/500`}
        >
          <textarea
            className={styles.textarea}
            value={bio}
            rows={5}
            maxLength={500}
            onChange={(event) => setBio(event.target.value)}
          />
        </FormField>

        <ImageUrlField
          label={t("magazine:author.editor.portraitLabel")}
          value={avatarUrl}
          onChange={setAvatarUrl}
          alt={t("magazine:author.editor.portraitAlt")}
          tint="plum"
        />
      </div>
    </Modal>
  );
}
