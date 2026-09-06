import { useState } from "react";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import {
  Button,
  ModalSheet,
  Select,
  Sending,
} from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useMyCommunityOptions } from "../communities/api/useMyCommunityOptions";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CATS } from "./forum.data";
import { ComposeTagsField } from "./ComposeTagsField";
import { ForumImageAttach } from "./ForumImageAttach";
import { useComposeThreadDraft } from "./useComposeThreadDraft";
import styles from "./ComposeThreadModal.module.css";

/**
 * Where the compose flow is in the publish lifecycle, owned by
 * `useCreateThreadFlow`. `published` is the ONLY state that renders the plum
 * confirmation sheet, and it is reached solely from the create mutation's
 * `onSuccess` — never optimistically.
 */
export type PublishStatus = "idle" | "publishing" | "published" | "error";

export interface NewThreadInput {
  title: string;
  body: string;
  cat: string;
  tags: string[];
  /** The community this thread is posted to, or undefined for a global,
   *  everyone-sees-it thread. */
  communitySlug?: string;
  /** Publish under the "QueerPulse Official" byline instead of the caller.
   *  Only ever set from the admin-only checkbox below. */
  isOfficial?: boolean;
  /** Storage key of one photo on the opening post (live), or a local blob URL
   *  (demo) — both come back from the shared presigned upload pipeline. */
  image?: string;
  /** Local blob preview of that photo, for the optimistic card. */
  imagePreviewUrl?: string;
}

interface ComposeThreadModalProps {
  onClose: () => void;
  onPublish: (thread: NewThreadInput) => void;
  /** Seeds the title field — used by the first-post prompt's starter chips. */
  initialTitle?: string;
  /** Seeds the tags field — used by a topic page's "Write a post" CTA
   *  (DISC-5, `writeHrefForTag`) to pre-attach that topic's tag. */
  initialTags?: string[];
  /** Where the publish request stands, owned by `useCreateThreadFlow`. The
   *  confirmation sheet renders on `"published"` ONLY, which that hook sets
   *  from the mutation's `onSuccess`. `"error"` keeps this form (and the
   *  member's draft) on screen with an inline explanation. */
  status: PublishStatus;
}

// Selectable categories — exclude the synthetic "all" bucket.
const POST_CATS = CATS.filter((category) => category.id !== "all");
const DEFAULT_CAT = POST_CATS[0]!.id;
// Module-level so the identity is stable across renders: a restored draft's
// stored category is only honoured when it is still one of these.
const POST_CAT_IDS = POST_CATS.map((category) => category.id);

/** Compose dialog that prepends a new thread, ending in a plum-panel confirmation. */
export function ComposeThreadModal({
  onClose,
  onPublish,
  initialTitle = "",
  initialTags = [],
  status,
}: ComposeThreadModalProps) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState("");
  const [cat, setCat] = useState(DEFAULT_CAT);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [communitySlug, setCommunitySlug] = useState("");
  const [isOfficial, setIsOfficial] = useState(false);
  const myCommunityOptions = useMyCommunityOptions();
  // Autosave + the photo attachment (PRD-165). See `useComposeThreadDraft`:
  // one draft per member, so an interrupted post is there IN FULL next visit.
  const {
    attach,
    stagedImage,
    status: draftStatus,
    clearDraft,
  } = useComposeThreadDraft({
    title,
    setTitle,
    body,
    setBody,
    category: cat,
    setCategory: setCat,
    communitySlug,
    setCommunitySlug,
    tags,
    setTags,
    defaultCategory: DEFAULT_CAT,
    categoryIds: POST_CAT_IDS,
  });

  const isPublishing = status === "publishing";
  const canPublish =
    title.trim().length > 0 && body.trim().length > 0 && !isPublishing;

  if (status === "published") {
    return <ComposeThreadConfirm onClose={onClose} />;
  }

  return (
    <ModalSheet onClose={onClose} ariaLabel={t("forum:compose.title")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canPublish) return;
          onPublish({
            title: title.trim(),
            body: body.trim(),
            cat,
            tags,
            ...(communitySlug ? { communitySlug } : {}),
            ...(isAdmin && isOfficial ? { isOfficial: true } : {}),
            ...(stagedImage
              ? {
                  image: stagedImage.key,
                  imagePreviewUrl: stagedImage.previewUrl,
                }
              : {}),
          });
          // The thread is on its way; the draft it came from is spent. A
          // failed publish keeps the form (and the member's text) on screen,
          // and the next keystroke re-creates the draft.
          void clearDraft();
        }}
      >
        <h2 className={styles.dialogTitle}>{t("forum:compose.title")}</h2>
        <p className={styles.dialogSub}>{t("forum:compose.sub")}</p>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t("forum:compose.titleFieldLabel")}
          </span>
          <input
            className={styles.input}
            type="text"
            autoComplete="off"
            enterKeyHint="next"
            placeholder={t("forum:compose.titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t("forum:compose.categoryFieldLabel")}
          </span>
          <Select
            value={cat}
            onChange={(value) => setCat(value ?? cat)}
            options={POST_CATS.map((option) => ({
              value: option.id,
              label: t(option.nameKey),
            }))}
          />
        </label>

        {myCommunityOptions.length > 0 && (
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              {t("forum:compose.communityFieldLabel")}
            </span>
            <Select
              value={communitySlug}
              onChange={(value) => setCommunitySlug(value ?? "")}
              options={[
                { value: "", label: t("forum:compose.communityNone") },
                ...myCommunityOptions.map((community) => ({
                  value: community.slug,
                  label: community.name,
                })),
              ]}
            />
          </label>
        )}

        <ComposeTagsField tags={tags} onChange={setTags} />

        {isAdmin && (
          <label className={styles.officialField} htmlFor="compose-official">
            <input
              id="compose-official"
              type="checkbox"
              checked={isOfficial}
              onChange={(e) => setIsOfficial(e.target.checked)}
            />
            <span className={styles.officialFieldText}>
              {t("forum:compose.officialFieldLabel")}
              <span className={styles.officialFieldHint}>
                {t("forum:compose.officialFieldHint")}
              </span>
            </span>
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t("forum:compose.postFieldLabel")}
          </span>
          <textarea
            className={styles.textarea}
            placeholder={t("forum:compose.postPlaceholder")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
          />
        </label>

        <div className={styles.attachRow}>
          <ForumImageAttach
            attach={attach}
            buttonLabel={t("forum:compose.imageAttachThreadAria")}
          />
          <ComposeDraftStatus status={draftStatus} />
        </div>

        {status === "error" && (
          <p className={styles.publishError} role="alert">
            <FiAlertTriangle aria-hidden />
            {t("forum:compose.publishFailed")}
          </p>
        )}

        <div className={styles.dialogActions}>
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isPublishing}
          >
            {t("forum:compose.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!canPublish || attach.uploading}
          >
            {isPublishing ? (
              <Sending label={t("forum:compose.publishing")} />
            ) : status === "error" ? (
              t("forum:compose.publishRetryCta")
            ) : (
              t("forum:compose.publishCta")
            )}
          </Button>
        </div>
      </form>
    </ModalSheet>
  );
}

/** The plum confirmation sheet shown once the server has really created the
 *  thread. Extracted so `ComposeThreadModal` itself stays inside the
 *  200-line component budget after growing a photo field and autosave. */
function ComposeThreadConfirm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalSheet onClose={onClose} success ariaLabel={t("forum:compose.title")}>
      <div className={styles.confirm}>
        <span className={styles.confirmIcon} aria-hidden>
          <FiCheck />
        </span>
        <h2 className={styles.confirmTitle}>
          <Translation
            i18nKey="forum:compose.confirmTitle"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.confirmBody}>{t("forum:compose.confirmBody")}</p>
        <div className={styles.confirmActions}>
          <Button variant="ghost-dark" onClick={onClose}>
            {t("forum:compose.done")}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}

/** The quiet "we have your text" line beside the attach control. Silent until
 *  there is something true to say. */
function ComposeDraftStatus({
  status,
}: {
  status: "idle" | "saving" | "saved" | "restored";
}) {
  const { t } = useTranslation();
  if (status === "idle") return null;
  const labelKey =
    status === "saving"
      ? "forum:draft.saving"
      : status === "saved"
        ? "forum:draft.saved"
        : "forum:draft.restored";
  return (
    <span className={styles.draftStatus} role="status">
      {t(labelKey)}
    </span>
  );
}
