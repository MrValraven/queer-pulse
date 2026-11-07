import { useState, type JSX } from "react";
import { AnimatePresence } from "motion/react";
import { FiAlertTriangle, FiMaximize } from "react-icons/fi";
import type {
  VjPackDTO,
  VjPreloadFailure,
  VjScreenClipStatus,
  VjScreenHealth,
  VjTempoSource,
} from "../../../shared/contracts/vj";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjConnectionRefusal } from "../realtime/vjTransport";
import { VJ_CONNECTION_REFUSAL_KEY } from "../vjErrors";
import type { VjMicTempoState } from "./useVjMicTempo";
import type { VjScreenEventCard } from "./useVjScreenEventCard";
import type { VjRendererState } from "./vjRendererKind";
import { VjScreenMicPanel } from "./VjScreenMicPanel";
import { VjScreenSetupFacts } from "./VjScreenSetupFacts";
import styles from "./VjScreen.module.css";

export interface VjScreenSetupCardProps {
  pack: VjPackDTO | null;
  statuses: readonly VjScreenClipStatus[];
  isOfflineStart: boolean;
  refusal: VjConnectionRefusal | null;
  isFullscreenSupported: boolean;
  onGoFullscreen: () => void;
  renderer: VjRendererState;
  /** The latest health reading; null until the renderer reports one. */
  health: VjScreenHealth | null;
  eventCard: Pick<
    VjScreenEventCard,
    "isUnlinked" | "unavailableReason" | "card"
  >;
  mic: VjMicTempoState;
  isLead: boolean;
  /** The stage tempo's source; null before the first state arrives. */
  tempoSource: VjTempoSource | null;
}

/** Each failure reason once, in the order the clips first name it. */
function failureCodesOf(
  statuses: readonly VjScreenClipStatus[],
): VjPreloadFailure[] {
  const codes: VjPreloadFailure[] = [];
  for (const status of statuses) {
    if (status.state !== "failed" || status.failure === null) continue;
    if (!codes.includes(status.failure)) codes.push(status.failure);
  }
  return codes;
}

function useProgressLine(
  pack: VjPackDTO | null,
  statuses: readonly VjScreenClipStatus[],
  isOfflineStart: boolean,
): string | null {
  const { t } = useTranslation();
  const readyCount = statuses.filter(
    (status) => status.state === "ready",
  ).length;
  if (isOfflineStart) {
    return t("vj:screen.offlineCached", { count: readyCount });
  }
  if (pack === null || statuses.length === 0) return null;
  if (readyCount === statuses.length) {
    return t("vj:screen.preloadDone", { total: statuses.length });
  }
  return t("vj:screen.preloadProgress", {
    ready: readyCount,
    total: statuses.length,
  });
}

/** The refusal line folds open and keeps its words while it folds away. */
function VjScreenRefusalLine({
  refusal,
}: {
  refusal: VjConnectionRefusal | null;
}): JSX.Element {
  const { t } = useTranslation();
  const [lastRefusal, setLastRefusal] = useState(refusal);
  if (refusal !== null && refusal !== lastRefusal) setLastRefusal(refusal);
  const shownRefusal = refusal ?? lastRefusal;
  return (
    <Collapse isOpen={refusal !== null}>
      <p className={styles.setupAlert} role="alert">
        <FiAlertTriangle aria-hidden="true" className={styles.setupAlertIcon} />
        {shownRefusal === null
          ? null
          : t(VJ_CONNECTION_REFUSAL_KEY[shownRefusal])}
      </p>
    </Collapse>
  );
}

/**
 * What the admin sees on the laptop before the show: the pack, how far the
 * preload got, which renderer draws and why, the frame rate, why the event
 * card stays hidden, every reason a clip could not load, why the connection
 * was refused, the one action, Go fullscreen, and the microphone tempo.
 */
export function VjScreenSetupCard({
  pack,
  statuses,
  isOfflineStart,
  refusal,
  isFullscreenSupported,
  onGoFullscreen,
  renderer,
  health,
  eventCard,
  mic,
  isLead,
  tempoSource,
}: VjScreenSetupCardProps): JSX.Element {
  const { t } = useTranslation();
  const progressLine = useProgressLine(pack, statuses, isOfflineStart);
  const failedCount = statuses.filter(
    (status) => status.state === "failed",
  ).length;
  const failureCodes = failureCodesOf(statuses);

  return (
    <section className={styles.setupCard} aria-labelledby="vj-screen-setup">
      <header className={styles.setupHeader}>
        <h1 id="vj-screen-setup" className={styles.setupTitle}>
          {t("vj:screen.setupTitle")}
        </h1>
        <p className={styles.setupHint}>{t("vj:screen.setupHint")}</p>
      </header>
      <div className={styles.setupFacts} role="status">
        <p className={styles.setupPack}>
          {pack === null
            ? t("vj:screen.noPack")
            : t("vj:screen.packName", { pack: pack.name })}
        </p>
        {progressLine === null ? null : (
          <p className={styles.setupLine}>{progressLine}</p>
        )}
        <VjScreenSetupFacts
          renderer={renderer}
          health={health}
          eventCard={eventCard}
        />
      </div>
      <Collapse isOpen={failedCount > 0}>
        <div className={styles.setupFailures}>
          <p className={styles.setupLine}>
            {t("vj:screen.preloadFailed", { count: failedCount })}
          </p>
          <ul className={styles.setupFailureList}>
            <AnimatePresence initial={false}>
              {failureCodes.map((code) => (
                <CollapseListItem key={code}>
                  <span className={styles.setupFailure}>
                    {t(`vj:preload.failure.${code}`)}
                  </span>
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </Collapse>
      <VjScreenRefusalLine refusal={refusal} />
      {isFullscreenSupported ? (
        <Button
          variant="stage"
          size="lg"
          className={styles.setupAction}
          onClick={onGoFullscreen}
        >
          <FiMaximize aria-hidden="true" />
          {t("vj:screen.goFullscreen")}
        </Button>
      ) : (
        <p className={styles.setupAlert} role="alert">
          <FiAlertTriangle
            aria-hidden="true"
            className={styles.setupAlertIcon}
          />
          {t("vj:screen.fullscreenUnsupported")}
        </p>
      )}
      <VjScreenMicPanel mic={mic} isLead={isLead} tempoSource={tempoSource} />
    </section>
  );
}
