import { useEffect, useRef, useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";
import { Button, Modal, ModalSheet } from "../../shared/components/ui";
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
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<Guest | null>(null);
  // Hold the simulated-scan timer so it can't check a guest in after the modal
  // has closed / unmounted.
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(scanTimerRef.current), []);

  const pending = guests.filter((guest) => guest.status === "pending");

  const simulateScan = () => {
    if (pending.length === 0 || scanning) return;
    setScanning(true);
    const guest = pending[Math.floor(Math.random() * pending.length)]!;
    scanTimerRef.current = setTimeout(() => {
      onCheckIn(guest.name);
      setScanned(guest);
      setScanning(false);
    }, SCAN_MS);
  };

  if (scanned) {
    return (
      <ModalSheet
        success
        onClose={onClose}
        ariaLabel={t("gatherings:qr.success.ariaLabel")}
      >
        <div className={styles.success}>
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
      </ModalSheet>
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:qr.eyebrow")}
      title={t("gatherings:qr.title")}
      onClose={onClose}
    >
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
    </Modal>
  );
}
