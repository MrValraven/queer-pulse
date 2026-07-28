import { useEffect, useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Guest } from "./gatheringDashboard.data";
import styles from "./QrScanModal.module.css";

const SCAN_MS = 1400;

export function QrScanModal({
  guests,
  onCheckIn,
  onClose,
}: {
  guests: Guest[];
  onCheckIn: (name: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<Guest | null>(null);

  const pending = guests.filter((g) => g.status === "pending");

  const simulateScan = () => {
    if (pending.length === 0 || scanning) return;
    setScanning(true);
    const guest = pending[Math.floor(Math.random() * pending.length)]!;
    window.setTimeout(() => {
      onCheckIn(guest.name);
      setScanned(guest);
      setScanning(false);
    }, SCAN_MS);
  };

  if (scanned) {
    return (
      <div
        className={styles.overlay}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("gatherings:qr.success.ariaLabel")}
          className={styles.success}
        >
          <button
            type="button"
            className={styles.successClose}
            onClick={onClose}
            aria-label={t("gatherings:qr.closeAria")}
          >
            <FiX />
          </button>
          <div className={styles.successIcon}>
            <FiCheck />
          </div>
          <div className={styles.successTitle}>
            <Translation
              i18nKey="gatherings:qr.success.title"
              components={{ em: <em /> }}
            />
          </div>
          <div className={styles.guestRow}>
            <span
              className={styles.guestAv}
              style={{ background: scanned.background, color: scanned.color }}
            >
              {scanned.initials}
            </span>
            <div>
              <div className={styles.guestName}>{scanned.name}</div>
              <div className={styles.guestMeta}>
                {t("gatherings:qr.success.scannedMeta", {
                  pronouns: scanned.pronouns,
                })}
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="ghost-dark"
              onClick={() => setScanned(null)}
              disabled={pending.length <= 1}
            >
              {t("gatherings:qr.success.scanNextCta")}
            </Button>
            <Button variant="ghost-dark" onClick={onClose}>
              {t("gatherings:qr.success.doneCta")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("gatherings:qr.title")}
        className={styles.modal}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("gatherings:qr.closeAria")}
        >
          <FiX />
        </button>
        <div className={styles.eye}>{t("gatherings:qr.eyebrow")}</div>
        <div className={styles.title}>{t("gatherings:qr.title")}</div>

        <div className={styles.viewfinder}>
          <span className={`${styles.corner} ${styles.tl}`} />
          <span className={`${styles.corner} ${styles.tr}`} />
          <span className={`${styles.corner} ${styles.bl}`} />
          <span className={`${styles.corner} ${styles.br}`} />
          {scanning && <span className={styles.scanLine} />}
          <div className={styles.vfStack}>
            <span className={styles.vfIcon}>
              <MdQrCodeScanner />
            </span>
            <span className={styles.vfHint}>
              {scanning
                ? t("gatherings:qr.readingHint")
                : t("gatherings:qr.pointHint")}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          className={styles.full}
          onClick={simulateScan}
          disabled={scanning || pending.length === 0}
        >
          {scanning
            ? t("gatherings:qr.scanningCta")
            : pending.length === 0
              ? t("gatherings:qr.allCheckedInCta")
              : t("gatherings:qr.simulateCta")}
        </Button>
        <div className={styles.note}>{t("gatherings:qr.demoNote")}</div>
      </div>
    </div>
  );
}
