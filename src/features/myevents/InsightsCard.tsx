import { Button } from "../../shared/components/ui";
import { linkToPath } from "../../app/routeMap";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { yearInsights } from "./myEvents.helpers";

const BROWSE = linkToPath("QueerPulse Gathering.html");

/** "Your year so far" plum stats panel beneath the calendar. */
export function InsightsCard() {
  const { events } = useMyEvents();
  const { attended, hosted, streak, topCircle } = yearInsights(events);

  // No gatherings yet this year → an oriented empty state, never a fake tally.
  if (attended === 0) {
    return (
      <div className={sx("insights")}>
        <div className={sx("ins-eyebrow")}>Your year so far</div>
        <div className={sx("ins-stat")}>
          Your year <em>starts</em> here
        </div>
        <div className={sx("ins-sub")}>
          Once you go to your first gathering, it'll gather here — a quiet count
          of where you've been this year.
        </div>
        <div className={sx("ins-empty-cta")}>
          <Button variant="ghost-dark" to={BROWSE}>
            Find your first one
          </Button>
        </div>
      </div>
    );
  }

  const gatheringWord = attended === 1 ? "gathering" : "gatherings";
  return (
    <div className={sx("insights")}>
      <div className={sx("ins-eyebrow")}>Your year so far</div>
      <div className={sx("ins-stat")}>
        <em>{attended}</em> {gatheringWord}
      </div>
      <div className={sx("ins-sub")}>
        Every gathering you've shown up for this year.
      </div>
      <div className={sx("ins-row")}>
        <div className={sx("ins-item")}>
          <div className={sx("ins-n")}>{streak}</div>
          <div className={sx("ins-l")}>
            {streak === 1 ? "month" : "months"} in a row
          </div>
        </div>
        {topCircle && (
          <div className={sx("ins-item")}>
            <div className={sx("ins-n")}>{topCircle}</div>
            <div className={sx("ins-l")}>your top circle</div>
          </div>
        )}
        <div className={sx("ins-item")}>
          <div className={sx("ins-n")}>{hosted}</div>
          <div className={sx("ins-l")}>you hosted</div>
        </div>
      </div>
    </div>
  );
}
