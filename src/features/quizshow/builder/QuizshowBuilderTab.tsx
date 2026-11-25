import { useEvent } from "../../gatherings/api/useEvent";
import { QuizshowEventSummaryCard } from "./QuizshowEventSummaryCard";

/**
 * The Live game tab of the Manage page: a summary of the event's quiz, with
 * Open the editor into the full-screen studio. `eventStartAt` stays in the
 * props the Manage page passes; the studio page reads the event's start itself.
 * A draft event (item 53) turns the card's lobby action into a practice lobby:
 * `isDraftEvent` when given, else the event read under the same query key the
 * card uses for its cover title.
 */
export function QuizshowBuilderTab({
  slug,
  isDraftEvent,
}: {
  slug: string;
  eventStartAt: Date;
  isDraftEvent?: boolean;
}) {
  const isDraftFromEvent = useEvent(slug).data?.gathering.isDraft === true;
  return (
    <QuizshowEventSummaryCard
      slug={slug}
      isDraftEvent={isDraftEvent ?? isDraftFromEvent}
    />
  );
}
