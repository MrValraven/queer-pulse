import { useQuizshowDarkDialog } from "../builder/useQuizshowDarkDialog";

/**
 * Put inside a shared dialog opened from the studio: it turns the whole
 * dialog dark, since the Modal portals to the body, outside the studio root.
 */
export function QuizshowStudioDarkStamp() {
  const darkDialogRef = useQuizshowDarkDialog();
  return <span ref={darkDialogRef} hidden />;
}
