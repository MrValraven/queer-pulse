import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  type QuizshowSourceTemplateRef,
} from "../../../shared/contracts/quizshow";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useEvent } from "../../gatherings/api/useEvent";
import { QuizshowOpenLobbyButton } from "../builder/QuizshowOpenLobbyButton";
import { QuizshowTemplatePreviewDialog } from "../builder/QuizshowTemplatePreviewDialog";
import { QuizshowTryItButton } from "../builder/QuizshowTryItButton";
import { useQuizshowImport } from "../builder/useQuizshowImport";
import {
  isQuizshowSessionScope,
  type QuizshowEventScope,
  type QuizshowSessionScope,
} from "../quizshowScope";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { QuizshowStudioDarkStamp } from "./QuizshowStudioDarkStamp";
import {
  QuizshowStudioMoreMenu,
  type QuizshowStudioMoreAction,
} from "./QuizshowStudioMoreMenu";
import { QuizshowStudioProblems } from "./QuizshowStudioProblems";
import { QuizshowStudioSaveStatus } from "./QuizshowStudioSaveStatus";
import {
  QuizshowStudioPublishControls,
  QuizshowStudioTemplateSave,
} from "./QuizshowStudioTemplateControls";
import {
  QuizshowStudioAdultsToggle,
  QuizshowStudioLivePill,
  QuizshowStudioViewLanguage,
} from "./QuizshowStudioTopBarControls";
import styles from "./QuizshowStudioTopBar.module.css";

export interface QuizshowStudioBackLink {
  to: string;
  labelKey: string;
}

/** Back to My games, the event's Manage page or the templates list. */
export function QuizshowStudioBack({
  backLink,
}: {
  backLink: QuizshowStudioBackLink;
}) {
  const { t } = useTranslation();
  const label = t(backLink.labelKey);
  return (
    <Link to={backLink.to} className={styles.back} aria-label={label}>
      <FiChevronLeft aria-hidden className={styles.backIcon} />
      <span className={styles.backLabel} aria-hidden>
        {label}
      </span>
    </Link>
  );
}

/** The quiz title, typed in place. A game's title names the game. */
function QuizshowStudioTitleField() {
  const { t } = useTranslation();
  const { controller, scope } = useQuizshowStudio();
  const isGame = scope.kind === "game";
  return (
    <input
      className={styles.title}
      type="text"
      value={controller.draft.title}
      maxLength={QUIZSHOW_LIMITS.quizTitleMax}
      aria-label={t(
        isGame
          ? "quizshow:games.new.titleLabel"
          : "quizshow:settings.title.label",
      )}
      placeholder={t("quizshow:studio.titlePlaceholder")}
      autoComplete="off"
      spellCheck
      enterKeyHint="done"
      onChange={(event) => controller.setQuizField("title", event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
    />
  );
}

/**
 * From this width the bar has room for "Open a practice lobby"; below it a
 * draft event's button reads "Open lobby" and the save line carries the
 * "Practice" tag (item 53).
 */
const STUDIO_PRACTICE_LABEL_QUERY = "(min-width: 1280px)";

/** Open lobby, blocked while unsaved or while a problem is listed. */
function QuizshowStudioOpenLobby({
  scope,
  isPracticeOnly = false,
}: {
  scope: QuizshowSessionScope;
  isPracticeOnly?: boolean;
}) {
  const { t } = useTranslation();
  const { controller, lobby } = useQuizshowStudio();
  const hasRoomForPracticeLabel = useMediaQuery(STUDIO_PRACTICE_LABEL_QUERY);
  return (
    <QuizshowOpenLobbyButton
      appearance="studio"
      scope={scope}
      rounds={controller.draft.rounds}
      isBlocked={lobby.isBlocked}
      blockedReason={lobby.blockedReasonKey ? t(lobby.blockedReasonKey) : null}
      isPracticeOnly={isPracticeOnly}
      isLabelShort={!hasRoomForPracticeLabel}
    />
  );
}

/**
 * C6.25: after a newer publish of the template the quiz was copied from, a
 * "See what changed" chip with an accent dot. Wide bar only: below 1024px More
 * carries it, and the Quiz settings inspector names the template at every
 * width.
 */
function QuizshowStudioTemplateUpdateChip({
  onSeeWhatChanged,
}: {
  onSeeWhatChanged: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="stage-ghost"
      size="sm"
      className={`${styles.reviewButton} ${styles.updateChip}`}
      aria-haspopup="dialog"
      onClick={onSeeWhatChanged}
    >
      <span className={styles.updateDot} aria-hidden />
      {t("quizshow:studio.seeWhatChanged")}
    </Button>
  );
}

/**
 * "See what changed" (C6.25): the template preview with the change note on
 * top. Nothing merges by itself: "Add rounds from this template" or "Use this
 * template" runs the import through the studio's save-first path, and an
 * append keeps the preview open, its submit held, until it settles.
 */
function QuizshowStudioTemplateChanges({
  scope,
  sourceTemplate,
  isOpen,
  onClose,
}: {
  scope: QuizshowSessionScope;
  sourceTemplate: QuizshowSourceTemplateRef;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { start, save } = useQuizshowStudio();
  const { requestImport, requestAppend, confirmDialog, isPending } =
    useQuizshowImport(scope, {
      hasQuiz: true,
      onImported: start.importDraft,
      confirmChildren: <QuizshowStudioDarkStamp />,
      beforeImport: save.saveFirst,
    });
  const templateImport = {
    from: "template",
    templateId: sourceTemplate.templateId,
  } as const;
  return (
    <>
      <QuizshowTemplatePreviewDialog
        templateId={isOpen ? sourceTemplate.templateId : null}
        isAdultsAllowed={start.isAdultsEvent}
        changeNote={sourceTemplate.changeNote}
        canAppend
        isPending={isPending}
        onClose={onClose}
        onUse={() => {
          onClose();
          requestImport(templateImport);
        }}
        onAppend={(roundIndexes) => {
          void requestAppend(templateImport, roundIndexes).then((isAdded) => {
            if (isAdded) onClose();
          });
        }}
      />
      {confirmDialog}
    </>
  );
}

interface QuizshowStudioTopBarProps {
  backLink: QuizshowStudioBackLink;
  moreActions: readonly QuizshowStudioMoreAction[];
  onShowShortcuts: () => void;
}

/**
 * The studio's 56px top bar. Left: back, the title typed in place, the save
 * status. Right: "See what changed" after a template update, the language you
 * type in, the 18+ switch, problems, the open lobby's pill or Open lobby (or a
 * template's publish state, Publish and Save) and More. Below 1024px
 * everything but the primary action folds into More. The open lobby's own
 * line is a strip under the bar (QuizshowStudioLobbyStrip). The bar never
 * clips its overflow: the blocked tooltips hang below it.
 */
export function QuizshowStudioTopBar(props: QuizshowStudioTopBarProps) {
  const { scope } = useQuizshowStudio();
  if (scope.kind === "event") {
    return <QuizshowStudioEventTopBar scope={scope} {...props} />;
  }
  return <QuizshowStudioTopBarLayout isDraftEvent={false} {...props} />;
}

/**
 * An event's bar: a draft event opens a practice lobby (item 53), since the
 * server refuses a scored one. It reads the event under the route param the
 * studio page reads, so both share one cached read.
 */
function QuizshowStudioEventTopBar({
  scope,
  ...props
}: QuizshowStudioTopBarProps & { scope: QuizshowEventScope }) {
  const { slug: routeParam } = useParams();
  const isDraftEvent =
    useEvent(routeParam ?? scope.eventSlug).data?.gathering.isDraft === true;
  return <QuizshowStudioTopBarLayout isDraftEvent={isDraftEvent} {...props} />;
}

function QuizshowStudioTopBarLayout({
  backLink,
  moreActions,
  onShowShortcuts,
  isDraftEvent,
}: QuizshowStudioTopBarProps & { isDraftEvent: boolean }) {
  const studio = useQuizshowStudio();
  const { scope, controller, hasQuiz } = studio;
  const sessionScope = isQuizshowSessionScope(scope) ? scope : null;
  const [isTemplateChangesOpen, setIsTemplateChangesOpen] = useState(false);
  // The saved quiz's template, on an event or a game (C6.25).
  const sourceTemplate =
    hasQuiz && studio.start.sessionScope !== null
      ? (studio.data.quiz?.sourceTemplate ?? null)
      : null;
  // An open lobby or a game in play: its pill is the one lobby control, so Open lobby steps aside.
  const isLobbyLive = studio.data.liveSession !== null;
  const openTemplateChanges = () => setIsTemplateChangesOpen(true);
  return (
    <header className={styles.bar}>
      <div className={styles.lead}>
        <QuizshowStudioBack backLink={backLink} />
        <div className={styles.titleStack}>
          <QuizshowStudioTitleField />
          {/* Nothing is saved before there is a quiz, so the start panel shows no status. */}
          {hasQuiz && (
            <QuizshowStudioSaveStatus
              isPractice={
                isDraftEvent &&
                (!isLobbyLive || studio.data.liveSession?.isPractice === true)
              }
            />
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.wideOnly}>
          {sourceTemplate?.hasUpdate && (
            <QuizshowStudioTemplateUpdateChip
              onSeeWhatChanged={openTemplateChanges}
            />
          )}
          <QuizshowStudioViewLanguage />
          <QuizshowStudioAdultsToggle />
        </div>
        {hasQuiz && <QuizshowStudioProblems />}
        <div className={styles.livePillSlot}>
          <QuizshowStudioLivePill />
        </div>
        <div className={styles.wideOnly}>
          {hasQuiz && (
            <QuizshowTryItButton
              appearance="studio"
              draft={controller.draft}
              pickedPreviewUrls={controller.pickedPreviewUrls}
              problems={studio.dryRunProblems}
            />
          )}
          <QuizshowStudioPublishControls />
        </div>
        <QuizshowStudioTemplateSave />
        {sessionScope && hasQuiz && !isLobbyLive && (
          <QuizshowStudioOpenLobby
            scope={sessionScope}
            isPracticeOnly={isDraftEvent}
          />
        )}
        <QuizshowStudioMoreMenu
          moreActions={moreActions}
          onShowShortcuts={onShowShortcuts}
          templateChanges={
            sourceTemplate?.hasUpdate
              ? { sourceTemplate, onOpen: openTemplateChanges }
              : null
          }
        />
      </div>
      {sourceTemplate && studio.start.sessionScope && (
        <QuizshowStudioTemplateChanges
          scope={studio.start.sessionScope}
          sourceTemplate={sourceTemplate}
          isOpen={isTemplateChangesOpen}
          onClose={() => setIsTemplateChangesOpen(false)}
        />
      )}
    </header>
  );
}
