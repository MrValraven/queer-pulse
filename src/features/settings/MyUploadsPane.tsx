import { useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  mediaReferenceHref,
  mediaReferenceLabelKey,
  type MediaReference,
} from "../../shared/media/mediaReferences";
import { useMyMedia, useDeleteMyMedia } from "./api/useMyMedia";
import { resolveMyMediaUrl, type MyMediaItem } from "./api/myMedia.api";
import styles from "./MyUploadsPane.module.css";

export function MyUploadsPane() {
  const { t } = useTranslation();
  const { items, isLoading, isError, isDemo, degraded } = useMyMedia();
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
        {degraded && (
          <p className={styles.degradedBanner} role="status">
            <FiAlertTriangle aria-hidden />
            {t("settings:uploads.degradedBanner")}
          </p>
        )}
        {items.length === 0 ? (
          <p className={styles.notice}>{t("settings:uploads.empty")}</p>
        ) : (
          <ul className={styles.grid}>
            {items.map((item) => (
              <MyUploadCard
                key={item.key}
                item={item}
                degraded={degraded}
                onRequestDelete={setPending}
              />
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
          pending && pending.references.length > 0
            ? t("settings:uploads.delete.warnInUse", {
                count: pending.references.length,
              })
            : t("settings:uploads.delete.confirm")
        }
        confirmLabel={t("settings:uploads.delete.cta")}
        cancelLabel={t("settings:uploads.delete.cancel")}
        tone="destructive"
        loading={deleteMutation.isPending}
      >
        {pending && pending.references.length > 0 && (
          <UploadReferenceList references={pending.references} />
        )}
      </ConfirmDialog>
    </>
  );
}

function UploadReferenceList({ references }: { references: MediaReference[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.referenceList}>
      <p className={styles.referenceListHeading}>
        {t("settings:uploads.delete.usedInHeading")}
      </p>
      <ul className={styles.referenceItems}>
        {references.map((reference, index) => {
          const href = mediaReferenceHref(reference);
          const label = t(mediaReferenceLabelKey(reference.type));
          const text = reference.label ? `${label}: ${reference.label}` : label;
          return (
            <li key={`${reference.type}-${reference.entityId}-${index}`}>
              {href ? <Link to={href}>{text}</Link> : <span>{text}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MyUploadCard({
  item,
  degraded,
  onRequestDelete,
}: {
  item: MyMediaItem;
  degraded: boolean;
  onRequestDelete: (item: MyMediaItem) => void;
}) {
  const { t } = useTranslation();
  return (
    <li className={styles.card}>
      <img
        className={styles.thumb}
        src={resolveMyMediaUrl(item.fileUrl)}
        alt=""
        loading="lazy"
      />
      <div className={styles.meta}>
        <span className={styles.kind}>{t(`settings:uploads.kind.${item.kind}`)}</span>
        {item.references.length > 0 ? (
          <span className={styles.inUse}>
            {t("settings:uploads.inUseCount", { count: item.references.length })}
          </span>
        ) : degraded ? (
          // A reference check failed, so "no references" isn't authoritative —
          // present it as unverified rather than reassuring.
          <span className={styles.unverified}>
            {t("settings:uploads.unverified")}
          </span>
        ) : (
          <span className={styles.notReferenced}>
            {t("settings:uploads.notReferenced")}
          </span>
        )}
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
