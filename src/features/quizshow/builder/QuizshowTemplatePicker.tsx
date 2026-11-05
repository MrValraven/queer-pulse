import { useId, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Button,
  LoadErrorState,
  Modal,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowTemplateCard } from "../../../shared/contracts/quizshow";
import { useQuizshowTemplateCards } from "../api/useQuizshowTemplates";
import { quizshowTemplateErrorKeyOf } from "../templates/quizshowTemplateErrors";
import { templateCardTitleOf } from "../templates/quizshowTemplateResponse";
import { QuizshowGameCover } from "../games/QuizshowGameCover";
import { useQuizshowDarkDialog } from "./useQuizshowDarkDialog";
import styles from "./QuizshowImport.module.css";

const FADE_EASE = [0.22, 0.68, 0.16, 1] as const;
const SKELETON_ROW_KEYS = ["first", "second", "third", "fourth"] as const;

/** Swaps a picker's loading, error and list bodies with an opacity fade. */
export function QuizshowPickerFade({
  stateKey,
  children,
}: {
  stateKey: string;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const transition = { duration: reducedMotion ? 0 : 0.2, ease: FADE_EASE };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={stateKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

/** Placeholder rows for a picker's list, or cover-shaped cards for the template gallery. */
export function QuizshowPickerSkeleton({
  layout = "list",
}: {
  layout?: "list" | "gallery";
}) {
  if (layout === "gallery") {
    return (
      <div aria-hidden className={styles.gallery}>
        {SKELETON_ROW_KEYS.map((cardKey) => (
          <SkeletonLine
            key={cardKey}
            height="auto"
            style={{ aspectRatio: "4 / 3", borderRadius: "var(--radius-20)" }}
          />
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={styles.skeletonRow}>
          <SkeletonLine
            height={72}
            style={{ borderRadius: "var(--radius-16)" }}
          />
        </div>
      ))}
    </div>
  );
}

interface QuizshowTemplatePickerProps {
  isOpen: boolean;
  /** False blocks a template with an adults round, with the adults tag as the reason. */
  isAdultsAllowed: boolean;
  onClose: () => void;
  onPick: (card: QuizshowTemplateCard) => void;
}

type TemplatePickerBodyProps = Omit<
  QuizshowTemplatePickerProps,
  "isOpen" | "onClose"
>;

function TemplateCard({
  card,
  isBlocked,
  onPick,
}: {
  card: QuizshowTemplateCard;
  isBlocked: boolean;
  onPick: (card: QuizshowTemplateCard) => void;
}) {
  const { t, language } = useTranslation();
  const adultsTagId = useId();
  const title = templateCardTitleOf(card.title, language);
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
          aria-disabled={isBlocked}
          aria-describedby={isBlocked ? adultsTagId : undefined}
          onClick={() => {
            if (!isBlocked) onPick(card);
          }}
        >
          {t("quizshow:templates.use")}
          {/* The button names its template, since the gallery repeats it. */}
          <span className="visuallyHidden">{`, ${title}`}</span>
        </Button>
      </div>
    </li>
  );
}

function TemplatePickerBody({
  isAdultsAllowed,
  onPick,
}: TemplatePickerBodyProps) {
  const { t } = useTranslation();
  const templateCards = useQuizshowTemplateCards({ isEnabled: true });
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
  if (templateCards.data.items.length === 0) {
    return (
      <QuizshowPickerFade stateKey="empty">
        <p className={styles.emptyNote}>{t("quizshow:templates.empty")}</p>
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
            isBlocked={card.hasAdultsRounds && !isAdultsAllowed}
            onPick={onPick}
          />
        ))}
      </ul>
    </QuizshowPickerFade>
  );
}

export function QuizshowTemplatePicker({
  isOpen,
  isAdultsAllowed,
  onClose,
  onPick,
}: QuizshowTemplatePickerProps) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          key="quizshow-template-picker"
          title={t("quizshow:templates.title")}
          sub={t("quizshow:templates.sub")}
          onClose={onClose}
          wide
          className={styles.dialog}
        >
          <div ref={darkDialogRef} />
          <TemplatePickerBody
            isAdultsAllowed={isAdultsAllowed}
            onPick={onPick}
          />
        </Modal>
      )}
    </AnimatePresence>
  );
}
