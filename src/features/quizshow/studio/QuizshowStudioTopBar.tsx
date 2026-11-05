import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowOpenLobbyButton } from "../builder/QuizshowOpenLobbyButton";
import { QuizshowTryItButton } from "../builder/QuizshowTryItButton";
import { isQuizshowSessionScope } from "../quizshowScope";
import { useQuizshowStudio } from "./QuizshowStudioContext";
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
 * The studio's 56px top bar. Left: back, the title typed in place, the save
 * status. Right: the language you type in, the 18+ switch, problems, the open
 * lobby's pill, Try it, Open lobby (or a template's publish state, Publish and
 * Save) and More. Below 1024px everything but the primary action folds into
 * More. It never clips its overflow: the blocked tooltips hang below it.
 */
export function QuizshowStudioTopBar({
  backLink,
  moreActions,
  onShowShortcuts,
}: {
  backLink: QuizshowStudioBackLink;
  moreActions: readonly QuizshowStudioMoreAction[];
  onShowShortcuts: () => void;
}) {
  const { t } = useTranslation();
  const studio = useQuizshowStudio();
  const { scope, controller, lobby, hasQuiz } = studio;
  const sessionScope = isQuizshowSessionScope(scope) ? scope : null;
  return (
    <header className={styles.bar}>
      <div className={styles.lead}>
        <QuizshowStudioBack backLink={backLink} />
        <div className={styles.titleStack}>
          <QuizshowStudioTitleField />
          {/* Nothing is saved before there is a quiz, so the start panel shows no status. */}
          {hasQuiz && <QuizshowStudioSaveStatus />}
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.wideOnly}>
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
        {sessionScope && hasQuiz && (
          <QuizshowOpenLobbyButton
            appearance="studio"
            scope={sessionScope}
            isBlocked={lobby.isBlocked}
            blockedReason={
              lobby.blockedReasonKey ? t(lobby.blockedReasonKey) : null
            }
          />
        )}
        <QuizshowStudioMoreMenu
          moreActions={moreActions}
          onShowShortcuts={onShowShortcuts}
        />
      </div>
    </header>
  );
}
