import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse } from "../../../shared/components/ui";
import type {
  QuizshowErrorCode,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import type { TranslateOptions } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  quizshowErrorCodeOf,
  quizshowErrorKeyOf,
  quizshowProblemsOf,
} from "../api/quizshowErrors";
import { quizshowKeys } from "../api/quizshowKeys";
import { useRefreshQuizshowLobby } from "../api/useQuizshowMutations";
import {
  isQuizshowSessionScope,
  type QuizshowSessionScope,
} from "../quizshowScope";
import {
  useQuizshowStudio,
  type QuizshowStudioSave,
} from "./QuizshowStudioContext";
import { STUDIO_SAVE_REASON_ID } from "./quizshowStudioDom";
import { lobbyLineKindOf } from "./useStudioSave";
import styles from "./QuizshowStudioTopBar.module.css";

type Translate = ReturnType<typeof useTranslation>["t"];

/** A problem sentence's values as translate options (an interface has no index signature). */
function translateOptionsOf(
  values: QuizshowStudioSave["reasonValues"],
): TranslateOptions {
  if (values === null) return {};
  return { round: values.round, question: values.question, max: values.max };
}

/** The statuses worth interrupting for; the others change every few seconds. */
const ANNOUNCED_STATUSES: ReadonlySet<QuizshowStudioSave["status"]> = new Set([
  "held",
  "failed",
  "conflict",
]);

/** The status word and, when it has one, the reason after it. */
function statusCopyOf(
  save: QuizshowStudioSave,
  t: Translate,
): { label: string; reason: string | null } {
  switch (save.status) {
    case "saving":
      return { label: t("quizshow:save.saving"), reason: null };
    case "unsaved":
      return { label: t("quizshow:save.unsaved"), reason: null };
    case "held":
      return {
        label: t("quizshow:save.unsaved"),
        reason: save.reasonKey
          ? t(save.reasonKey, translateOptionsOf(save.reasonValues))
          : null,
      };
    case "failed":
      return {
        label: t("quizshow:studio.save.failed"),
        reason: save.reasonKey ? t(save.reasonKey) : null,
      };
    case "conflict":
      return { label: t("quizshow:studio.save.conflict"), reason: null };
    default:
      return { label: t("quizshow:save.saved"), reason: null };
  }
}

/** What refused the refresh: the server's answer, or the held save that came first (its reason already in words). */
interface LobbyRefusal {
  stamp: string | null;
  error: unknown;
  heldReason: string | null;
}

/** A refused refresh in words; an incomplete quiz also counts its problems. */
function refusalCopyOf(
  refusal: LobbyRefusal,
  t: Translate,
): { reason: string; problemCount: string | null } {
  if (refusal.heldReason !== null) {
    return { reason: refusal.heldReason, problemCount: null };
  }
  const { error } = refusal;
  const code = quizshowErrorCodeOf(error);
  const reason = t(quizshowErrorKeyOf(code));
  const problemCount =
    code === "quizshow_refresh_quiz_incomplete"
      ? quizshowProblemsOf(error).length
      : 0;
  return {
    reason,
    problemCount:
      problemCount > 0
        ? t("quizshow:studio.problems.countLabel", { count: problemCount })
        : null,
  };
}

/** Refusals that mean the lobby the quiz read shows is gone or no longer waiting, so that read is stale. */
const STALE_LOBBY_CODES: ReadonlySet<QuizshowErrorCode> = new Set([
  "quizshow_not_in_lobby",
  "quizshow_session_not_found",
  "quizshow_refresh_quiz_gone",
]);

/**
 * The open lobby's strip under the top bar (item 18, C6.10). A lobby that
 * took its questions before the latest save says so, with "Use my latest
 * edits in this lobby"; a refusal names its reason and keeps the button to
 * try again once fixed. A game already playing says changes apply to the next
 * game. The strip folds in and out; between two lines the words cross-fade. A
 * refusal belongs to the save it answered, so the next save clears it.
 */
function QuizshowStudioLobbyLine({ scope }: { scope: QuizshowSessionScope }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { data, save } = useQuizshowStudio();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const refresh = useRefreshQuizshowLobby(scope);
  const savedStamp = data.quiz?.updatedAt ?? null;
  const [refusal, setRefusal] = useState<LobbyRefusal | null>(null);
  // The save that runs first is out: a second click waits for it.
  const [isSaving, setIsSaving] = useState(false);
  const shownRefusal = refusal?.stamp === savedStamp ? refusal : null;
  const kind = lobbyLineKindOf(data.liveSession, shownRefusal !== null);
  const refusalCopy = shownRefusal ? refusalCopyOf(shownRefusal, t) : null;
  const lineCopy =
    kind === "nextGame"
      ? t("quizshow:save.appliesNextGame")
      : (refusalCopy?.reason ?? t("quizshow:save.lobbyBehind"));
  const announcedRefusal = refusalCopy
    ? [refusalCopy.reason, refusalCopy.problemCount].filter(Boolean).join(". ")
    : "";
  // Read when the refusal lands: the first save moved the stamp on.
  const storedStampOf = () =>
    queryClient.getQueryData<QuizshowQuizResponse>(
      quizshowKeys.quizFor(scope, demoMode),
    )?.quiz?.updatedAt ?? savedStamp;
  const applyLatestEdits = async () => {
    if (refresh.isPending || isSaving) return;
    // The lobby takes the saved quiz, so edits still waiting in the draft are stored first.
    setIsSaving(true);
    let heldReason: string | null;
    try {
      heldReason = await save.saveFirst();
    } catch {
      heldReason = t("quizshow:studio.print.saveFailed");
    } finally {
      setIsSaving(false);
    }
    if (heldReason !== null) {
      setRefusal({ stamp: storedStampOf(), error: null, heldReason });
      return;
    }
    refresh.mutate(undefined, {
      onSuccess: () => setRefusal(null),
      onError: (error) => {
        setRefusal({ stamp: storedStampOf(), error, heldReason: null });
        const code = quizshowErrorCodeOf(error);
        // The lobby started, closed or lost its quiz: reread, so the stale line clears.
        if (code !== null && STALE_LOBBY_CODES.has(code)) {
          void queryClient.invalidateQueries({
            queryKey: quizshowKeys.quizFor(scope, demoMode),
          });
        }
      },
    });
  };
  return (
    <>
      <Collapse isOpen={kind !== null}>
        <div className={styles.lobbyStrip}>
          <AnimatePresence mode="wait" initial={false}>
            {kind !== null && (
              <m.div
                key={kind}
                className={styles.lobbyLine}
                data-kind={kind}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                <p className={styles.lobbyText}>{lineCopy}</p>
                {kind === "refused" && refusalCopy?.problemCount && (
                  <p className={styles.lobbyCount}>
                    {refusalCopy.problemCount}
                  </p>
                )}
                {kind !== "nextGame" && (
                  <Button
                    variant="stage-ghost"
                    size="sm"
                    type="button"
                    className={styles.reviewButton}
                    disabled={refresh.isPending || isSaving}
                    onClick={() => void applyLatestEdits()}
                  >
                    {t("quizshow:save.useLatestEdits")}
                  </Button>
                )}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </Collapse>
      <p className={styles.visuallyHidden} role="status">
        {announcedRefusal}
      </p>
    </>
  );
}

/**
 * The open lobby's strip for an event or a game; a template has no lobby.
 * The studio lays it out as its own row under the 56px bar, so its button
 * never paints over the bar's controls.
 */
export function QuizshowStudioLobbyStrip() {
  const { scope } = useQuizshowStudio();
  if (!isQuizshowSessionScope(scope)) return null;
  return <QuizshowStudioLobbyLine scope={scope} />;
}

/**
 * The top bar's save status: Saved, Saving, Unsaved changes (with the
 * problem that holds the save), Couldn't save (with its reason), or, while a
 * newer version from someone else waits, a line saying so and "Review
 * changes", which reopens the conflict dialog. Autosaves show no toast, so
 * this is their only feedback. Only what needs the host (held, failed,
 * conflict) is announced; the steady Saving and Saved stay quiet. A draft
 * event adds a small "Practice" tag below 1280px, where Open lobby drops the
 * word (item 53).
 */
export function QuizshowStudioSaveStatus({
  isPractice = false,
}: {
  isPractice?: boolean;
}) {
  const { t } = useTranslation();
  const { save } = useQuizshowStudio();
  const { label, reason } = statusCopyOf(save, t);
  const isAnnounced = ANNOUNCED_STATUSES.has(save.status);
  return (
    <div className={styles.saveStatus} data-status={save.status}>
      <p className={styles.saveLine} title={label}>
        <span className={styles.saveDot} aria-hidden />
        <span className={styles.saveLabel}>{label}</span>
        {isPractice && (
          <span className={styles.practiceTag}>
            {t("quizshow:stage.practice")}
          </span>
        )}
        {reason && (
          <span
            id={STUDIO_SAVE_REASON_ID}
            className={styles.saveReason}
            title={reason}
          >
            {reason}
          </span>
        )}
      </p>
      <p className={styles.visuallyHidden} role="status">
        {isAnnounced ? [label, reason].filter(Boolean).join(". ") : ""}
      </p>
      {save.status === "conflict" && (
        <Button
          variant="stage-ghost"
          size="sm"
          className={styles.reviewButton}
          onClick={save.reviewConflict}
        >
          {t("quizshow:studio.save.reviewChanges")}
        </Button>
      )}
    </div>
  );
}
