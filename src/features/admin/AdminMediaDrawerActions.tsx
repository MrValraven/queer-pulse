import { FiCopy, FiExternalLink, FiTrash2, FiUser } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { absoluteFileUrl } from "./adminMedia.format";
import type {
  AdminMediaObject,
  AdminMediaUploader,
} from "./api/adminMedia.api";
import styles from "./AdminMediaPage.module.css";

/** The inspection drawer's footer action row: open the file, copy its
 *  presigned URL or raw key, filter the console by its uploader, run the
 *  on-demand real-content-type check, and delete. */
export function AdminMediaDrawerActions({
  object,
  uploader,
  isChecking,
  onInspectRealContentType,
  onCopy,
  onFilterByUploader,
  isDeletePending,
  onRequestDelete,
}: {
  object: AdminMediaObject;
  uploader: AdminMediaUploader | null;
  isChecking: boolean;
  onInspectRealContentType: () => void;
  onCopy: (value: string, confirmationLabel: string) => Promise<void>;
  onFilterByUploader: (uploader: AdminMediaUploader) => void;
  isDeletePending: boolean;
  onRequestDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.actions}>
      <a
        className={styles.actionLink}
        href={absoluteFileUrl(object.fileUrl)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FiExternalLink aria-hidden /> {t("admin:media.openFile")}
      </a>
      <Button
        variant="ghost"
        onClick={() =>
          void onCopy(object.presignedUrl, t("admin:media.copiedPresigned"))
        }
      >
        <FiCopy aria-hidden /> {t("admin:media.copyPresigned")}
      </Button>
      <Button
        variant="ghost"
        onClick={() => void onCopy(object.key, t("admin:media.copiedKey"))}
      >
        <FiCopy aria-hidden /> {t("admin:media.copyKey")}
      </Button>
      {uploader && (
        <Button variant="ghost" onClick={() => onFilterByUploader(uploader)}>
          <FiUser aria-hidden /> {t("admin:media.filterByUploader.showAll")}
        </Button>
      )}
      <Button
        variant="ghost"
        disabled={isChecking}
        onClick={onInspectRealContentType}
      >
        {isChecking
          ? t("shared:loading.label")
          : t("admin:media.inspectRealType")}
      </Button>
      <Button
        variant="danger"
        disabled={isDeletePending}
        onClick={onRequestDelete}
      >
        <FiTrash2 aria-hidden /> {t("admin:media.deleteFile")}
      </Button>
    </div>
  );
}
