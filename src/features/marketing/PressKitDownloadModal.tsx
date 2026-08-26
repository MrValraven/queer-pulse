import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type PressAsset } from "./pressKitAssets.data";
import styles from "./MarketingModal.module.css";

export interface PreviewRow {
  format: string;
  title: string;
  description: string;
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
  const [isDownloaded, setIsDownloaded] = useState(false);
  useScrollLock();

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${isDownloaded ? styles.modalSuccess : ""}`}
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

        {isDownloaded ? (
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
                {rows.map((row) => (
                  <div className={styles.previewRow} key={row.title}>
                    <div className={styles.previewIc}>{row.format}</div>
                    <div className={styles.previewInfo}>
                      <b>{row.title}</b>
                      <span>{row.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.foot}>
              <button type="button" className={styles.back} onClick={onClose}>
                {t("marketing:pressKit.modal.cancelCta")}
              </button>
              {/* A real, same-origin file fetch: the browser saves what the
                  static host serves, with its own MIME type, under the
                  asset's filename. No blob is synthesised here. */}
              <Button
                size="lg"
                href={asset.path}
                download={asset.filename}
                onClick={() => setIsDownloaded(true)}
              >
                {buttonLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
