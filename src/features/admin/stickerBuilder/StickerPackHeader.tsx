import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { IconType } from "react-icons";
import {
  FiArchive,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiImage,
  FiRadio,
  FiRotateCcw,
} from "react-icons/fi";
import { Button, ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import { AdminChip } from "../ui";
import type { PackStatus } from "./stickerBuilder.types";
import { StickerPackMenu } from "./StickerPackMenu";
import styles from "./StickerPackHeader.module.css";

const MAX_PACK_NAME_LENGTH = 80;

const STATUS_TONE: Record<PackStatus, "plum" | "jade" | "ghost"> = {
  draft: "plum",
  published: "jade",
  archived: "ghost",
};

const STATUS_EXPLAINER_ICON: Record<PackStatus, IconType> = {
  draft: FiEyeOff,
  published: FiRadio,
  archived: FiArchive,
};

/** The one status move the header offers per status, and the dialog keys
 *  that name its consequence. Archive lives in the overflow menu. */
const STATUS_ACTION: Record<
  PackStatus,
  {
    target: PackStatus;
    icon: IconType;
    key: "publish" | "unpublish" | "restore";
  }
> = {
  draft: { target: "published", icon: FiEye, key: "publish" },
  published: { target: "draft", icon: FiEyeOff, key: "unpublish" },
  archived: { target: "draft", icon: FiRotateCcw, key: "restore" },
};

/**
 * The top of the pack workspace: which pack this is (cover, name, slug,
 * size, status), what that status means for members in one plain line, and
 * the single status move that makes sense next. The button is the secondary
 * variant on purpose, because the publish bar owns the view's one filled
 * primary. Every status move goes through a `ConfirmDialog` that names the
 * consequence; the rarer archive and delete sit in `StickerPackMenu`.
 */
export function StickerPackHeader({
  pack,
  onRename,
  onSetStatus,
  onDeletePack,
  isMutating,
  isRunWriting = false,
}: {
  pack: AdminStickerPackResponse;
  onRename: (name: string) => void;
  onSetStatus: (status: PackStatus) => void;
  onDeletePack: () => void;
  isMutating: boolean;
  /** A publish run is writing stickers to this pack right now, so archive
   *  and delete wait for it (a delete would fail every flag still queued). */
  isRunWriting?: boolean;
}) {
  const { t } = useTranslation();
  const blockedReasonId = useId();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const stickerCount = pack.stickers.length;
  const coverSticker =
    pack.stickers.find((sticker) => sticker.id === pack.coverStickerId) ??
    pack.stickers[0] ??
    null;
  const action = STATUS_ACTION[pack.status];
  const ActionIcon = action.icon;
  const ExplainerIcon = STATUS_EXPLAINER_ICON[pack.status];
  const isPublishBlocked = action.key === "publish" && stickerCount === 0;
  const isActionUnavailable = isPublishBlocked || isMutating;

  return (
    <header className={styles.header} data-status={pack.status}>
      <div className={styles.identity}>
        <div className={styles.thumbnail} aria-hidden>
          {coverSticker ? (
            <img
              className={styles.thumbnailImage}
              src={coverSticker.url}
              alt=""
              width={coverSticker.width}
              height={coverSticker.height}
            />
          ) : (
            <FiImage className={styles.thumbnailPlaceholder} />
          )}
        </div>

        <div className={styles.titleBlock}>
          <PackTitle pack={pack} onRename={onRename} />
          <p className={styles.meta}>
            <span className={styles.slug}>{pack.slug}</span>
            <span className={styles.separator} aria-hidden />
            <span>
              {t("admin:stickerPacks.header.stickerCount", {
                count: stickerCount,
              })}
            </span>
            <span className={styles.separator} aria-hidden />
            <AdminChip tone={STATUS_TONE[pack.status]} dot>
              {t(`admin:stickerPacks.status.${pack.status}`)}
            </AdminChip>
          </p>
          <p className={styles.explainer}>
            <ExplainerIcon className={styles.explainerIcon} aria-hidden />
            {t(`admin:stickerPacks.header.explainer.${pack.status}`)}
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.actionStack}>
          <Button
            variant="ghost"
            aria-disabled={isActionUnavailable || undefined}
            aria-describedby={isPublishBlocked ? blockedReasonId : undefined}
            onClick={() => {
              if (!isActionUnavailable) setIsConfirmOpen(true);
            }}
          >
            <ActionIcon aria-hidden />
            {t(`admin:stickerPacks.header.action.${action.key}`)}
          </Button>
          {isPublishBlocked && (
            <p id={blockedReasonId} className={styles.blockedReason}>
              {t("admin:stickerPacks.detail.publishBlocked")}
            </p>
          )}
        </div>
        <StickerPackMenu
          pack={pack}
          onArchive={() => onSetStatus("archived")}
          onDeletePack={onDeletePack}
          isMutating={isMutating}
          isRunWriting={isRunWriting}
        />
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          onSetStatus(action.target);
        }}
        loading={isMutating}
        title={t(`admin:stickerPacks.header.${action.key}Confirm.title`, {
          name: pack.name,
        })}
        description={
          action.key === "publish"
            ? t("admin:stickerPacks.header.publishConfirm.body", {
                count: stickerCount,
              })
            : t(`admin:stickerPacks.header.${action.key}Confirm.body`)
        }
        confirmLabel={t(`admin:stickerPacks.header.action.${action.key}`)}
      />
    </header>
  );
}

/**
 * The pack name as an inline-editable title. At rest it is a button that
 * reads as the heading with a pencil beside it; activating it swaps in a text
 * input. Enter or leaving the field saves a changed, non-empty name; Escape
 * (or an empty field) puts the old name back. Editing is tied to the pack id,
 * so switching packs mid-edit drops the draft and leaves the new pack alone.
 */
function PackTitle({
  pack,
  onRename,
}: {
  pack: AdminStickerPackResponse;
  onRename: (name: string) => void;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState(pack.name);
  const titleButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const hasFinishedRef = useRef(false);
  const isEditing = editingPackId === pack.id;

  // Focus follows the swap both ways: into the input (text selected, ready to
  // overwrite) when editing starts, and back to the title after Enter or
  // Escape. A blur save leaves focus wherever the admin clicked.
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
      return;
    }
    if (!shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    titleButtonRef.current?.focus();
  }, [isEditing]);

  function startEditing() {
    hasFinishedRef.current = false;
    setDraftName(pack.name);
    setEditingPackId(pack.id);
  }

  // Guarded by a ref so the blur that can follow an Enter or Escape (the
  // input unmounting under focus, still running the old render's handler)
  // cannot save a second time or undo an Escape.
  function finishEditing(shouldSave: boolean, shouldRestoreFocus: boolean) {
    if (!isEditing || hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    const trimmedName = draftName.trim();
    const isSaveable =
      trimmedName.length > 0 &&
      trimmedName.length <= MAX_PACK_NAME_LENGTH &&
      trimmedName !== pack.name;
    shouldRestoreFocusRef.current = shouldRestoreFocus;
    setEditingPackId(null);
    if (shouldSave && isSaveable) onRename(trimmedName);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      finishEditing(true, true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finishEditing(false, true);
    }
  }

  if (isEditing) {
    return (
      <div className={styles.titleEditor}>
        <input
          ref={inputRef}
          className={styles.titleInput}
          type="text"
          value={draftName}
          maxLength={MAX_PACK_NAME_LENGTH}
          aria-label={t("admin:stickerPacks.header.nameInputLabel")}
          aria-describedby={hintId}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => finishEditing(true, false)}
        />
        <p id={hintId} className={styles.titleHint}>
          {t("admin:stickerPacks.header.renameHint")}
        </p>
      </div>
    );
  }

  return (
    <h2 className={styles.title}>
      <button
        ref={titleButtonRef}
        type="button"
        className={styles.titleButton}
        aria-label={t("admin:stickerPacks.header.renameLabel", {
          name: pack.name,
        })}
        onClick={startEditing}
      >
        <span className={styles.titleText}>{pack.name}</span>
        <FiEdit2 className={styles.titleEditIcon} aria-hidden />
      </button>
    </h2>
  );
}
