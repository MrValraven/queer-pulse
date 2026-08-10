import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { API_BASE_URL } from "../../shared/api/config";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useMyMedia, useDeleteMyMedia } from "./api/useMyMedia";
import type { MyMediaItem } from "./api/myMedia.api";
import styles from "./MyUploadsPane.module.css";

export function MyUploadsPane() {
  const { t } = useTranslation();
  const { items, isLoading, isError, isDemo } = useMyMedia();
  const [pending, setPending] = useState<MyMediaItem | null>(null);
  const deleteMutation = useDeleteMyMedia();
  const { showToast } = useToast();

  if (isDemo) {
    return <p className={styles.notice}>{t("settings:uploads.demoOnly")}</p>;
  }
  if (isLoading) {
    return <p className={styles.notice}>{t("settings:uploads.loading")}</p>;
  }
  if (isError) {
    return <p className={styles.notice}>{t("settings:uploads.error")}</p>;
  }

  return (
    <>
      <section aria-labelledby="my-uploads-heading">
        <h2 id="my-uploads-heading" className={styles.heading}>
          {t("settings:uploads.title")}
        </h2>
        <p className={styles.intro}>{t("settings:uploads.intro")}</p>
        {items.length === 0 ? (
          <p className={styles.notice}>{t("settings:uploads.empty")}</p>
        ) : (
          <ul className={styles.grid}>
            {items.map((item) => (
              <MyUploadCard key={item.key} item={item} onRequestDelete={setPending} />
            ))}
          </ul>
        )}
      </section>
      <ConfirmDialog
        open={pending !== null}
        onClose={() => {
          if (!deleteMutation.isPending) setPending(null);
        }}
        onConfirm={() => {
          if (!pending) return;
          const key = pending.key;
          deleteMutation.mutate(key, {
            onSuccess: () => {
              setPending(null);
              showToast(t("settings:uploads.delete.toast.success"), "success");
            },
            onError: () => {
              showToast(t("settings:uploads.delete.toast.error"), "error");
            },
          });
        }}
        title={t("settings:uploads.delete.title")}
        description={
          pending?.inUse
            ? t("settings:uploads.delete.warnInUse", {
                where: pending.usedAs
                  ? t(`settings:uploads.usedAs.${pending.usedAs}`)
                  : t("settings:uploads.inUse"),
              })
            : t("settings:uploads.delete.confirm")
        }
        confirmLabel={t("settings:uploads.delete.cta")}
        cancelLabel={t("settings:uploads.delete.cancel")}
        tone="destructive"
        loading={deleteMutation.isPending}
      />
    </>
  );
}

function MyUploadCard({
  item,
  onRequestDelete,
}: {
  item: MyMediaItem;
  onRequestDelete: (item: MyMediaItem) => void;
}) {
  const { t } = useTranslation();
  return (
    <li className={styles.card}>
      <img
        className={styles.thumb}
        src={`${API_BASE_URL}${item.fileUrl}`}
        alt=""
        loading="lazy"
      />
      <div className={styles.meta}>
        <span className={styles.kind}>{t(`settings:uploads.kind.${item.kind}`)}</span>
        {item.inUse && <span className={styles.inUse}>{t("settings:uploads.inUse")}</span>}
      </div>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          className={styles.deleteBtn}
          onClick={() => onRequestDelete(item)}
        >
          <FiTrash2 aria-hidden />
          {t("settings:uploads.delete.button")}
        </Button>
      </div>
    </li>
  );
}
