import { FiAlertCircle, FiCheck, FiDownload, FiMaximize } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Translation } from "../../../shared/i18n/Translation";
import { useFormat } from "../../../shared/i18n/format";
import { formatClock, secondsLeft } from "./filmTime";
import {
  estimatedRenderMinutes,
  type MarketingVideo,
} from "./marketingVideos.data";
import type { RenderSupport } from "./render/captureApis";
import type { RenderState } from "./useFilmRender";
import styles from "./MarketingVideos.module.css";

interface RenderBarProps {
  video: MarketingVideo;
  title: string;
  titleId: string;
  state: RenderState;
  support: RenderSupport;
  isSoft: boolean;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onFullScreen: () => void;
  onClose: () => void;
}

/** The studio's status bar: what's happening, and what you can do next. */
export function MarketingVideoRenderBar(props: RenderBarProps) {
  const { t } = useTranslation();
  const { state, title, titleId } = props;
  return (
    <div className={styles.bar}>
      <div className={styles.barHead}>
        <p className={styles.barEyebrow}>
          {t("admin:marketingVideos.studio.eyebrow")}
        </p>
        <h2 id={titleId} className={styles.barTitle}>
          {t("admin:marketingVideos.studio.title", { title })}
        </h2>
      </div>
      {state.status === "idle" && <RenderReady {...props} />}
      {(state.status === "sharing" || state.status === "running") && (
        <RenderRunning state={state} onStop={props.onStop} />
      )}
      {state.status === "done" && (
        <RenderDone
          state={state}
          onReset={props.onReset}
          onClose={props.onClose}
        />
      )}
      {state.status === "failed" && (
        <RenderFailed
          state={state}
          onReset={props.onReset}
          onClose={props.onClose}
        />
      )}
    </div>
  );
}

function RenderReady({
  video,
  support,
  isSoft,
  canStart,
  onStart,
  onFullScreen,
  onClose,
}: RenderBarProps) {
  const { t } = useTranslation();
  if (!support.isSupported) {
    return (
      <div className={styles.barBody}>
        <p className={styles.barText} role="alert">
          {t("admin:marketingVideos.studio.unsupported")}
        </p>
        <div className={styles.barActions}>
          <Button variant="ghost-dark" onClick={onClose}>
            {t("admin:marketingVideos.studio.close")}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.barBody}>
      <p className={styles.barText}>
        {t("admin:marketingVideos.studio.intro", {
          minutes: estimatedRenderMinutes(video),
        })}
      </p>
      {isSoft && (
        <p className={styles.barHint}>
          {t("admin:marketingVideos.studio.soft")}
        </p>
      )}
      <div className={styles.barActions}>
        <Button onClick={onStart} disabled={!canStart}>
          {t("admin:marketingVideos.studio.start")}
        </Button>
        {isSoft && (
          <Button variant="ghost-dark" onClick={onFullScreen}>
            <FiMaximize aria-hidden />
            {t("admin:marketingVideos.studio.fullScreen")}
          </Button>
        )}
        <Button variant="ghost-dark" onClick={onClose}>
          {t("admin:marketingVideos.studio.close")}
        </Button>
      </div>
    </div>
  );
}

function RenderRunning({
  state,
  onStop,
}: {
  state: Extract<RenderState, { status: "sharing" | "running" }>;
  onStop: () => void;
}) {
  const { t } = useTranslation();
  const progress = state.status === "running" ? state.progress : null;
  const fraction =
    progress?.step === "frames"
      ? progress.done / progress.total
      : progress?.step === "finishing"
        ? 1
        : 0;
  const left =
    state.status === "running" && progress?.step === "frames"
      ? secondsLeft(progress.done, progress.total, state.elapsedSeconds)
      : null;
  const stepText =
    progress === null
      ? t("admin:marketingVideos.studio.step.sharing")
      : progress.step === "frames"
        ? t("admin:marketingVideos.studio.step.frames", {
            done: progress.done,
            total: progress.total,
          })
        : t(`admin:marketingVideos.studio.step.${progress.step}`);

  return (
    <div className={styles.barBody}>
      <p className={styles.barText} role="status">
        {stepText}
        {left !== null && (
          <span className={styles.barMeta}>
            {" · "}
            {t("admin:marketingVideos.studio.timeLeft", {
              time: formatClock(left),
            })}
          </span>
        )}
      </p>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={t("admin:marketingVideos.studio.progress")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
      >
        <span
          className={styles.progressFill}
          style={{ transform: `scaleX(${fraction})` }}
        />
      </div>
      <div className={styles.barActions}>
        <Button variant="ghost-dark" onClick={onStop}>
          {t("admin:marketingVideos.studio.stop")}
        </Button>
      </div>
    </div>
  );
}

function RenderDone({
  state,
  onReset,
  onClose,
}: {
  state: Extract<RenderState, { status: "done" }>;
  onReset: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { film, url } = state;
  const megabytes = format.number(film.blob.size / 1_000_000, {
    maximumFractionDigits: 1,
  });
  return (
    <div className={styles.barBody}>
      <p className={styles.doneTitle} role="status">
        <span className={styles.doneIcon}>
          <FiCheck aria-hidden />
        </span>
        <Translation
          i18nKey="admin:marketingVideos.studio.done.title"
          components={{ em: <em /> }}
        />
      </p>
      <p className={styles.barMeta}>
        {t("admin:marketingVideos.studio.done.meta", {
          size: `${megabytes} MB`,
          width: film.capturedWidth,
          height: film.capturedHeight,
        })}
      </p>
      {film.fileName.endsWith(".webm") && (
        <p className={styles.barHint}>
          {t("admin:marketingVideos.studio.done.notMp4")}
        </p>
      )}
      <div className={styles.barActions}>
        <Button href={url} download={film.fileName}>
          <FiDownload aria-hidden />
          {t("admin:marketingVideos.studio.done.download", {
            fileName: film.fileName,
          })}
        </Button>
        <Button variant="ghost-dark" onClick={onReset}>
          {t("admin:marketingVideos.studio.again")}
        </Button>
        <Button variant="ghost-dark" onClick={onClose}>
          {t("admin:marketingVideos.studio.close")}
        </Button>
      </div>
    </div>
  );
}

function RenderFailed({
  state,
  onReset,
  onClose,
}: {
  state: Extract<RenderState, { status: "failed" }>;
  onReset: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.barBody}>
      <p className={styles.barError} role="alert">
        <FiAlertCircle aria-hidden />
        {t(`admin:marketingVideos.studio.error.${state.reason}`)}
      </p>
      <div className={styles.barActions}>
        <Button onClick={onReset}>
          {t("admin:marketingVideos.studio.again")}
        </Button>
        <Button variant="ghost-dark" onClick={onClose}>
          {t("admin:marketingVideos.studio.close")}
        </Button>
      </div>
    </div>
  );
}
