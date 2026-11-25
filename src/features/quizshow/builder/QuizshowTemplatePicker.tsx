import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiCopy, FiEye, FiFilePlus } from "react-icons/fi";
import { Button, LoadErrorState, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowTemplateCard } from "../../../shared/contracts/quizshow";
import { useQuizshowTemplateCards } from "../api/useQuizshowTemplates";
import { quizshowTemplateErrorKeyOf } from "../templates/quizshowTemplateErrors";
import { templateCardTitleOf } from "../templates/quizshowTemplateResponse";
import { QuizshowGameCover } from "../games/QuizshowGameCover";
import {
  QuizshowPickerFade,
  QuizshowPickerSkeleton,
} from "./QuizshowPickerFade";
import { QuizshowTemplatePreviewDialog } from "./QuizshowTemplatePreviewDialog";
import { useQuizshowDarkDialog } from "./useQuizshowDarkDialog";
import styles from "./QuizshowImport.module.css";

interface QuizshowTemplatePickerProps {
  isOpen: boolean;
  /**
   * False blocks using a template with an adults round, with the adults tag as
   * the reason. Adding rounds stays open: its checklist holds only the adults rows.
   */
  isAdultsAllowed: boolean;
  onClose: () => void;
  onPick: (card: QuizshowTemplateCard) => void;
  /**
   * Additive. The empty state's "Start from a blank quiz" (item 28): starts
   * blank as the studio's start panel does. Left out, the button is too.
   */
  onStartBlank?: () => void;
  /**
   * Additive. The empty state's "Copy from another event" (item 28): opens the
   * event import picker as the start panel does. Left out, the button is too.
   */
  onCopyFromEvent?: () => void;
  /** Additive. The target is a game: the copy button reads "Copy from another quiz". */
  isGameScope?: boolean;
  /**
   * Additive (item 23). Set when the target quiz has rounds: the preview
   * offers "Add rounds from this template" with the round checklist.
   */
  onAppend?: (card: QuizshowTemplateCard, roundIndexes: number[]) => void;
  /** Additive. An import is under way: the preview's actions hold. */
  isPending?: boolean;
  /**
   * Additive. "append" (More's "Add rounds from a template"): each card's
   * action opens the preview on the round checklist, with no replace. Needs
   * `onAppend`; defaults to "replace".
   */
  mode?: "replace" | "append";
}

type TemplatePickerBodyProps = Omit<
  QuizshowTemplatePickerProps,
  "isOpen" | "onClose"
>;

function TemplateCard({
  card,
  isBlocked,
  isAppendMode,
  onPick,
  onPreview,
}: {
  card: QuizshowTemplateCard;
  isBlocked: boolean;
  isAppendMode: boolean;
  onPick: (card: QuizshowTemplateCard) => void;
  onPreview: (card: QuizshowTemplateCard) => void;
}) {
  // The gallery reads in the app's language; only the preview follows the
  // language the quiz is typed in.
  const { t, language } = useTranslation();
  const adultsTagId = useId();
  const title = templateCardTitleOf(card.title, language);
  const actionLabel = t(
    isAppendMode
      ? "quizshow:templates.preview.addRounds"
      : "quizshow:templates.use",
  );
  const previewLabel = t("quizshow:templates.preview.open");
  return (
    <li className={styles.galleryItem} aria-label={title}>
      <QuizshowGameCover
        title={title}
        roundCount={card.roundCount}
        questionCount={card.questionCount}
        isAdultsOnly={card.hasAdultsRounds}
      />
      <div className={styles.galleryBody}>
        <p className={styles.galleryDescription}>
          {templateCardTitleOf(card.description, language)}
        </p>
        {card.hasAdultsRounds && (
          <ul className={styles.tags}>
            <li
              id={adultsTagId}
              className={`${styles.tag} ${styles.tagWarning}`}
            >
              {t("quizshow:importSources.adultsTag")}
            </li>
          </ul>
        )}
        <Button
          variant="stage-ghost"
          size="md"
          className={styles.galleryAction}
          // The button names its template, since the gallery repeats it. An
          // aria-label keeps the comma glued to the label; a hidden span read
          // as "label , title".
          aria-label={`${actionLabel}, ${title}`}
          aria-disabled={isBlocked}
          aria-describedby={isBlocked ? adultsTagId : undefined}
          aria-haspopup={isAppendMode ? "dialog" : undefined}
          onClick={() => {
            if (isBlocked) return;
            if (isAppendMode) onPreview(card);
            else onPick(card);
          }}
        >
          {actionLabel}
        </Button>
        {!isAppendMode && (
          <Button
            variant="stage-ghost"
            size="sm"
            className={styles.galleryAction}
            aria-label={`${previewLabel}, ${title}`}
            aria-haspopup="dialog"
            onClick={() => onPreview(card)}
          >
            <FiEye aria-hidden /> {previewLabel}
          </Button>
        )}
      </div>
    </li>
  );
}

/** No published template yet: says why, and offers the other two ways to start. */
function TemplatePickerEmpty({
  onStartBlank,
  onCopyFromEvent,
  isGameScope = false,
}: Pick<
  TemplatePickerBodyProps,
  "onStartBlank" | "onCopyFromEvent" | "isGameScope"
>) {
  const { t } = useTranslation();
  const titleId = useId();
  const hasActions =
    onStartBlank !== undefined || onCopyFromEvent !== undefined;
  return (
    <section className={styles.pickerEmpty} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.pickerEmptyTitle}>
        {t("quizshow:templates.empty.title")}
      </h3>
      <p className={styles.pickerEmptyBody}>
        {t("quizshow:templates.empty.body")}
      </p>
      {hasActions && (
        <div className={styles.pickerEmptyActions}>
          {onStartBlank && (
            <Button variant="stage" onClick={onStartBlank}>
              <FiFilePlus aria-hidden />{" "}
              {t("quizshow:templates.empty.startBlank")}
            </Button>
          )}
          {onCopyFromEvent && (
            <Button variant="stage-ghost" onClick={onCopyFromEvent}>
              <FiCopy aria-hidden />{" "}
              {t(
                isGameScope
                  ? "quizshow:templates.empty.copyQuiz"
                  : "quizshow:templates.empty.copyEvent",
              )}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

function TemplatePickerBody({
  isAdultsAllowed,
  onPick,
  onStartBlank,
  onCopyFromEvent,
  isGameScope,
  onAppend,
  isPending = false,
  mode = "replace",
}: TemplatePickerBodyProps) {
  const { t } = useTranslation();
  const templateCards = useQuizshowTemplateCards({ isEnabled: true });
  const [previewCard, setPreviewCard] = useState<QuizshowTemplateCard | null>(
    null,
  );
  if (templateCards.isError) {
    return (
      <QuizshowPickerFade stateKey="error">
        <LoadErrorState
          compact
          title={t("quizshow:templates.loadError")}
          description={t(quizshowTemplateErrorKeyOf(templateCards.error))}
          onRetry={() => void templateCards.refetch()}
          isRetrying={templateCards.isFetching}
        />
      </QuizshowPickerFade>
    );
  }
  if (!templateCards.data) {
    return (
      <QuizshowPickerFade stateKey="loading">
        <QuizshowPickerSkeleton layout="gallery" />
      </QuizshowPickerFade>
    );
  }
  // Only a loaded, empty list: loading and a failed load return above.
  if (templateCards.data.items.length === 0) {
    return (
      <QuizshowPickerFade stateKey="empty">
        <TemplatePickerEmpty
          onStartBlank={onStartBlank}
          onCopyFromEvent={onCopyFromEvent}
          isGameScope={isGameScope}
        />
      </QuizshowPickerFade>
    );
  }
  return (
    <QuizshowPickerFade stateKey="list">
      <ul className={styles.gallery}>
        {templateCards.data.items.map((card) => (
          <TemplateCard
            key={card.id}
            card={card}
            // Adding rounds opens the preview, which holds only the adults rows.
            isBlocked={
              card.hasAdultsRounds && !isAdultsAllowed && mode !== "append"
            }
            isAppendMode={mode === "append"}
            onPick={onPick}
            onPreview={setPreviewCard}
          />
        ))}
      </ul>
      <QuizshowTemplatePreviewDialog
        templateId={previewCard?.id ?? null}
        isAdultsAllowed={isAdultsAllowed}
        canAppend={onAppend !== undefined}
        isAppendOnly={mode === "append"}
        isPending={isPending}
        onClose={() => setPreviewCard(null)}
        onUse={() => {
          if (previewCard) onPick(previewCard);
          setPreviewCard(null);
        }}
        // The preview stays open, its submit held, until the append settles;
        // the caller closes the picker, and the preview with it, once it lands.
        onAppend={(roundIndexes) => {
          if (previewCard) onAppend?.(previewCard, roundIndexes);
        }}
      />
    </QuizshowPickerFade>
  );
}

export function QuizshowTemplatePicker({
  isOpen,
  isAdultsAllowed,
  onClose,
  onPick,
  onStartBlank,
  onCopyFromEvent,
  isGameScope,
  onAppend,
  isPending,
  mode = "replace",
}: QuizshowTemplatePickerProps) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const isAppendMode = mode === "append" && onAppend !== undefined;
  // The same read the body makes (one cache entry): an empty gallery folds away
  // the header line that talks about what a template copies.
  const templateCards = useQuizshowTemplateCards({ isEnabled: isOpen });
  const isGalleryEmpty = templateCards.data?.items.length === 0;
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          key="quizshow-template-picker"
          title={t(
            isAppendMode
              ? "quizshow:studio.more.addFromTemplate"
              : "quizshow:templates.title",
          )}
          sub={t(
            isAppendMode
              ? "quizshow:templates.appendSub"
              : "quizshow:templates.sub",
          )}
          subClassName={
            isGalleryEmpty
              ? `${styles.pickerSub} ${styles.pickerSubHidden}`
              : styles.pickerSub
          }
          onClose={onClose}
          wide
          className={styles.dialog}
        >
          <div ref={darkDialogRef} />
          <TemplatePickerBody
            isAdultsAllowed={isAdultsAllowed}
            onPick={onPick}
            onStartBlank={onStartBlank}
            onCopyFromEvent={onCopyFromEvent}
            isGameScope={isGameScope}
            onAppend={onAppend}
            isPending={isPending}
            mode={isAppendMode ? "append" : "replace"}
          />
        </Modal>
      )}
    </AnimatePresence>
  );
}
