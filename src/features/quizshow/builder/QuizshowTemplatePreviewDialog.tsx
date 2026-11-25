import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  Button,
  Collapse,
  LoadErrorState,
  Modal,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowTemplatePreview,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { useQuizshowTemplatePreview } from "../api/useQuizshowTemplates";
import { isWheelRoundKind } from "../quizshowWheel";
import { quizshowTemplateErrorKeyOf } from "../templates/quizshowTemplateErrors";
import { templateCardTitleOf } from "../templates/quizshowTemplateResponse";
import {
  QuizshowRoundChecklist,
  QuizshowRoundChecklistRows,
  QuizshowRoundSubmit,
} from "./QuizshowRoundChecklist";
import {
  sliceRangesOf,
  useQuizshowRoundSelection,
} from "./quizshowRoundSelection";
import {
  QuizshowPickerFade,
  QuizshowPickerSkeleton,
} from "./QuizshowPickerFade";
import { useQuizshowDarkDialog } from "./useQuizshowDarkDialog";
import { useQuizshowViewLanguage } from "./useQuizshowViewLanguage";
import styles from "./QuizshowImport.module.css";

interface QuizshowTemplatePreviewDialogProps {
  /** The template to preview; null keeps the dialog closed. */
  templateId: string | null;
  /**
   * False blocks "Use this template" for a template with an adults round, with
   * the adults tag as the reason, and holds the adults rows of the Add rounds
   * checklist, each with its reason; the other rows stay free to add.
   */
  isAdultsAllowed: boolean;
  /** "See what changed" (C6.25): the latest publish's note, shown on top. Null or blank shows none. */
  changeNote?: QuizshowText | null;
  /** The target quiz has rounds: "Add rounds from this template" shows with the checklist. */
  canAppend: boolean;
  /**
   * Additive. More's "Add rounds from a template": the checklist starts open,
   * "Add these rounds" sits in the dialog's footer, and "Use this template"
   * and the "Add rounds from this template" toggle stay out. Needs `canAppend`.
   */
  isAppendOnly?: boolean;
  /** An import is under way: the actions hold. */
  isPending: boolean;
  onClose: () => void;
  /** "Use this template": replaces the quiz (the replace confirm follows when one exists). */
  onUse: () => void;
  /** "Add these rounds": the chosen row indexes, in source order. */
  onAppend: (roundIndexes: number[]) => void;
}

type PreviewActionProps = Omit<
  QuizshowTemplatePreviewDialogProps,
  "templateId" | "onClose" | "changeNote"
>;

type PreviewQuery = ReturnType<typeof useQuizshowTemplatePreview>;

const NO_ROUNDS: QuizshowTemplatePreview["rounds"] = [];

/** Each row: kind, title, question count and its prompts. A wheel lists its slice count. */
function PreviewRounds({
  preview,
  language,
}: {
  preview: QuizshowTemplatePreview;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const sliceRanges = sliceRangesOf(preview.rounds);
  return (
    <ol className={styles.previewRounds}>
      {preview.rounds.map((round) => {
        const title = templateCardTitleOf(round.title, language);
        const isWheel = isWheelRoundKind(round.kind);
        return (
          <li key={round.roundIndex} className={styles.previewRound}>
            <p className={styles.previewRoundHead}>
              <span className={styles.checklistKind}>
                {t(`quizshow:kind.${round.kind}.name`)}
              </span>
              {title !== "" && (
                <span className={styles.previewRoundTitle}>{title}</span>
              )}
              <span className={styles.checklistCount}>
                {isWheel
                  ? t("quizshow:importSources.wheelSlices", {
                      count: sliceRanges.get(round.roundIndex)?.length ?? 0,
                    })
                  : t("quizshow:packs.questions", {
                      count: round.questionCount,
                    })}
              </span>
            </p>
            {round.prompts.length > 0 && (
              <ul className={styles.previewPrompts}>
                {round.prompts.map((prompt, promptIndex) => (
                  <li key={promptIndex}>
                    {templateCardTitleOf(prompt, language)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * "Use this template" (held while the template has adults rounds and 18+ is
 * off) and, on a quiz with rounds, "Add rounds from this template" with its
 * checklist folding open; there only the adults rows are held.
 * Add-only mode has neither: its checklist and footer take over.
 */
function PreviewActions({
  preview,
  language,
  isBlocked,
  adultsTagId,
  isAdultsAllowed,
  canAppend,
  isPending,
  onUse,
  onAppend,
}: Pick<
  PreviewActionProps,
  "canAppend" | "isPending" | "onUse" | "onAppend" | "isAdultsAllowed"
> & {
  preview: QuizshowTemplatePreview;
  language: QuizshowLanguage;
  isBlocked: boolean;
  adultsTagId: string;
}) {
  const { t } = useTranslation();
  const checklistId = useId();
  const [isChoosing, setIsChoosing] = useState(false);
  const isHeld = isBlocked || isPending;
  const isChecklistOpen = canAppend && isChoosing;
  return (
    <div className={styles.previewActions}>
      <div className={styles.rowActions}>
        <Button
          variant="stage"
          size="md"
          aria-disabled={isHeld}
          aria-describedby={isBlocked ? adultsTagId : undefined}
          onClick={() => {
            if (!isHeld) onUse();
          }}
        >
          {t("quizshow:templates.preview.useTemplate")}
        </Button>
        {canAppend && (
          <Button
            variant="stage-ghost"
            size="md"
            aria-expanded={isChecklistOpen}
            aria-controls={isChecklistOpen ? checklistId : undefined}
            onClick={() => setIsChoosing((current) => !current)}
          >
            {t("quizshow:templates.preview.addRounds")}
          </Button>
        )}
      </div>
      <Collapse isOpen={isChecklistOpen} className={styles.rowChecklist}>
        <div id={checklistId}>
          <QuizshowRoundChecklist
            rounds={preview.rounds}
            language={language}
            isAdultsAllowed={isAdultsAllowed}
            isPending={isPending}
            onSubmit={onAppend}
          />
        </div>
      </Collapse>
    </div>
  );
}

function PreviewBody({
  preview,
  changeNote,
  isAddOnly,
  isBlocked,
  hasAdultsRounds,
  adultsTagId,
  selection,
  isAdultsAllowed,
  canAppend,
  isPending,
  onUse,
  onAppend,
}: Pick<
  PreviewActionProps,
  "canAppend" | "isPending" | "onUse" | "onAppend" | "isAdultsAllowed"
> & {
  preview: PreviewQuery;
  changeNote: QuizshowText | null | undefined;
  isAddOnly: boolean;
  isBlocked: boolean;
  /** The template has an adults round: the tag shows. */
  hasAdultsRounds: boolean;
  adultsTagId: string;
  selection: ReturnType<typeof useQuizshowRoundSelection>;
}) {
  const { t } = useTranslation();
  const language = useQuizshowViewLanguage();
  if (preview.isError) {
    return (
      <QuizshowPickerFade stateKey="error">
        <LoadErrorState
          compact
          title={t("quizshow:templates.preview.loadError")}
          description={t(quizshowTemplateErrorKeyOf(preview.error))}
          onRetry={() => void preview.refetch()}
          isRetrying={preview.isFetching}
        />
      </QuizshowPickerFade>
    );
  }
  if (!preview.data) {
    return (
      <QuizshowPickerFade stateKey="loading">
        <QuizshowPickerSkeleton />
      </QuizshowPickerFade>
    );
  }
  const changeNoteText = changeNote
    ? templateCardTitleOf(changeNote, language)
    : "";
  return (
    <QuizshowPickerFade stateKey="preview">
      <div className={styles.preview}>
        <h3 className={styles.previewTitle}>
          {templateCardTitleOf(preview.data.title, language)}
        </h3>
        {changeNoteText !== "" && (
          <section className={styles.previewChangeNote}>
            <h3 className={styles.previewSectionTitle}>
              {t("quizshow:templates.preview.changeNote")}
            </h3>
            <p className={styles.previewText}>{changeNoteText}</p>
          </section>
        )}
        <p className={styles.previewText}>
          {templateCardTitleOf(preview.data.description, language)}
        </p>
        <PreviewRounds preview={preview.data} language={language} />
        {hasAdultsRounds && (
          <ul className={styles.tags}>
            <li
              id={adultsTagId}
              className={`${styles.tag} ${styles.tagWarning}`}
            >
              {t("quizshow:importSources.adultsTag")}
            </li>
          </ul>
        )}
        {isAddOnly ? (
          <QuizshowRoundChecklistRows
            rounds={preview.data.rounds}
            language={language}
            selection={selection}
          />
        ) : (
          <PreviewActions
            preview={preview.data}
            language={language}
            isBlocked={isBlocked}
            adultsTagId={adultsTagId}
            isAdultsAllowed={isAdultsAllowed}
            canAppend={canAppend}
            isPending={isPending}
            onUse={onUse}
            onAppend={onAppend}
          />
        )}
      </div>
    </QuizshowPickerFade>
  );
}

/**
 * Add-only footer: "Add these rounds" pinned under the scroll, with the hint
 * that says why it is held (nothing picked). It mounts with the loaded
 * preview, so the footer never swaps states under the reader.
 */
function PreviewAddFooter({
  selection,
  isPending,
  onAppend,
}: {
  selection: ReturnType<typeof useQuizshowRoundSelection>;
  isPending: boolean;
  onAppend: (roundIndexes: number[]) => void;
}) {
  return (
    <div className={styles.previewFooter}>
      <QuizshowRoundSubmit
        selection={selection}
        isPending={isPending}
        onSubmit={onAppend}
        size="md"
      />
    </div>
  );
}

/**
 * The modal and the preview it loads. The footer lives here, outside the
 * body's scroll, so the selection and the read are held at this level.
 */
function PreviewModal({
  templateId,
  changeNote,
  isAdultsAllowed,
  isAppendOnly = false,
  canAppend,
  isPending,
  onUse,
  onAppend,
  onClose,
}: PreviewActionProps & {
  templateId: string;
  changeNote?: QuizshowText | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const adultsTagId = useId();
  const preview = useQuizshowTemplatePreview(templateId);
  const selection = useQuizshowRoundSelection(
    preview.data?.rounds ?? NO_ROUNDS,
    { isAdultsAllowed },
  );
  const isAddOnly = canAppend && isAppendOnly;
  const hasAdultsRounds =
    preview.data?.rounds.some((round) => round.contentLabel === "adults") ??
    false;
  const isBlocked = !isAdultsAllowed && hasAdultsRounds;
  return (
    <Modal
      title={t("quizshow:templates.preview.title")}
      onClose={onClose}
      wide
      className={styles.dialog}
      footer={
        isAddOnly && preview.data ? (
          <PreviewAddFooter
            selection={selection}
            isPending={isPending}
            onAppend={onAppend}
          />
        ) : undefined
      }
    >
      <div ref={darkDialogRef} />
      <PreviewBody
        preview={preview}
        changeNote={changeNote}
        isAddOnly={isAddOnly}
        isBlocked={isBlocked}
        hasAdultsRounds={hasAdultsRounds}
        adultsTagId={adultsTagId}
        selection={selection}
        isAdultsAllowed={isAdultsAllowed}
        canAppend={canAppend}
        isPending={isPending}
        onUse={onUse}
        onAppend={onAppend}
      />
    </Modal>
  );
}

/**
 * Item 23 (D25): a published template before importing it, prompts only (the
 * read carries no options or answers). From the top bar's "See what changed"
 * (C6.25) it leads with the change note. Nothing imports until a tap.
 */
export function QuizshowTemplatePreviewDialog({
  templateId,
  ...bodyProps
}: QuizshowTemplatePreviewDialogProps) {
  return (
    <AnimatePresence>
      {templateId !== null && (
        <PreviewModal
          key="quizshow-template-preview"
          templateId={templateId}
          {...bodyProps}
        />
      )}
    </AnimatePresence>
  );
}
