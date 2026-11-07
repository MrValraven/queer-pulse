import { useState, type CSSProperties, type JSX } from "react";
import { FiAlertTriangle, FiMic, FiMicOff } from "react-icons/fi";
import type { VjTempoSource } from "../../../shared/contracts/vj";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjMicFailure } from "../engine/tempo/vjMicInput";
import type { VjMicTempoState } from "./useVjMicTempo";
import styles from "./VjScreenMicPanel.module.css";

export interface VjScreenMicPanelProps {
  mic: VjMicTempoState;
  isLead: boolean;
  /** The stage tempo's source; null before the first state arrives. */
  tempoSource: VjTempoSource | null;
}

/** The meter and the tempo line while the mic listens. */
function VjMicReading({ mic }: { mic: VjMicTempoState }): JSX.Element {
  const { t, language } = useTranslation();
  const percent = Math.round(Math.min(1, Math.max(0, mic.level)) * 100);
  const report = mic.report;
  const tempoLine =
    report === null || report.bpm === null
      ? t("vj:screen.mic.searching")
      : t("vj:screen.mic.listening", {
          bpm: new Intl.NumberFormat(language, {
            maximumFractionDigits: 1,
          }).format(report.bpm),
          confidence: Math.round(report.confidence * 100),
        });
  const meterStyle = { "--vj-mic-level": mic.level } as CSSProperties;
  return (
    <div className={styles.reading}>
      <div
        className={styles.meter}
        role="meter"
        aria-label={t("vj:screen.mic.level")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        style={meterStyle}
      >
        <span className={styles.meterFill} />
      </div>
      <p className={styles.line}>{tempoLine}</p>
    </div>
  );
}

/** The failure line folds open and keeps its words while it folds away. */
function VjMicFailureLine({
  failure,
}: {
  failure: VjMicFailure | null;
}): JSX.Element {
  const { t } = useTranslation();
  const [lastFailure, setLastFailure] = useState(failure);
  if (failure !== null && failure !== lastFailure) setLastFailure(failure);
  const shownFailure = failure ?? lastFailure;
  return (
    <Collapse isOpen={failure !== null}>
      <p className={styles.alert} role="alert">
        <FiAlertTriangle aria-hidden="true" className={styles.alertIcon} />
        {shownFailure === null
          ? null
          : t(`vj:screen.mic.failure.${shownFailure}`)}
      </p>
    </Collapse>
  );
}

/**
 * The setup card's microphone section: the one place that asks for the mic.
 * It shows the level, the detected tempo, why the tempo is not followed yet
 * (a follower screen, or the remote on another tempo source), and the named
 * reason when the mic cannot start.
 */
export function VjScreenMicPanel({
  mic,
  isLead,
  tempoSource,
}: VjScreenMicPanelProps): JSX.Element {
  const { t } = useTranslation();
  const isOn = mic.status === "starting" || mic.status === "listening";
  const isListening = mic.status === "listening";
  const isStarting = mic.status === "starting";
  const shouldShowPickOnRemote = isLead && isListening && tempoSource !== "mic";

  return (
    <section className={styles.panel} aria-labelledby="vj-screen-mic">
      <div className={styles.head}>
        <h2 id="vj-screen-mic" className={styles.title}>
          {t("vj:screen.mic.title")}
        </h2>
        <p className={styles.hint}>{t("vj:screen.mic.hint")}</p>
      </div>
      <Button
        variant="stage-ghost"
        size="md"
        className={styles.toggle}
        aria-pressed={isOn}
        onClick={isOn ? mic.stop : mic.start}
      >
        {isOn ? <FiMicOff aria-hidden="true" /> : <FiMic aria-hidden="true" />}
        {t(isOn ? "vj:screen.mic.stop" : "vj:screen.mic.start")}
      </Button>
      <div role="status">
        {/* The browser's prompt and the analyser can take seconds to start. */}
        <Collapse isOpen={isStarting}>
          <p className={styles.note} data-vj-mic-starting="">
            {t("vj:screen.mic.starting")}
          </p>
        </Collapse>
        <Collapse isOpen={isListening}>
          <VjMicReading mic={mic} />
        </Collapse>
      </div>
      <Collapse isOpen={!isLead}>
        <p className={styles.note}>{t("vj:screen.mic.followerOnly")}</p>
      </Collapse>
      <Collapse isOpen={shouldShowPickOnRemote}>
        <p className={styles.note}>{t("vj:screen.mic.pickOnRemote")}</p>
      </Collapse>
      <VjMicFailureLine failure={mic.failure} />
    </section>
  );
}
