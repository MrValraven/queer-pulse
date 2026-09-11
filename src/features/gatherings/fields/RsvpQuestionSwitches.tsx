import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SwitchRow, SwitchRowList } from "../CreateGatheringFields";
import type { RsvpQuestions } from "../gatheringExtras";
import {
  ALWAYS_ASKED_ACCESS_ROW,
  TOGGLEABLE_RSVP_QUESTION_ROWS,
  type ToggleableRsvpQuestionRow,
} from "../steps/careChapter.data";

/**
 * The "Ask on RSVP" switches as a value and a toggle, shared by the create
 * wizard's care chapter and the edit-details modal.
 *
 * Dietary needs and pronouns switch on and off. Access needs is always asked
 * (ruling R8), so its row is locked on and takes no press, whatever
 * `questions.access` holds.
 */
export function RsvpQuestionSwitches({
  questions,
  onToggle,
  labelledBy,
}: {
  questions: RsvpQuestions;
  onToggle: (key: ToggleableRsvpQuestionRow["key"]) => void;
  /** The id of the visible label that names the list. */
  labelledBy: string;
}) {
  const { t } = useTranslation();
  return (
    <SwitchRowList labelledBy={labelledBy}>
      {TOGGLEABLE_RSVP_QUESTION_ROWS.map((questionRow) => (
        <SwitchRow
          key={questionRow.key}
          variant="listItem"
          title={t(questionRow.titleKey)}
          description={t(questionRow.descriptionKey)}
          isChecked={questions[questionRow.key]}
          onChange={() => onToggle(questionRow.key)}
        />
      ))}
      <SwitchRow
        variant="listItem"
        isLocked
        title={t(ALWAYS_ASKED_ACCESS_ROW.titleKey)}
        description={t(ALWAYS_ASKED_ACCESS_ROW.descriptionKey)}
      />
    </SwitchRowList>
  );
}
