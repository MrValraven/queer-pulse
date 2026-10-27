import type { QuizshowQuizResponse } from "../../../shared/contracts/quizshow";
import { isQuizshowSessionScope, type QuizshowScope } from "../quizshowScope";
import type { QuizshowDraft } from "./quizshowDraft";
import type { QuizshowLocalProblem } from "./quizshowValidation";
import { QuizshowBuilderHeading } from "./QuizshowBuilderHeading";
import {
  QuizshowImportButtons,
  type QuizshowImportPicker,
} from "./QuizshowImportButtons";
import { QuizshowOpenLobbyButton } from "./QuizshowOpenLobbyButton";
import { QuizshowTryItButton } from "./QuizshowTryItButton";
import styles from "./QuizshowBuilder.module.css";

interface QuizshowBuilderToolbarProps {
  scope: QuizshowScope;
  importProps: {
    hasQuiz: boolean;
    eventStartAt: Date | null;
    isAdultsEvent: boolean;
    initialImportPicker: QuizshowImportPicker | null;
    onImported: (response: QuizshowQuizResponse) => void;
  };
  tryItProps: {
    draft: QuizshowDraft;
    pickedPreviewUrls: ReadonlyMap<string, string>;
    problems: readonly QuizshowLocalProblem[];
  };
  lobbyProps: {
    isBlocked: boolean;
    blockedReason: string | null;
    blockedDescriptionId?: string;
  };
}

/**
 * The builder's heading row: the heading, the import buttons, Try it and Open
 * lobby. A template has no session to open and nothing to copy from, so its
 * row holds the heading and Try it.
 */
export function QuizshowBuilderToolbar({
  scope,
  importProps,
  tryItProps,
  lobbyProps,
}: QuizshowBuilderToolbarProps) {
  const sessionScope = isQuizshowSessionScope(scope) ? scope : null;
  return (
    <div className={styles.headingRow}>
      <QuizshowBuilderHeading scope={scope} />
      <div className={styles.headingActions}>
        {/* The scope kind is fixed for the life of the builder, so this part mounts by kind. */}
        {sessionScope && (
          <div className={styles.importActions}>
            <QuizshowImportButtons
              scope={sessionScope}
              hasQuiz={importProps.hasQuiz}
              eventStartAt={importProps.eventStartAt}
              isAdultsEvent={importProps.isAdultsEvent}
              variant="toolbar"
              initialOpenPicker={importProps.initialImportPicker}
              onImported={importProps.onImported}
            />
          </div>
        )}
        <QuizshowTryItButton
          draft={tryItProps.draft}
          pickedPreviewUrls={tryItProps.pickedPreviewUrls}
          problems={tryItProps.problems}
        />
        {/* The scope kind is fixed for the life of the builder, so this part mounts by kind. */}
        {sessionScope && (
          <QuizshowOpenLobbyButton
            scope={sessionScope}
            isBlocked={lobbyProps.isBlocked}
            blockedReason={lobbyProps.blockedReason}
            blockedDescriptionId={lobbyProps.blockedDescriptionId}
          />
        )}
      </div>
    </div>
  );
}
