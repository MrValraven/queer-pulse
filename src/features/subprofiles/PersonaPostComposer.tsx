import { useEffect, useId, useRef, useState } from "react";
import { FiAlertCircle, FiImage, FiLink, FiX } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  EMPTY_PERSONA_POST_DRAFT,
  createBodyFromDraft,
  draftFromPost,
  hasPersonaPostChanges,
  personaPostDraftErrors,
  personaPostErrorKeyOf,
  updateBodyFromDraft,
  type PersonaPostDraft,
  type PersonaPostView,
} from "./api/personaPosts.adapters";
import { PERSONA_POST } from "./api/personaPosts.types";
import {
  isPersonaPostGone,
  useCreatePersonaPost,
  useUpdatePersonaPost,
} from "./api/usePersonaPostMutations";
import { ImageUploadField } from "./ImageUploadField";
import styles from "./PersonaUpdates.module.css";

/** A line that folds in with its message and out when it clears. The
 *  `role="alert"` wrapper stays mounted, so every new message is read out. */
export function PersonaUpdatesAlert({
  id,
  message,
}: {
  id?: string;
  message: string;
}) {
  return (
    <div id={id} role="alert">
      <Collapse isOpen={message !== ""}>
        <p className={styles.error}>
          <FiAlertCircle aria-hidden className={styles.errorIcon} />
          {message}
        </p>
      </Collapse>
    </div>
  );
}

interface ComposerOptions {
  subprofileId: string;
  post?: PersonaPostView;
  onDone?: () => void;
  onCancel?: () => void;
  /** An edit answered 404: the post is gone. */
  onGone?: () => void;
}

/** The composer's state and its submit. A closed "Add link" or "Add photo"
 *  section holds nothing, so it is never checked; on an edit, closing a
 *  section that held something sends its removal. */
function usePersonaPostComposer({
  subprofileId,
  post,
  onDone,
  onCancel,
  onGone,
}: ComposerOptions) {
  const create = useCreatePersonaPost(subprofileId);
  const update = useUpdatePersonaPost(subprofileId);
  const [draft, setDraft] = useState<PersonaPostDraft>(() =>
    post ? draftFromPost(post) : EMPTY_PERSONA_POST_DRAFT,
  );
  const [isLinkOpen, setIsLinkOpen] = useState(Boolean(post?.linkUrl));
  const [isPhotoOpen, setIsPhotoOpen] = useState(Boolean(post?.imageUrl));
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const [serverErrorKey, setServerErrorKey] = useState<string | null>(null);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const isWorking = create.isPending || update.isPending;
  // isWorking is a render value; a second press before the re-render reads
  // it stale (two posts, two follower alerts), so one submit per press is
  // held in a ref.
  const isSubmittingRef = useRef(false);
  const errors = shouldShowErrors ? personaPostDraftErrors(draft) : {};
  const patch = (next: Partial<PersonaPostDraft>) =>
    setDraft((previous) => ({ ...previous, ...next }));

  // Closing a section clears it, for a new post and for an edit alike: the
  // toggle reads "Remove link" or "Remove photo" while open, and an edit
  // then sends the removal. Cancel discards the whole edit.
  function toggleLink() {
    if (isLinkOpen) patch({ linkUrl: "" });
    setIsLinkOpen(!isLinkOpen);
  }

  function togglePhoto() {
    if (isPhotoOpen) patch({ imageKey: null, imagePreviewUrl: null });
    setIsPhotoOpen(!isPhotoOpen);
  }

  async function submit() {
    if (isWorking || isSubmittingRef.current) return;
    const found = personaPostDraftErrors(draft);
    setServerErrorKey(null);
    setStatusKey(null);
    if (found.body || found.linkUrl) {
      setShouldShowErrors(true);
      return;
    }
    isSubmittingRef.current = true;
    try {
      if (post) {
        const body = updateBodyFromDraft(draft, post);
        if (!hasPersonaPostChanges(body)) {
          (onCancel ?? onDone)?.();
          return;
        }
        await update.mutateAsync({ postId: post.id, body });
      } else {
        await create.mutateAsync(createBodyFromDraft(draft));
        setDraft(EMPTY_PERSONA_POST_DRAFT);
        setIsLinkOpen(false);
        setIsPhotoOpen(false);
        setStatusKey("subprofiles:updates.composer.postedStatus");
      }
      setShouldShowErrors(false);
      onDone?.();
    } catch (error) {
      setServerErrorKey(personaPostErrorKeyOf(error));
      if (post && isPersonaPostGone(error)) onGone?.();
    } finally {
      isSubmittingRef.current = false;
    }
  }

  const bodyErrorKey = errors.body ?? serverErrorKey ?? null;
  return {
    draft,
    patch,
    errors,
    bodyErrorKey,
    statusKey,
    isWorking,
    isLinkOpen,
    isPhotoOpen,
    toggleLink,
    togglePhoto,
    submit,
  };
}

/** "Post an update", or, with `post`, the same form editing it in place.
 *  An edit announces "Update saved" from its parent, which outlives it. */
export function PersonaPostComposer(options: ComposerOptions) {
  const { post, onCancel } = options;
  const { t } = useTranslation();
  const bodyId = useId();
  const countId = useId();
  const errorId = useId();
  const linkErrorId = useId();
  const linkId = useId();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const composer = usePersonaPostComposer(options);
  const { draft, patch, errors } = composer;
  const isEditing = post !== undefined;

  useEffect(() => {
    if (isEditing) bodyRef.current?.focus();
  }, [isEditing]);

  return (
    <div className={styles.composer}>
      <label htmlFor={bodyId} className={styles.label}>
        {t("subprofiles:updates.composer.bodyLabel")}
      </label>
      <textarea
        ref={bodyRef}
        id={bodyId}
        className={styles.textarea}
        rows={3}
        value={draft.body}
        maxLength={PERSONA_POST.bodyMax}
        placeholder={t("subprofiles:updates.composer.bodyPlaceholder")}
        aria-invalid={errors.body ? true : undefined}
        aria-describedby={`${countId} ${errorId}`}
        onChange={(event) => patch({ body: event.target.value })}
      />
      <p id={countId} className={styles.count}>
        {t("subprofiles:updates.composer.count", {
          count: draft.body.length,
          max: PERSONA_POST.bodyMax,
        })}
      </p>
      <Collapse isOpen={composer.isLinkOpen}>
        <div className={styles.extra}>
          <label htmlFor={linkId} className={styles.label}>
            {t("subprofiles:updates.composer.linkLabel")}
          </label>
          <input
            id={linkId}
            className={styles.input}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={draft.linkUrl}
            maxLength={PERSONA_POST.linkMax}
            aria-invalid={errors.linkUrl ? true : undefined}
            aria-describedby={linkErrorId}
            onChange={(event) => patch({ linkUrl: event.target.value })}
          />
          <PersonaUpdatesAlert
            id={linkErrorId}
            message={errors.linkUrl ? t(errors.linkUrl) : ""}
          />
        </div>
      </Collapse>
      <Collapse isOpen={composer.isPhotoOpen}>
        <div className={styles.extra}>
          <ImageUploadField
            value={draft.imageKey ?? draft.imagePreviewUrl ?? ""}
            onChange={(key) =>
              patch(
                key
                  ? { imageKey: key }
                  : { imageKey: null, imagePreviewUrl: null },
              )
            }
            onPreviewChange={(previewUrl) =>
              patch({ imagePreviewUrl: previewUrl })
            }
            kind="work-image"
            size={120}
            placeholder=""
          />
        </div>
      </Collapse>
      <PersonaUpdatesAlert
        id={errorId}
        message={composer.bodyErrorKey ? t(composer.bodyErrorKey) : ""}
      />
      <div className={styles.composerActions}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.tapTarget}
          aria-expanded={composer.isLinkOpen}
          onClick={composer.toggleLink}
        >
          {composer.isLinkOpen ? <FiX aria-hidden /> : <FiLink aria-hidden />}{" "}
          {t(
            composer.isLinkOpen
              ? "subprofiles:updates.composer.removeLinkCta"
              : "subprofiles:updates.composer.addLinkCta",
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={styles.tapTarget}
          aria-expanded={composer.isPhotoOpen}
          onClick={composer.togglePhoto}
        >
          {composer.isPhotoOpen ? <FiX aria-hidden /> : <FiImage aria-hidden />}{" "}
          {t(
            composer.isPhotoOpen
              ? "subprofiles:updates.composer.removePhotoCta"
              : "subprofiles:updates.composer.addPhotoCta",
          )}
        </Button>
        <span className={styles.spacer} />
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            className={styles.tapTarget}
            onClick={onCancel}
          >
            {t("subprofiles:updates.composer.cancelCta")}
          </Button>
        )}
        <Button
          size="sm"
          className={styles.tapTarget}
          onClick={() => void composer.submit()}
          aria-disabled={composer.isWorking || undefined}
        >
          {composer.isWorking
            ? t("subprofiles:updates.composer.saving")
            : t(
                isEditing
                  ? "subprofiles:updates.composer.saveCta"
                  : "subprofiles:updates.composer.postCta",
              )}
        </Button>
      </div>
      <p className="visuallyHidden" role="status">
        {composer.statusKey ? t(composer.statusKey) : ""}
      </p>
    </div>
  );
}
