import { useId, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiArchive,
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
import { StickerPackNames } from "./StickerPackNames";
import styles from "./StickerPackHeader.module.css";

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
  onRenamePt,
  onSetStatus,
  onDeletePack,
  isMutating,
  isRunWriting = false,
}: {
  pack: AdminStickerPackResponse;
  onRename: (name: string) => void;
  /** Saves the Portuguese name, or clears it with `null`. */
  onRenamePt: (namePt: string | null) => void;
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
          <StickerPackNames
            pack={pack}
            onRename={onRename}
            onRenamePt={onRenamePt}
          />
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
