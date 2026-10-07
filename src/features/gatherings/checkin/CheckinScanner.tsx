import { useEffect, useRef, useState } from "react";
import { Button, FormField, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cardTokenFromScan } from "./cardScan";
import { CheckinViewfinder } from "./CheckinViewfinder";
import type { ShownResult } from "./CheckinScanResult";
import {
  createScanGate,
  SCAN_RESULT_VISIBLE_MS,
  type ScanOutcome,
} from "./scanOutcome";
import { useCameraScan } from "./useCameraScan";
import styles from "./CheckinScanner.module.css";

const CORNERS_SNAP_MS = 120;
const UNDONE_VISIBLE_MS = 1500;

/**
 * A scanner that stays open between guests. Each read card shows a result
 * card for SCAN_RESULT_VISIBLE_MS, then the camera is ready for the next one.
 */
export function CheckinScanner({
  onCardToken,
  onUndo,
  onClose,
}: {
  /** Resolves with what happened. A rejection is shown as a refusal. */
  onCardToken: (cardToken: string) => Promise<ScanOutcome>;
  /** May resolve with false when the undo failed; void keeps the optimistic confirmation. */
  onUndo: (memberSlug: string) => void | Promise<boolean>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [typedCode, setTypedCode] = useState("");
  const [result, setResult] = useState<ShownResult | null>(null);
  const [isCornersSnapped, setIsCornersSnapped] = useState(false);
  const gateRef = useRef(createScanGate());
  const isBusyRef = useRef(false);
  const typedCodeInputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<number | undefined>(undefined);
  const snapTimerRef = useRef<number | undefined>(undefined);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      window.clearTimeout(hideTimerRef.current);
      window.clearTimeout(snapTimerRef.current);
    };
  }, []);

  const dismissResult = () => {
    window.clearTimeout(hideTimerRef.current);
    setResult(null);
    isBusyRef.current = false;
  };

  const showUndone = () => {
    setResult({ kind: "undone" });
    // The Undo button unmounts with its card; keep focus inside the dialog.
    typedCodeInputRef.current?.focus();
    hideTimerRef.current = window.setTimeout(dismissResult, UNDONE_VISIBLE_MS);
  };

  /**
   * Swaps the card for a short confirmation once the undo succeeds. The
   * scanner stays busy from the press until the confirmation clears, so a scan
   * in between cannot be accepted or have its card dismissed by this timer.
   */
  const handleUndo = (memberSlug: string) => {
    isBusyRef.current = true;
    window.clearTimeout(hideTimerRef.current);
    const undoOutcome = onUndo(memberSlug);
    if (!undoOutcome) {
      showUndone();
      return;
    }
    void undoOutcome.then(
      (isUndone) => {
        if (!isMountedRef.current) return;
        if (isUndone) showUndone();
        else dismissResult();
      },
      () => {
        if (isMountedRef.current) dismissResult();
      },
    );
  };

  /** Returns true when the token was read and not refused. */
  const handleToken = async (
    token: string,
    isTyped = false,
  ): Promise<boolean> => {
    if (isBusyRef.current) return false;
    if (!isTyped && !gateRef.current.shouldAccept(token, Date.now())) {
      return false;
    }
    isBusyRef.current = true;
    setIsCornersSnapped(true);
    snapTimerRef.current = window.setTimeout(
      () => setIsCornersSnapped(false),
      CORNERS_SNAP_MS,
    );
    let outcome: ScanOutcome;
    try {
      outcome = await onCardToken(token);
    } catch {
      outcome = { kind: "refused", message: t("gatherings:door.failedToast") };
    }
    if (!isMountedRef.current) return true;
    if (outcome.kind === "closed") {
      onClose();
      return true;
    }
    setResult(outcome);
    hideTimerRef.current = window.setTimeout(
      dismissResult,
      SCAN_RESULT_VISIBLE_MS,
    );
    return outcome.kind !== "refused";
  };

  const { videoRef, state } = useCameraScan(true, (token) => {
    void handleToken(token);
  });

  const submitTyped = () => {
    const token = cardTokenFromScan(typedCode);
    if (!token || isBusyRef.current) return;
    void handleToken(token, true).then((isAccepted) => {
      if (isAccepted && isMountedRef.current) setTypedCode("");
    });
  };

  const isBusy = result !== null;
  const isCameraLive = state === "scanning" || state === "starting";
  const readyHiddenClass = isCameraLive ? styles.readyHidden : styles.readyOff;

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
      <CheckinViewfinder
        videoRef={videoRef}
        state={state}
        isCornersSnapped={isCornersSnapped}
        result={result}
        onDismiss={dismissResult}
        onUndo={handleUndo}
      />
      <p
        className={`${styles.ready} ${
          state === "scanning" && !result ? "" : readyHiddenClass
        }`}
      >
        {t("gatherings:checkin.scan.ready")}
      </p>

      <FormField
        label={t("gatherings:door.scan.codeLabel")}
        helper={t("gatherings:door.scan.codeHelper")}
      >
        <input
          ref={typedCodeInputRef}
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
        disabled={isBusy || typedCode.trim() === ""}
        onClick={submitTyped}
      >
        {t("gatherings:door.scan.checkInCta")}
      </Button>
    </Modal>
  );
}
