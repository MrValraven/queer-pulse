import { useId } from "react";
import { AnimatePresence } from "motion/react";
import {
  Button,
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
import { quizshowScopeKey, type QuizshowScope } from "../quizshowScope";
import { importInputOf } from "./useQuizshowImport";
import {
  QuizshowPickerFade,
  QuizshowPickerSkeleton,
} from "./QuizshowPackPicker";
import styles from "./QuizshowImport.module.css";

interface QuizshowImportSourcePickerProps {
  scope: QuizshowScope;
  isOpen: boolean;
  isAdultsEvent: boolean;
  onClose: () => void;
  onPick: (input: QuizshowImportInput) => void;
}

/** The scope a listed source stands for, so the row key never collides across kinds. */
function scopeOfSource(source: QuizshowImportSource): QuizshowScope | null {
  if (source.kind === "game") {
    return source.gameId === null
      ? null
      : { kind: "game", gameId: source.gameId };
  }
  return source.eventSlug === null
    ? null
    : { kind: "event", eventSlug: source.eventSlug };
}

function SourceRow({
  source,
  input,
  isBlocked,
  onPick,
}: {
  source: QuizshowImportSource;
  input: QuizshowImportInput;
  isBlocked: boolean;
  onPick: (input: QuizshowImportInput) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const adultsTagId = useId();
  const isGameSource = source.kind === "game";
  const hasTags = isGameSource || source.isSameSeries || source.hasAdultsRounds;
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <h3 className={styles.rowTitle}>
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
      </div>
      <Button
        size="sm"
        aria-disabled={isBlocked}
        aria-describedby={isBlocked ? adultsTagId : undefined}
        onClick={() => {
          if (!isBlocked) onPick(input);
        }}
      >
        {t("quizshow:importSources.use")}
      </Button>
    </div>
  );
}

function SourcePickerBody({
  scope,
  isAdultsEvent,
  onPick,
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
                onPick={onPick}
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
}: QuizshowImportSourcePickerProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          key="quizshow-import-source-picker"
          title={t(
            scope.kind === "game"
              ? "quizshow:import.fromCopy"
              : "quizshow:importSources.title",
          )}
          sub={t(
            scope.kind === "game"
              ? "quizshow:importSources.gameScope.sub"
              : "quizshow:importSources.sub",
          )}
          onClose={onClose}
        >
          <SourcePickerBody
            scope={scope}
            isAdultsEvent={isAdultsEvent}
            onPick={onPick}
          />
        </Modal>
      )}
    </AnimatePresence>
  );
}
