import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiWifi, FiWifiOff } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowConnectionStatus,
  QuizshowRetryCause,
} from "../realtime/quizshowClientStore";
import styles from "./QuizshowStage.module.css";

/** The line swap: a short opacity cross-fade, instant under reduced motion. */
const LINE_FADE_SECONDS = 0.18;

/** The icon fades with its line, so the swapped span lays them out as the pill does. */
const LINE_LAYOUT = {
  display: "inline-flex",
  alignItems: "center",
  gap: "inherit",
} as const;

interface QuizshowConnectionBannerProps {
  status: QuizshowConnectionStatus;
  /** False until the first attach on this store; defaults to true, which keeps the first connect quiet. */
  hasAttached?: boolean;
  /** Why the socket is retrying (item 42); null says the plain reconnecting line. */
  retryCause?: QuizshowRetryCause | null;
}

/** The banner line for a connection state, or null while nothing shows. */
function bannerLineKeyOf(
  status: QuizshowConnectionStatus,
  hasAttached: boolean,
  retryCause: QuizshowRetryCause | null,
): string | null {
  if (status === "connecting" && !hasAttached) {
    return "quizshow:stage.connecting";
  }
  if (status !== "reconnecting") return null;
  switch (retryCause) {
    // The socket is still refreshing the sign-in on its own; "Sign in again"
    // belongs to the refused screen once that refresh is rejected (contract 13).
    case "UNAUTHORIZED":
      return "quizshow:stage.retry.refreshingSignIn";
    case "RATE_LIMITED":
      return "quizshow:stage.retry.rateLimited";
    case "SERVER_ERROR":
      return "quizshow:stage.retry.serverError";
    case "offline":
      return "quizshow:stage.retry.offline";
    default:
      return "quizshow:stage.reconnecting";
  }
}

/** A glass pill along the top while the socket first connects or retries; folds
 *  away once attached. It names why a retry happens (item 42). The live region
 *  stays mounted and fills in, so the line is announced. */
export function QuizshowConnectionBanner({
  status,
  hasAttached = true,
  retryCause = null,
}: QuizshowConnectionBannerProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const lineKey = bannerLineKeyOf(status, hasAttached, retryCause);
  // The pill keeps its last line while it folds away.
  const [shownLineKey, setShownLineKey] = useState(lineKey);
  if (lineKey !== null && lineKey !== shownLineKey) setShownLineKey(lineKey);
  const isShown = lineKey !== null;
  const isFirstConnect = shownLineKey === "quizshow:stage.connecting";
  const fade = { duration: reducedMotion ? 0 : LINE_FADE_SECONDS };
  return (
    <>
      <span role="status" className={styles.visuallyHidden}>
        {isShown ? t(lineKey) : ""}
      </span>
      <Collapse isOpen={isShown}>
        <div className={styles.bannerRow} aria-hidden="true">
          <span className={styles.banner}>
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={shownLineKey ?? "none"}
                style={LINE_LAYOUT}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              >
                {isFirstConnect ? (
                  <FiWifi aria-hidden="true" fill="none" />
                ) : (
                  <FiWifiOff aria-hidden="true" fill="none" />
                )}
                {shownLineKey === null ? "" : t(shownLineKey)}
              </m.span>
            </AnimatePresence>
          </span>
        </div>
      </Collapse>
    </>
  );
}
