import { useEffect, useState } from "react";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import styles from "./GatheringModals.module.css";

export function DownloadAlbumModal({
  photoCount,
  onClose,
}: {
  photoCount: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  useScrollLock();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        // Only allow dismissing once the album is ready.
        if (ready && e.target === e.currentTarget) onClose();
      }}
    >
      {ready ? (
        <GatheringSuccessPanel
          title={
            <Translation
              i18nKey="gatherings:album.success.title"
              components={{ em: <em /> }}
            />
          }
          sub={
            <Translation
              i18nKey="gatherings:album.success.sub"
              values={{ count: photoCount }}
              components={{ b: <b /> }}
            />
          }
          meta={t("gatherings:album.success.meta", { count: photoCount })}
          onClose={onClose}
          closeLabel={t("gatherings:album.success.doneCta")}
        />
      ) : (
        <div className={styles.loadingPanel} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden />
          <div className={styles.loadingTitle}>
            {t("gatherings:album.loading.title")}
          </div>
          <p className={styles.loadingSub}>
            {t("gatherings:album.loading.sub", { count: photoCount })}
          </p>
        </div>
      )}
    </div>
  );
}
