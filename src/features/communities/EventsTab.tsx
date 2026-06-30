import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { CommunityEvent } from "./community.model";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

function EventRow({ ev }: { ev: CommunityEvent }) {
  return (
    <div
      className={[styles.eventRow, ev.past && styles.eventPast]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={detail.gDate}>
        <div className={detail.gDd}>{ev.dd}</div>
        <div className={detail.gDm}>{ev.mm}</div>
      </div>
      <div className={styles.eventMain}>
        <div className={detail.gTitle}>{ev.title}</div>
        <div className={detail.gMeta}>
          {ev.meta}
          {ev.spots ? ` · ${ev.spots}` : ""}
        </div>
      </div>
      {ev.past ? (
        ev.recapHref && (
          <Link to={routes.gathering} className={styles.recapLink}>
            Read recap <FiArrowRight aria-hidden />
          </Link>
        )
      ) : (
        <Button variant="primary" to={routes.gathering}>
          RSVP
        </Button>
      )}
    </div>
  );
}

export function EventsTab({ events }: { events: CommunityEvent[] }) {
  const upcoming = events.filter((e) => !e.past);
  const past = events.filter((e) => e.past);
  return (
    <div>
      <div className={detail.secLbl}>Upcoming gatherings</div>
      {upcoming.map((ev) => (
        <EventRow key={ev.id} ev={ev} />
      ))}

      {past.length > 0 && (
        <>
          <div className={detail.secLbl} style={{ marginTop: 32 }}>
            Past gatherings
          </div>
          {past.map((ev) => (
            <EventRow key={ev.id} ev={ev} />
          ))}
        </>
      )}
    </div>
  );
}
