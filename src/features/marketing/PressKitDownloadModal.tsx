import { useState, type ReactNode } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { downloadBlob } from "./downloadBlob";
import { type PressAsset } from "./pressKitAssets.data";
import styles from "./MarketingModal.module.css";

export interface PreviewRow {
  ic: string;
  title: string;
  desc: string;
}

export function PressKitDownloadModal({
  eyebrow,
  title,
  lead,
  rows,
  asset,
  preview,
  buttonLabel,
  onClose,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  rows?: PreviewRow[];
  asset: PressAsset;
  /** Optional custom preview node (e.g. a rendered logo stage). */
  preview?: ReactNode;
  buttonLabel: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  useScrollLock();

  const download = () => {
    downloadBlob(asset.filename, asset.content, asset.mime);
    setDone(true);
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${done ? styles.modalSuccess : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("marketing:pressKit.modal.dialogAriaLabel")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("marketing:pressKit.modal.closeAriaLabel")}
        >
          ×
        </button>

        {done ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12.5l4 4L19 7" />
              </svg>
            </div>
            <h2>
              <Translation
                i18nKey="marketing:pressKit.modal.success.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>
              <Translation
                i18nKey="marketing:pressKit.modal.success.body"
                components={{ b: <b /> }}
                values={{ filename: asset.filename }}
              />
            </p>
            <Button size="lg" variant="ghost-dark" onClick={onClose}>
              {t("marketing:pressKit.modal.closeCta")}
            </Button>
          </div>
        ) : (
          <div>
            <div className={styles.eye}>{eyebrow}</div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.lead}>{lead}</p>

            {preview}

            {rows && rows.length > 0 && (
              <div className={styles.previewList}>
                {rows.map((r) => (
                  <div className={styles.previewRow} key={r.title}>
                    <div className={styles.previewIc}>{r.ic}</div>
                    <div className={styles.previewInfo}>
                      <b>{r.title}</b>
                      <span>{r.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.foot}>
              <button type="button" className={styles.back} onClick={onClose}>
                {t("marketing:pressKit.modal.cancelCta")}
              </button>
              <Button size="lg" type="button" onClick={download}>
                {buttonLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
