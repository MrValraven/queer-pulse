import { QuizshowEventSummaryCard } from "./QuizshowEventSummaryCard";

/**
 * The Live game tab of the Manage page: a summary of the event's quiz, with
 * Open the editor into the full-screen studio. `eventStartAt` stays in the
 * props the Manage page passes; the studio page reads the event's start itself.
 */
export function QuizshowBuilderTab({
  slug,
}: {
  slug: string;
  eventStartAt: Date;
}) {
  return <QuizshowEventSummaryCard slug={slug} />;
}
