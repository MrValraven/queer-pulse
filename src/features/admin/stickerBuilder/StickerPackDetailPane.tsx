import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  AdminStickerPackResponse,
  StickerResponse,
} from "../../../shared/contracts/contracts";
import styles from "./stickerBuilder.module.css";

type PackStatus = AdminStickerPackResponse["status"];

const STATUS_ORDER: PackStatus[] = ["draft", "published", "archived"];

/**
 * The selected pack's own state: the stickers already published into it
 * (delete each), which one is the cover, and the draft/published/archived
 * status. Publishing an empty pack is refused by the backend, so that
 * transition is disabled here with the reason in its `title`.
 */
export function StickerPackDetailPane({
  pack,
  onDeleteSticker,
  onSetCover,
  onSetStatus,
  isMutatingPack,
}: {
  pack: AdminStickerPackResponse;
  onDeleteSticker: (sticker: StickerResponse) => void;
  onSetCover: (stickerId: string) => void;
  onSetStatus: (status: PackStatus) => void;
  isMutatingPack: boolean;
}) {
  const { t } = useTranslation();
  const hasStickers = pack.stickers.length > 0;

  return (
    <div className={styles.detailPane}>
      <h3 className={styles.detailHeading}>
        {t("admin:stickerPacks.detail.heading", { name: pack.name })}
      </h3>

      <div
        className={styles.statusRow}
        role="group"
        aria-label={t("admin:stickerPacks.detail.statusLabel")}
      >
        {STATUS_ORDER.map((status) => {
          const isPublishBlocked = status === "published" && !hasStickers;
          return (
            <Button
              key={status}
              variant={pack.status === status ? "primary" : "ghost"}
              size="sm"
              disabled={isMutatingPack || isPublishBlocked}
              title={
                isPublishBlocked
                  ? t("admin:stickerPacks.detail.publishBlocked")
                  : undefined
              }
              onClick={() => onSetStatus(status)}
            >
              {t(`admin:stickerPacks.status.${status}`)}
            </Button>
          );
        })}
      </div>

      {hasStickers ? (
        <ul className={styles.stickerList}>
          {pack.stickers.map((sticker) => {
            const coverInputId = `sticker-pack-cover-${sticker.id}`;
            return (
              <li key={sticker.id} className={styles.stickerRow}>
                <img className={styles.stickerThumb} src={sticker.url} alt="" />
                <span className={styles.stickerLabel}>{sticker.label}</span>
                <label className={styles.coverOption} htmlFor={coverInputId}>
                  <input
                    id={coverInputId}
                    type="radio"
                    name="sticker-pack-cover"
                    checked={pack.coverStickerId === sticker.id}
                    onChange={() => onSetCover(sticker.id)}
                  />
                  {t("admin:stickerPacks.detail.setCover")}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSticker(sticker)}
                >
                  {t("admin:stickerPacks.detail.deleteSticker")}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.detailEmpty}>
          {t("admin:stickerPacks.detail.empty")}
        </p>
      )}
    </div>
  );
}
