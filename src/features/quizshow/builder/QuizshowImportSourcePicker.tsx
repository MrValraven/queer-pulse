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
import type { QuizshowImportSource } from "../../../shared/contracts/quizshow";
import { useQuizshowImportSources } from "../api/useQuizshowQuiz";
import {
  QuizshowPickerFade,
  QuizshowPickerSkeleton,
} from "./QuizshowPackPicker";
import styles from "./QuizshowImport.module.css";

interface QuizshowImportSourcePickerProps {
  slug: string;
  isOpen: boolean;
  isAdultsEvent: boolean;
  onClose: () => void;
  onPick: (eventSlug: string) => void;
}

function SourceRow({
  source,
  isBlocked,
  onPick,
}: {
  source: QuizshowImportSource;
  isBlocked: boolean;
  onPick: (eventSlug: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const adultsTagId = useId();
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <h3 className={styles.rowTitle}>{source.eventTitle}</h3>
        <p className={styles.rowMeta}>
          {fmt.date(new Date(source.startAt), { dateStyle: "medium" })}
        </p>
        <p className={styles.rowMeta}>
          {source.quizTitle}
          {", "}
          {t("quizshow:packs.rounds", { count: source.roundCount })}
          {", "}
          {t("quizshow:packs.questions", { count: source.questionCount })}
        </p>
        {(source.isSameSeries || source.hasAdultsRounds) && (
          <ul className={styles.tags}>
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
          if (!isBlocked) onPick(source.eventSlug);
        }}
      >
        {t("quizshow:importSources.use")}
      </Button>
    </div>
  );
}

function SourcePickerBody({
  slug,
  isAdultsEvent,
  onPick,
}: Omit<QuizshowImportSourcePickerProps, "isOpen" | "onClose">) {
  const { t } = useTranslation();
  const sources = useQuizshowImportSources(slug, { isEnabled: true });
  if (sources.isError) {
    return (
      <QuizshowPickerFade stateKey="error">
        <LoadErrorState
          compact
          title={t("quizshow:importSources.loadError")}
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
  if (sources.data.items.length === 0) {
    return (
      <QuizshowPickerFade stateKey="empty">
        <p className={styles.emptyNote}>{t("quizshow:importSources.empty")}</p>
      </QuizshowPickerFade>
    );
  }
  return (
    <QuizshowPickerFade stateKey="list">
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {sources.data.items.map((source) => (
            <CollapseListItem key={source.eventSlug}>
              <SourceRow
                source={source}
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
  slug,
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
          title={t("quizshow:importSources.title")}
          sub={t("quizshow:importSources.sub")}
          onClose={onClose}
        >
          <SourcePickerBody
            slug={slug}
            isAdultsEvent={isAdultsEvent}
            onPick={onPick}
          />
        </Modal>
      )}
    </AnimatePresence>
  );
}
