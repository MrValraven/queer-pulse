import { useEffect, useRef, useState } from "react";
import { FiCamera, FiPlus, FiTrash2 } from "react-icons/fi";
import { ImageSlot, PhotoReframeModal } from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WorkItem } from "./data/members";
import type { WorkLink } from "./workLink.data";
import { ImageProcessingError } from "./api/uploadProcessing";
import { useUploadImage } from "./api/useUploadImage";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

const TINTS = ["coral", "jade", "plum"] as const;

/** One link input: an editable external-URL field, or — when the link is a
 *  `ref` this editor has no picker for — a read-only note. Shared by both the
 *  primary and (optional) second link slot in `WorkItemEditor`. */
function WorkLinkField({
  link,
  ariaLabel,
  placeholder,
  onChange,
}: {
  link: WorkLink | undefined;
  ariaLabel: string;
  placeholder: string;
  onChange: (link: WorkLink | undefined) => void;
}) {
  const { t } = useTranslation();
  if (link?.kind === "ref") {
    // A `ref` link points at an internal QueerPulse page (e.g. a curated
    // collection). There's no ref/entity picker in this editor (out of
    // scope), so rendering the external-URL input here would show a blank
    // box whose first keystroke silently downgrades and destroys the ref.
    // Show a read-only note instead — every other field stays editable.
    return (
      <p className={editStyles.workLinkNote}>
        {t("members:workItem.linkedNote")}
      </p>
    );
  }
  return (
    <input
      className={`${editStyles.inlineInput} ${editStyles.workLinkInput}`}
      value={link?.kind === "external" ? link.href : ""}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => {
        const href = e.target.value.trim();
        onChange(href ? { kind: "external", href } : undefined);
      }}
    />
  );
}

/** The second (optional) link slot: collapsed behind an "Add a second link"
 *  affordance until the member opts in (or the item already has one, e.g.
 *  loaded from the server) — then it's a `WorkLinkField` plus a remove
 *  button that both clears the link and re-collapses the slot. Owns its own
 *  open/closed state; `links` is the item's full (0-2) list so it can read
 *  whether a first link exists yet and what the second one currently is. */
function WorkSecondLinkSlot({
  links,
  onChange,
}: {
  links: WorkLink[];
  onChange: (link: WorkLink | undefined) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(links.length > 1);
  if (open) {
    return (
      <div className={editStyles.workSecondLinkRow}>
        <WorkLinkField
          link={links[1]}
          ariaLabel={t("members:workItem.secondLinkLabel")}
          placeholder={t("members:workItem.secondLinkPlaceholder")}
          onChange={onChange}
        />
        <button
          type="button"
          className={editStyles.workLinkRemoveBtn}
          aria-label={t("members:workItem.removeSecondLink")}
          onClick={() => {
            onChange(undefined);
            setOpen(false);
          }}
        >
          <FiTrash2 size={13} aria-hidden />
        </button>
      </div>
    );
  }
  // Only offer a second link once a first one exists.
  if (links.length !== 1) return null;
  return (
    <button
      type="button"
      className={editStyles.workAddLinkBtn}
      onClick={() => setOpen(true)}
    >
      <FiPlus size={13} aria-hidden /> {t("members:workItem.addSecondLink")}
    </button>
  );
}

/**
 * One editable "Selected work" card: an image picker (uploads via
 * `useUploadImage("work-image")`, which resolves to `{ key, previewUrl }` —
 * `previewUrl` renders instantly as this component's own local preview state,
 * `key` is what `onChange` persists onto `item.image`) plus title / category /
 * year fields, up to two links, and a remove action. Mirrors `AvatarEditor`'s
 * upload + error handling.
 */
export function WorkItemEditor({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: WorkItem;
  index: number;
  onChange: (patch: Partial<WorkItem>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadWorkImage = useUploadImage("work-image");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Same ownership contract as `AvatarEditor`: `useUploadImage` drops the URL
  // from its own unmount sweep once it hands it over, so this component has to
  // revoke it. Doing that only in the replace/remove handlers leaked one
  // decoded image whenever the edit was discarded (or the row removed) with a
  // fresh preview still showing. Revoking an already-revoked URL is a no-op, so
  // the change-time cleanup is harmless alongside those handlers.
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  /** Replace (or, when `link` is undefined, drop) the link at `linkIndex`,
   *  keeping `item.links` compact (0-2 entries, no holes). */
  function setLinkAt(linkIndex: number, link: WorkLink | undefined) {
    const nextLinks = [...item.links];
    if (link) {
      nextLinks[linkIndex] = link;
    } else {
      nextLinks.splice(linkIndex, 1);
    }
    onChange({ links: nextLinks });
  }

  /** Shared tail of both upload paths (direct GIF path + post-reframe path). */
  async function uploadAndApply(file: File, crop?: CropRect) {
    setError(null);
    setUploading(true);
    try {
      const { key, previewUrl: newPreviewUrl } = await uploadWorkImage(file, {
        crop,
      });
      // Single-slot picker — the previous local preview (if any) is now
      // stale, so revoke it right away instead of leaving it to the hook's
      // unmount sweep.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(newPreviewUrl);
      onChange({ image: key });
    } catch (err) {
      setError(
        err instanceof ImageProcessingError
          ? t(err.i18nKey, err.values)
          : t("members:workItem.error.generic"),
      );
    } finally {
      setUploading(false);
    }
  }

  function pick(file: File) {
    // GIFs bypass the reframer entirely (animation would be destroyed by the
    // crop/re-encode path) and upload directly, as before.
    if (file.type === "image/gif") {
      void uploadAndApply(file);
      return;
    }
    setPendingFile(file);
  }

  async function handleCropConfirmed(crop: CropRect) {
    if (!pendingFile) return;
    const fileToUpload = pendingFile;
    setPendingFile(null);
    await uploadAndApply(fileToUpload, crop);
  }

  const displayedImage = previewUrl ?? item.image;

  return (
    <article className={styles.workCard}>
      <div className={editStyles.workImageWrap}>
        <ImageSlot
          tint={TINTS[index % 3]}
          src={displayedImage}
          height={200}
          radius={14}
          placeholder={t("members:workItem.imagePlaceholder")}
          style={{ marginBottom: 14 }}
        />
        <div className={editStyles.workImageActions}>
          <button
            type="button"
            className={editStyles.avatarBtn}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <FiCamera size={14} />
            {uploading
              ? t("members:workItem.uploading")
              : displayedImage
                ? t("members:workItem.change")
                : t("members:workItem.add")}
          </button>
          {displayedImage && !uploading && (
            <button
              type="button"
              className={`${editStyles.avatarBtn} ${editStyles.avatarBtnGhost}`}
              aria-label={t("members:workItem.removeImage")}
              onClick={() => {
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
                onChange({ image: undefined });
              }}
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className={editStyles.avatarError} role="alert">
          {error}
        </p>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        aria-label={t("members:workItem.change")}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />

      {pendingFile && (
        <PhotoReframeModal
          file={pendingFile}
          kind="work-image"
          onCancel={() => setPendingFile(null)}
          onConfirm={(crop) => void handleCropConfirmed(crop)}
        />
      )}

      <input
        className={`${editStyles.inlineInput} ${editStyles.workCatInput}`}
        value={item.category}
        placeholder={t("members:workItem.categoryPlaceholder")}
        aria-label={t("members:workItem.categoryLabel")}
        onChange={(e) => onChange({ category: e.target.value })}
      />
      <input
        className={`${editStyles.inlineInput} ${editStyles.workTitleInput}`}
        value={item.title}
        placeholder={t("members:workItem.titlePlaceholder")}
        aria-label={t("members:workItem.titleLabel")}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <WorkLinkField
        link={item.links[0]}
        ariaLabel={t("members:workItem.linkLabel")}
        placeholder={t("members:workItem.linkPlaceholder")}
        onChange={(link) => setLinkAt(0, link)}
      />
      <WorkSecondLinkSlot
        links={item.links}
        onChange={(link) => setLinkAt(1, link)}
      />
      <div className={editStyles.workMetaRow}>
        <input
          className={`${editStyles.inlineInput} ${editStyles.workYearInput}`}
          value={item.year}
          placeholder={t("members:workItem.yearPlaceholder")}
          aria-label={t("members:workItem.yearLabel")}
          onChange={(e) => onChange({ year: e.target.value })}
        />
        <button
          type="button"
          className={editStyles.workRemove}
          onClick={onRemove}
        >
          <FiTrash2 size={14} aria-hidden /> {t("members:workItem.remove")}
        </button>
      </div>
    </article>
  );
}
