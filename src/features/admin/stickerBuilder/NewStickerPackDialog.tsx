import { useId, useRef, useState, type FormEvent } from "react";
import { Button, FormField, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import { isValidPackSlug, slugifyPackName } from "./packSlug";
import styles from "./NewStickerPackDialog.module.css";

/** The backend's create DTO caps a pack name at 80 characters. */
const PACK_NAME_MAX_LENGTH = 80;
const PACK_SLUG_MAX_LENGTH = 64;

/**
 * Starts a new draft pack. The name comes first because it is what the admin
 * thinks in; the slug follows it automatically until the admin types into the
 * slug field, and clearing that field hands it back to the name. Mount it only
 * while open: closing unmounts it, which is also how the form resets.
 */
export function NewStickerPackDialog({
  packs,
  isCreatingPack,
  onCreatePack,
  onClose,
}: {
  packs: AdminStickerPackResponse[];
  isCreatingPack: boolean;
  onCreatePack: (body: { slug: string; name: string }) => Promise<boolean>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const formId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [typedSlug, setTypedSlug] = useState("");
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [hasTouchedName, setHasTouchedName] = useState(false);
  // Set before awaiting the create and left on after a success (the dialog
  // unmounts then). The caller refetches the pack list before its promise
  // resolves, so without this freeze the slug just submitted would come back
  // as "already used" and be announced as an error on a successful create.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = name.trim();
  const slug = hasEditedSlug ? typedSlug : slugifyPackName(name);
  const isNameValid = trimmedName.length > 0;
  const isSlugTaken = !isSubmitting && packs.some((pack) => pack.slug === slug);
  const isSlugWellFormed = isValidPackSlug(slug);
  const isBusy = isSubmitting || isCreatingPack;
  const canSubmit = isNameValid && isSlugWellFormed && !isSlugTaken && !isBusy;

  const nameError =
    hasTouchedName && !isNameValid && !isSubmitting
      ? t("admin:stickerPacks.newPack.nameRequired")
      : undefined;
  // A name made only of symbols slugifies to nothing, so the slug field is
  // the one place left to fix it.
  const slugError = isSubmitting
    ? undefined
    : slug.length === 0
      ? isNameValid
        ? t("admin:stickerPacks.newPack.slugRequired")
        : undefined
      : isSlugTaken
        ? t("admin:stickerPacks.newPack.slugTaken")
        : !isSlugWellFormed
          ? t("admin:stickerPacks.newPack.slugInvalid")
          : undefined;

  function changeSlug(nextSlug: string) {
    // An emptied slug field goes back to following the name, so the admin
    // can undo a hand edit without retyping anything.
    setHasEditedSlug(nextSlug.length > 0);
    setTypedSlug(nextSlug);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setHasTouchedName(true);
    if (!canSubmit) return;
    setIsSubmitting(true);
    // The caller toasts a failure; a rejection counts as one, so the dialog
    // stays open with the admin's input intact and validation live again.
    const isCreated = await onCreatePack({ slug, name: trimmedName }).catch(
      () => false,
    );
    if (isCreated) onClose();
    else setIsSubmitting(false);
  }

  return (
    <Modal
      title={t("admin:stickerPacks.newPack.title")}
      sub={t("admin:stickerPacks.newPack.sub")}
      onClose={onClose}
      initialFocusRef={nameInputRef}
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={formId}
            disabled={!canSubmit}
            aria-busy={isBusy || undefined}
          >
            {isBusy
              ? t("admin:stickerPacks.newPack.creating")
              : t("admin:stickerPacks.newPack.submit")}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className={styles.form}
        onSubmit={(event) => void submit(event)}
        noValidate
      >
        <FormField
          label={t("admin:stickerPacks.rail.newName")}
          required
          error={nameError}
        >
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            maxLength={PACK_NAME_MAX_LENGTH}
            autoComplete="off"
            placeholder={t("admin:stickerPacks.newPack.namePlaceholder")}
            onChange={(event) => {
              setName(event.target.value);
              setHasTouchedName(true);
            }}
          />
        </FormField>
        <FormField
          label={t("admin:stickerPacks.rail.newSlug")}
          required
          helper={t("admin:stickerPacks.newPack.slugHint")}
          error={slugError}
          labelAside={
            hasEditedSlug ? undefined : t("admin:stickerPacks.newPack.slugAuto")
          }
        >
          <input
            type="text"
            value={slug}
            maxLength={PACK_SLUG_MAX_LENGTH}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => changeSlug(event.target.value)}
          />
        </FormField>
      </form>
    </Modal>
  );
}
