import { AnimatePresence } from "motion/react";
import { useEffect, useId, useState } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowPairedDevice } from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemoteErrorLine } from "./QuizshowRemoteControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import remoteStyles from "./QuizshowRemote.module.css";
import styles from "./QuizshowRemotePairing.module.css";

/** "Screen", or the helper's name (a helper with no name left reads "Helper"). */
function useDeviceName(): (device: QuizshowPairedDevice) => string {
  const { t } = useTranslation();
  return (device) =>
    device.kind === "screen"
      ? t("quizshow:remote.devices.screen")
      : (device.helperName ?? t("quizshow:remote.devices.helper"));
}

function unpairLabelKeyOf(device: QuizshowPairedDevice): string {
  return device.kind === "screen"
    ? "quizshow:remote.devices.unpairScreen"
    : "quizshow:remote.devices.unpairHelper";
}

function DeviceRow({
  device,
  onUnpair,
}: {
  device: QuizshowPairedDevice;
  onUnpair: (device: QuizshowPairedDevice) => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const nameOf = useDeviceName();
  const nameId = useId();
  return (
    <div className={remoteStyles.row}>
      <div className={remoteStyles.rowBody}>
        <p id={nameId} className={remoteStyles.rowText}>
          {nameOf(device)}
        </p>
        <p className={remoteStyles.rowMeta}>
          <span
            className={
              device.isConnected
                ? `${remoteStyles.tag} ${remoteStyles.tagAccent}`
                : remoteStyles.tag
            }
          >
            {t(
              device.isConnected
                ? "quizshow:remote.devices.connected"
                : "quizshow:remote.devices.notConnected",
            )}
          </span>
          <span>
            {t("quizshow:remote.devices.pairedAt", {
              time: format.time(device.pairedAt),
            })}
          </span>
        </p>
      </div>
      <Button
        variant="stage-ghost"
        size="md"
        aria-describedby={nameId}
        onClick={() => onUnpair(device)}
      >
        {t(unpairLabelKeyOf(device))}
      </Button>
    </div>
  );
}

/**
 * The devices paired with this session (C6.5): each TV or helper, whether it
 * is connected and when it paired, with an unpair button behind a confirm
 * that sends `host:unpairDevice`. The hint says a server key change can undo
 * a pairing (risk 3), and what to do then. Once a confirmed unpair settles,
 * `onUnpaired` places focus, since the row that opened the dialog may be gone.
 */
export function QuizshowRemoteDevices({
  controller,
  devices,
  onUnpaired,
}: {
  controller: QuizshowSessionController;
  devices: readonly QuizshowPairedDevice[];
  onUnpaired: () => void;
}) {
  const { t } = useTranslation();
  const nameOf = useDeviceName();
  const titleId = useId();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const [unpairing, setUnpairing] = useState<QuizshowPairedDevice | null>(null);
  /** Confirmed unpairs that settled; each new one places focus once. */
  const [settledUnpairCount, setSettledUnpairCount] = useState(0);
  const isUnpairPending = isPending("host:unpairDevice");

  // Runs after the dialog starts leaving, so its own hand-back keeps this newer focus.
  // `onUnpaired` is a stable callback, so only a new settled unpair runs this.
  useEffect(() => {
    if (settledUnpairCount > 0) onUnpaired();
  }, [settledUnpairCount, onUnpaired]);

  const unpair = async (device: QuizshowPairedDevice) => {
    await run("host:unpairDevice", { pairingId: device.pairingId });
    // A refusal shows its line under the list, so the dialog closes either way.
    setUnpairing(null);
    setSettledUnpairCount((count) => count + 1);
  };

  return (
    <section className={remoteStyles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={remoteStyles.sectionTitle}>
        {t("quizshow:remote.devices.title")}
      </h2>
      <ul className={remoteStyles.list}>
        <AnimatePresence initial={false}>
          {devices.map((device) => (
            <CollapseListItem key={device.pairingId}>
              <DeviceRow device={device} onUnpair={setUnpairing} />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <p className={`${remoteStyles.hint} ${styles.keyHint}`}>
        {t("quizshow:remote.devices.keyHint")}
      </p>
      <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
      <AnimatePresence>
        {unpairing !== null && (
          <ConfirmDialog
            key="quizshow-remote-unpair"
            open
            tone="destructive"
            title={t("quizshow:remote.devices.confirm")}
            description={t(
              unpairing.kind === "screen"
                ? "quizshow:remote.devices.confirmScreenBody"
                : "quizshow:remote.devices.confirmHelperBody",
              { name: nameOf(unpairing) },
            )}
            confirmLabel={t(unpairLabelKeyOf(unpairing))}
            cancelLabel={t("quizshow:remote.devices.keepPaired")}
            loading={isUnpairPending}
            initialFocus="cancel"
            onClose={() => {
              if (!isUnpairPending) setUnpairing(null);
            }}
            onConfirm={() => {
              void unpair(unpairing);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
