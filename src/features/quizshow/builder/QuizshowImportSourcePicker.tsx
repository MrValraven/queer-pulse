import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  Button,
  Collapse,
  CollapseListItem,
  LoadErrorState,
  Modal,
} from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowImportInput,
  QuizshowImportSource,
} from "../../../shared/contracts/quizshow";
import { useQuizshowImportSources } from "../api/useQuizshowQuiz";
import { quizshowScopeKey, type QuizshowSessionScope } from "../quizshowScope";
import { QuizshowRoundChecklist } from "./QuizshowRoundChecklist";
import { importInputOf } from "./useQuizshowImport";
import { useQuizshowViewLanguage } from "./useQuizshowViewLanguage";
import { useQuizshowDarkDialog } from "./useQuizshowDarkDialog";
import {
  QuizshowPickerFade,
  QuizshowPickerSkeleton,
} from "./QuizshowPickerFade";
import styles from "./QuizshowImport.module.css";

interface QuizshowImportSourcePickerProps {
  scope: QuizshowSessionScope;
  isOpen: boolean;
  isAdultsEvent: boolean;
  onClose: () => void;
  onPick: (input: QuizshowImportInput) => void;
  /**
   * Additive (item 23). Set when the target quiz has rounds: each row offers
   * "Replace the quiz" and "Add rounds from this quiz" with the round checklist.
   */
  onAppend?: (input: QuizshowImportInput, roundIndexes: number[]) => void;
  /** Additive. An import is under way: the checklist's submit holds. */
  isPending?: boolean;
  /**
   * Additive. "append" (More's "Add rounds from another quiz"): each row
   * offers only "Add rounds from this quiz". Needs `onAppend`; defaults to "replace".
   */
  mode?: "replace" | "append";
}

/** The scope a listed source stands for, so the row key never collides across kinds. */
function scopeOfSource(
  source: QuizshowImportSource,
): QuizshowSessionScope | null {
  if (source.kind === "game") {
    return source.gameId === null
      ? null
      : { kind: "game", gameId: source.gameId };
  }
  return source.eventSlug === null
    ? null
    : { kind: "event", eventSlug: source.eventSlug };
}

/**
 * The row's ways in when the target has rounds: "Replace the quiz" (left out
 * in append mode) and "Add rounds from this quiz", which folds the round
 * checklist open under the row. Folded, it adds no space.
 */
function SourceRowAppend({
  source,
  input,
  isBlocked,
  isAdultsEvent,
  isReplaceShown,
  adultsTagId,
  reasonId,
  isPending,
  onPick,
  onAppend,
}: {
  source: QuizshowImportSource;
  input: QuizshowImportInput;
  /** "Replace the quiz" is held: the source has adults rounds and the quiz is not 18+. */
  isBlocked: boolean;
  isAdultsEvent: boolean;
  isReplaceShown: boolean;
  adultsTagId: string;
  /** The line that says what to turn on to use this source's rounds. */
  reasonId: string;
  isPending: boolean;
  onPick: (input: QuizshowImportInput) => void;
  onAppend: (input: QuizshowImportInput, roundIndexes: number[]) => void;
}) {
  const { t } = useTranslation();
  const language = useQuizshowViewLanguage();
  const checklistId = useId();
  const [isChoosing, setIsChoosing] = useState(false);
  return (
    <>
      <div className={styles.rowActions}>
        {isReplaceShown && (
          <Button
            variant="stage-ghost"
            size="sm"
            aria-disabled={isBlocked}
            aria-describedby={
              isBlocked ? `${adultsTagId} ${reasonId}` : undefined
            }
            onClick={() => {
              if (!isBlocked) onPick(input);
            }}
          >
            {t("quizshow:importSources.replace")}
          </Button>
        )}
        <Button
          variant="stage-ghost"
          size="sm"
          aria-expanded={isChoosing}
          aria-controls={isChoosing ? checklistId : undefined}
          onClick={() => {
            setIsChoosing((current) => !current);
          }}
        >
          {t("quizshow:importSources.addRounds")}
        </Button>
      </div>
      <Collapse isOpen={isChoosing} className={styles.rowChecklist}>
        <div id={checklistId}>
          <QuizshowRoundChecklist
            rounds={source.rounds}
            language={language}
            isAdultsAllowed={isAdultsEvent}
            isPending={isPending}
            onSubmit={(roundIndexes) => onAppend(input, roundIndexes)}
          />
        </div>
      </Collapse>
    </>
  );
}

function SourceRow({
  source,
  input,
  isBlocked,
  isAdultsEvent,
  isPending,
  mode,
  onPick,
  onAppend,
}: {
  source: QuizshowImportSource;
  input: QuizshowImportInput;
  isBlocked: boolean;
  isAdultsEvent: boolean;
  isPending: boolean;
  mode: "replace" | "append";
  onPick: (input: QuizshowImportInput) => void;
  onAppend?: (input: QuizshowImportInput, roundIndexes: number[]) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const adultsTagId = useId();
  const reasonId = useId();
  const titleId = useId();
  const isGameSource = source.kind === "game";
  const hasTags = isGameSource || source.isSameSeries || source.hasAdultsRounds;
  // Append mode holds only the adults rows, inside the checklist.
  const isReasonShown =
    isBlocked && onAppend !== undefined && mode === "replace";
  return (
    // A group named by its title, so a row's actions read with their source.
    <div className={styles.row} role="group" aria-labelledby={titleId}>
      <div className={styles.rowText}>
        <h3 id={titleId} className={styles.rowTitle}>
          {isGameSource ? source.quizTitle : source.eventTitle}
        </h3>
        {!isGameSource && source.startAt !== null && (
          <p className={styles.rowMeta}>
            {fmt.date(new Date(source.startAt), { dateStyle: "medium" })}
          </p>
        )}
        <p className={styles.rowMeta}>
          {!isGameSource && (
            <>
              {source.quizTitle}
              {", "}
            </>
          )}
          {t("quizshow:packs.rounds", { count: source.roundCount })}
          {", "}
          {t("quizshow:packs.questions", { count: source.questionCount })}
        </p>
        {hasTags && (
          <ul className={styles.tags}>
            {isGameSource && (
              <li className={styles.tag}>
                {t("quizshow:importSources.gameTag")}
              </li>
            )}
            {source.isSameSeries && (
              <li className={styles.tag}>
                {t("quizshow:importSources.sameSeriesTag")}
              </li>
            )}
            {source.hasAdultsRounds && (
              <li
                id={adultsTagId}
                className={`${styles.tag} ${styles.tagWarning}`}
              >
                {t("quizshow:importSources.adultsTag")}
              </li>
            )}
          </ul>
        )}
        {isReasonShown && (
          <p id={reasonId} className={styles.tagReason}>
            {t("quizshow:importSources.adultsRequiredToAdd")}
          </p>
        )}
      </div>
      {onAppend ? (
        <SourceRowAppend
          source={source}
          input={input}
          isBlocked={isBlocked}
          isAdultsEvent={isAdultsEvent}
          isReplaceShown={mode === "replace"}
          adultsTagId={adultsTagId}
          reasonId={reasonId}
          isPending={isPending}
          onPick={onPick}
          onAppend={onAppend}
        />
      ) : (
        <Button
          variant="stage-ghost"
          size="sm"
          aria-disabled={isBlocked}
          aria-describedby={isBlocked ? adultsTagId : undefined}
          onClick={() => {
            if (!isBlocked) onPick(input);
          }}
        >
          {t("quizshow:importSources.use")}
        </Button>
      )}
    </div>
  );
}

function SourcePickerBody({
  scope,
  isAdultsEvent,
  onPick,
  onAppend,
  isPending = false,
  mode = "replace",
}: Omit<QuizshowImportSourcePickerProps, "isOpen" | "onClose">) {
  const { t } = useTranslation();
  const sources = useQuizshowImportSources(scope, {
    isEnabled: true,
  });
  const isGameScope = scope.kind === "game";
  if (sources.isError) {
    return (
      <QuizshowPickerFade stateKey="error">
        <LoadErrorState
          compact
          title={t(
            isGameScope
              ? "quizshow:importSources.gameScope.loadError"
              : "quizshow:importSources.loadError",
          )}
          onRetry={() => void sources.refetch()}
          isRetrying={sources.isFetching}
        />
      </QuizshowPickerFade>
    );
  }
  if (!sources.data) {
    return (
      <QuizshowPickerFade stateKey="loading">
        <QuizshowPickerSkeleton />
      </QuizshowPickerFade>
    );
  }
  const rows = sources.data.items.flatMap((source) => {
    const input = importInputOf(source);
    const sourceScope = scopeOfSource(source);
    return input && sourceScope
      ? [{ source, input, key: quizshowScopeKey(sourceScope) }]
      : [];
  });
  if (rows.length === 0) {
    return (
      <QuizshowPickerFade stateKey="empty">
        <p className={styles.emptyNote}>
          {t(
            isGameScope
              ? "quizshow:importSources.gameScope.empty"
              : "quizshow:importSources.empty",
          )}
        </p>
      </QuizshowPickerFade>
    );
  }
  return (
    <QuizshowPickerFade stateKey="list">
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {rows.map(({ source, input, key }) => (
            <CollapseListItem key={key}>
              <SourceRow
                source={source}
                input={input}
                isBlocked={source.hasAdultsRounds && !isAdultsEvent}
                isAdultsEvent={isAdultsEvent}
                isPending={isPending}
                mode={mode}
                onPick={onPick}
                onAppend={onAppend}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </QuizshowPickerFade>
  );
}

export function QuizshowImportSourcePicker({
  scope,
  isOpen,
  isAdultsEvent,
  onClose,
  onPick,
  onAppend,
  isPending,
  mode = "replace",
}: QuizshowImportSourcePickerProps) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const isAppendMode = mode === "append" && onAppend !== undefined;
  const replaceTitleKey =
    scope.kind === "game"
      ? "quizshow:import.fromCopy"
      : "quizshow:importSources.title";
  const replaceSubKey =
    scope.kind === "game"
      ? "quizshow:importSources.gameScope.sub"
      : "quizshow:importSources.sub";
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          key="quizshow-import-source-picker"
          title={t(
            isAppendMode ? "quizshow:studio.more.addFromCopy" : replaceTitleKey,
          )}
          sub={t(
            isAppendMode ? "quizshow:importSources.appendSub" : replaceSubKey,
          )}
          onClose={onClose}
          className={styles.dialog}
        >
          <div ref={darkDialogRef} />
          <SourcePickerBody
            scope={scope}
            isAdultsEvent={isAdultsEvent}
            onPick={onPick}
            onAppend={onAppend}
            isPending={isPending}
            mode={isAppendMode ? "append" : "replace"}
          />
        </Modal>
      )}
    </AnimatePresence>
  );
}
