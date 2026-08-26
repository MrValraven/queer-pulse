import { useState } from "react";
import { MdQrCodeScanner } from "react-icons/md";
import { Button, FormField, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cardTokenFromScan } from "./cardScan";
import { useCameraScan } from "./useCameraScan";
import styles from "../QrScanModal.module.css";

/**
 * Reading a member's card at the door (LOC-03).
 *
 * TWO REAL WAYS IN, NO SIMULATION. Where the browser can read a QR from a live
 * camera it does, and the code it reads is the card's own permanent one, the
 * same credential `GET /cards/verify/:token` resolves. Where it cannot (Safari
 * and every iOS browser today), the host types or pastes the code off the card
 * instead. Both paths hand the same string to the same endpoint, which decides
 * whether the card is still good: a revoked card opens no door.
 *
 * The old modal here picked a random pending guest, waited 1.4 seconds and
 * declared them checked in. Nothing in this one invents a person.
 */
export function DoorScanModal({
  onToken,
  isPending,
  errorMessage,
  onClose,
}: {
  onToken: (cardToken: string) => void;
  isPending: boolean;
  /** What the last attempt failed with, shown in place under the field. */
  errorMessage: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [typedCode, setTypedCode] = useState("");
  const { videoRef, state } = useCameraScan(true, onToken);

  const submitTyped = () => {
    const token = cardTokenFromScan(typedCode);
    if (!token || isPending) return;
    onToken(token);
    setTypedCode("");
  };

  return (
    <Modal
      eyebrow={t("gatherings:door.scan.eyebrow")}
      title={t("gatherings:door.scan.title")}
      onClose={onClose}
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t("gatherings:door.scan.doneCta")}
        </Button>
      }
    >
      {state === "scanning" || state === "starting" ? (
        <div className={styles.viewfinder}>
          <span className={`${styles.corner} ${styles.tl}`} />
          <span className={`${styles.corner} ${styles.tr}`} />
          <span className={`${styles.corner} ${styles.bl}`} />
          <span className={`${styles.corner} ${styles.br}`} />
          <video
            ref={videoRef}
            className={styles.video}
            muted
            playsInline
            aria-label={t("gatherings:door.scan.viewfinderAria")}
          />
          <div className={styles.vfStack}>
            <span className={styles.vfHint}>
              {state === "starting"
                ? t("gatherings:door.scan.startingHint")
                : t("gatherings:door.scan.pointHint")}
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.viewfinder}>
          <div className={styles.vfStack}>
            <span className={styles.vfIcon}>
              <MdQrCodeScanner />
            </span>
            <span className={styles.vfHint}>
              {t(
                state === "denied"
                  ? "gatherings:door.scan.deniedHint"
                  : state === "unsupported"
                    ? "gatherings:door.scan.unsupportedHint"
                    : "gatherings:door.scan.failedHint",
              )}
            </span>
          </div>
        </div>
      )}

      <FormField
        label={t("gatherings:door.scan.codeLabel")}
        helper={t("gatherings:door.scan.codeHelper")}
        error={errorMessage ?? undefined}
      >
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          value={typedCode}
          placeholder={t("gatherings:door.scan.codePlaceholder")}
          onChange={(event) => setTypedCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitTyped();
            }
          }}
        />
      </FormField>
      <Button
        variant="primary"
        className={styles.full}
        disabled={isPending || typedCode.trim() === ""}
        onClick={submitTyped}
      >
        {isPending
          ? t("gatherings:door.scan.checkingCta")
          : t("gatherings:door.scan.checkInCta")}
      </Button>
    </Modal>
  );
}
