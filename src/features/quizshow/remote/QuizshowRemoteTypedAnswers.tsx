import { AnimatePresence } from "motion/react";
import { useId } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowHostTypedAnswers,
  QuizshowTypedAnswerGroup,
} from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowRemoteErrorLine } from "./QuizshowRemoteControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import remoteStyles from "./QuizshowRemote.module.css";
import styles from "./QuizshowRemoteRescore.module.css";

interface TypedAnswerRowProps {
  controller: QuizshowSessionController;
  group: QuizshowTypedAnswerGroup;
  phaseId: string;
  questionId: string;
}

/**
 * One wrong spelling and how many wrote it. Each row sends through its own
 * command hook, so accepting one group never holds another group's button
 * and a refusal shows under the row it belongs to.
 */
function TypedAnswerRow({
  controller,
  group,
  phaseId,
  questionId,
}: TypedAnswerRowProps) {
  const { t } = useTranslation();
  const textId = useId();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const isAcceptBusy = isPending("host:acceptAnswer");

  return (
    <div className={styles.groupRow}>
      <div className={remoteStyles.row}>
        <div className={remoteStyles.rowBody}>
          <p id={textId} className={remoteStyles.rowText}>
            {group.sampleText}
          </p>
          <p className={remoteStyles.rowMeta}>
            <span className={remoteStyles.count}>
              {t("quizshow:remote.rescore.acceptedCount", {
                count: group.count,
              })}
            </span>
          </p>
        </div>
        <div className={remoteStyles.rowActions}>
          <Button
            variant="stage-ghost"
            size="md"
            aria-describedby={textId}
            aria-disabled={isAcceptBusy}
            onClick={() => {
              if (isAcceptBusy) return;
              // The server compares its own normalised key, so the group's key goes back as it came.
              void run("host:acceptAnswer", {
                phaseId,
                questionId,
                normalisedText: group.normalisedText,
              });
            }}
          >
            {t("quizshow:remote.rescore.accept")}
          </Button>
        </div>
      </div>
      <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
    </div>
  );
}

/**
 * The wrong typed answers of the question on show (C6.4 rule 9). An accepted
 * group leaves the next `typed:answers` frame, so its row folds away.
 */
export function QuizshowRemoteTypedAnswers({
  controller,
  typedAnswers,
  phaseId,
  questionId,
}: {
  controller: QuizshowSessionController;
  typedAnswers: QuizshowHostTypedAnswers | null;
  phaseId: string;
  questionId: string;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  // A frame left over from another question shows nothing.
  const groups =
    typedAnswers !== null && typedAnswers.questionId === questionId
      ? typedAnswers.groups
      : [];

  return (
    <div className={styles.subsection} role="group" aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.subTitle}>
        {t("quizshow:remote.rescore.typedTitle")}
      </h3>
      <Collapse isOpen={groups.length === 0}>
        <p className={remoteStyles.hint}>
          {t("quizshow:remote.rescore.typedEmpty")}
        </p>
      </Collapse>
      <ul className={remoteStyles.list}>
        <AnimatePresence initial={false}>
          {groups.map((group) => (
            <CollapseListItem key={group.normalisedText}>
              <TypedAnswerRow
                controller={controller}
                group={group}
                phaseId={phaseId}
                questionId={questionId}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
