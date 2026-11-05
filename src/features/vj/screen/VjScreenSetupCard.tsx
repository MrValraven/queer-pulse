import { useState, type JSX } from "react";
import { AnimatePresence } from "motion/react";
import { FiAlertTriangle, FiMaximize } from "react-icons/fi";
import type {
  VjPackDTO,
  VjPreloadFailure,
  VjScreenClipStatus,
} from "../../../shared/contracts/vj";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjConnectionRefusal } from "../realtime/vjTransport";
import { VJ_CONNECTION_REFUSAL_KEY } from "../vjErrors";
import styles from "./VjScreen.module.css";

export interface VjScreenSetupCardProps {
  pack: VjPackDTO | null;
  statuses: readonly VjScreenClipStatus[];
  isOfflineStart: boolean;
  refusal: VjConnectionRefusal | null;
  isFullscreenSupported: boolean;
  onGoFullscreen: () => void;
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
 * preload got, every reason a clip could not load, why the connection was
 * refused, and the one action, Go fullscreen.
 */
export function VjScreenSetupCard({
  pack,
  statuses,
  isOfflineStart,
  refusal,
  isFullscreenSupported,
  onGoFullscreen,
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
    </section>
  );
}
