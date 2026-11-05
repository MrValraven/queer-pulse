import {
  QuizshowImportButtons,
  type QuizshowImportPicker,
} from "../builder/QuizshowImportButtons";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { QuizshowStudioDarkStamp } from "./QuizshowStudioDarkStamp";

/**
 * The template and source pickers behind More's "Replace with a template"
 * and "Replace with another quiz", on an event or a game that holds a quiz.
 * A pick asks the existing replace confirm (dark here); the autosave lands
 * first, so the import never meets our own save as a conflict, and the
 * import follows through `start.importDraft`.
 */
export function QuizshowStudioReplacePickers({
  picker,
  onPickerChange,
}: {
  picker: QuizshowImportPicker | null;
  onPickerChange: (picker: QuizshowImportPicker | null) => void;
}) {
  const { start, data, save } = useQuizshowStudio();
  if (start.sessionScope === null) return null;
  return (
    <QuizshowImportButtons
      scope={start.sessionScope}
      hasQuiz={(data.quiz?.rounds.length ?? 0) > 0 || save.isUnsaved}
      eventStartAt={start.eventStartAt}
      isAdultsEvent={start.isAdultsEvent}
      variant="toolbar"
      onImported={start.importDraft}
      openPicker={picker}
      onOpenPickerChange={onPickerChange}
      isButtonsHidden
      confirmChildren={<QuizshowStudioDarkStamp />}
      beforeImport={save.saveFirst}
    />
  );
}
