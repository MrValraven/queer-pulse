import { eventScope } from "../quizshowScope";
import { QuizshowBuilder } from "./QuizshowBuilder";

/** The Live game tab of the Manage page: write the quiz, save it, open the lobby. */
export function QuizshowBuilderTab({
  slug,
  eventStartAt,
}: {
  slug: string;
  eventStartAt: Date;
}) {
  return (
    <QuizshowBuilder scope={eventScope(slug)} eventStartAt={eventStartAt} />
  );
}
