import { AnimatePresence, m } from "motion/react";
import { useId, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiPause, FiPlayCircle, FiUsers } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { Button } from "../../../shared/components/ui/Button";
import { Sending, Spinner } from "../../../shared/components/ui/Spinner";
import type { QuizshowJoinPreview } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useQuizshowJoinPreview } from "../api/useQuizshowPublic";
import { quizshowPlayPath } from "../quizshowPaths";
import styles from "./QuizshowPlay.module.css";

const STATUS_LINES: Record<
  QuizshowJoinPreview["status"],
  { key: string; icon: IconType }
> = {
  lobby: { key: "quizshow:player.preview.status.lobby", icon: FiUsers },
  running: {
    key: "quizshow:player.preview.status.running",
    icon: FiPlayCircle,
  },
  paused: { key: "quizshow:player.preview.status.paused", icon: FiPause },
};

/** The statuses whose copy says the code itself is the problem; a retry cannot help. */
const FINAL_ERROR_STATUSES: ReadonlySet<number> = new Set([404, 410]);

/** The copy key that names why the preview failed (C5.1 refusals, then the transport). */
function joinPreviewErrorKeyOf(error: unknown): string {
  const code = quizshowErrorCodeOf(error);
  if (code !== null) return quizshowErrorKeyOf(code);
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return quizshowErrorKeyOf("quizshow_join_code_not_found");
    }
    if (error.status === 410) {
      return quizshowErrorKeyOf("quizshow_session_finished");
    }
    if (error.status === 429) return "quizshow:errors.rate_limited";
    return "quizshow:errors.server_unavailable";
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "quizshow:errors.offline";
  }
  return "quizshow:errors.server_unavailable";
}

function isFinalPreviewError(error: unknown): boolean {
  const code = quizshowErrorCodeOf(error);
  if (
    code === "quizshow_join_code_not_found" ||
    code === "quizshow_session_finished"
  ) {
    return true;
  }
  return error instanceof ApiError && FINAL_ERROR_STATUSES.has(error.status);
}

/** The card's loading, error and ready states cross-fade; instant under reduced motion. */
function StateFade({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.2,
        ease: [0.22, 0.68, 0.16, 1],
      }}
    >
      {children}
    </m.div>
  );
}

interface PreviewErrorProps {
  errorKey: string;
  /** Retry is offered when the cause may pass (rate limit, server, offline). */
  onRetry: (() => void) | null;
  /** A retry is on its way: the button reads as pending and ignores taps. */
  isRetrying: boolean;
}

function PreviewError({ errorKey, onRetry, isRetrying }: PreviewErrorProps) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.endStack} ${styles.sheet}`}>
      <h1 className={styles.title} role="alert">
        {t(errorKey)}
      </h1>
      <div className={styles.actions}>
        {onRetry !== null && (
          <Button
            variant="stage"
            size="lg"
            aria-disabled={isRetrying}
            aria-busy={isRetrying}
            onClick={() => {
              if (!isRetrying) onRetry();
            }}
          >
            {isRetrying ? (
              <Sending label={t("quizshow:common.retry")} />
            ) : (
              t("quizshow:common.retry")
            )}
          </Button>
        )}
        <Button
          to={quizshowPlayPath()}
          variant={onRetry !== null ? "stage-ghost" : "stage"}
          size="lg"
        >
          {t("quizshow:player.codeTitle")}
        </Button>
      </div>
    </div>
  );
}

function PreviewLoading() {
  const { t } = useTranslation();
  return (
    <div className={styles.loading} role="status">
      <Spinner />
      <span className={styles.visuallyHidden}>
        {t("quizshow:stage.connecting")}
      </span>
    </div>
  );
}

function PreviewReady({
  preview,
  code,
}: {
  preview: QuizshowJoinPreview;
  code: string;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const { pathname, search, hash } = useLocation();
  // The whole location rides along, as the auth gate's own sign-in redirect does.
  const signInHref = `${routes.signIn}?next=${encodeURIComponent(
    `${pathname}${search}${hash}`,
  )}`;
  const statusLine = STATUS_LINES[preview.status];
  const StatusIcon = statusLine.icon;
  return (
    <section
      className={`${styles.endStack} ${styles.sheet}`}
      aria-labelledby={titleId}
    >
      <p className={styles.previewEyebrow}>
        {t("quizshow:player.preview.title")}
      </p>
      <h1 id={titleId} className={styles.title}>
        {preview.quizTitle}
      </h1>
      <p className={styles.previewStatus}>
        <StatusIcon aria-hidden focusable="false" />
        {t(statusLine.key)}
      </p>
      <p className={styles.previewCode}>
        <span className={styles.previewCodeLabel}>
          {t("quizshow:player.codeLabel")}
        </span>
        <span className={styles.previewCodeValue}>{code}</span>
      </p>
      <Button to={signInHref} variant="stage" size="lg">
        {t("quizshow:player.preview.signIn")}
      </Button>
      <p className={styles.hint}>{t("quizshow:player.preview.membersOnly")}</p>
    </section>
  );
}

interface QuizshowJoinPreviewCardProps {
  /** The code from the address, normalised. */
  code: string;
  /** False when the code is not six characters of the join alphabet: it never reaches the server. */
  isShaped: boolean;
}

/**
 * The signed-out card on `/play/:code` (item 29): the quiz title, how the game
 * stands, the code, and the way in through sign-in. It reads the public join
 * preview only, so nothing else about the game (event, host, players) shows
 * (C5.1), and it opens no socket.
 */
export function QuizshowJoinPreviewCard({
  code,
  isShaped,
}: QuizshowJoinPreviewCardProps) {
  const preview = useQuizshowJoinPreview(isShaped ? code : null);
  const isFailed = !isShaped || preview.isError;
  let stateKey = "ready";
  if (isFailed) stateKey = "error";
  else if (preview.data === undefined) stateKey = "loading";
  const canRetry = isShaped && !isFinalPreviewError(preview.error);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <StateFade key={stateKey}>
        {isFailed && (
          <PreviewError
            errorKey={
              isShaped
                ? joinPreviewErrorKeyOf(preview.error)
                : quizshowErrorKeyOf("quizshow_join_code_not_found")
            }
            onRetry={canRetry ? () => void preview.refetch() : null}
            isRetrying={preview.isFetching}
          />
        )}
        {!isFailed && preview.data === undefined && <PreviewLoading />}
        {!isFailed && preview.data !== undefined && (
          <PreviewReady preview={preview.data} code={code} />
        )}
      </StateFade>
    </AnimatePresence>
  );
}
