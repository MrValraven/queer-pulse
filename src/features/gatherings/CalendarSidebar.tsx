import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { type CalendarEvent } from "./data";
import { EventCard } from "./CalendarGrid";
import styles from "./CalendarPage.module.css";

export function CalendarSidebar({
  selected,
  selectedEvents,
}: {
  selected: Date | null;
  selectedEvents: CalendarEvent[];
}) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className={styles.side}>
      <div className={styles.csHead}>Selected day</div>
      <div className={styles.csSelectedDay}>
        {selected
          ? selected.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
          : "Click any day with events to see details"}
      </div>
      <div className={styles.eventList}>
        {selected &&
          (selectedEvents.length > 0 ? (
            selectedEvents.map((event, index) => (
              <EventCard key={index} event={event} />
            ))
          ) : (
            <div className={styles.emptyDay}>No events on this day.</div>
          ))}
      </div>
      <div className={styles.subStrip}>
        <h3>Subscribe to calendar</h3>
        <p>
          Get all queer community events delivered to your calendar app. Works
          with Google Calendar, Apple Calendar, and Outlook.
        </p>
        <form
          className={styles.subForm}
          onSubmit={(event) => {
            event.preventDefault();
            setSubscribed(true);
          }}
        >
          <input
            className={styles.subInput}
            type="email"
            placeholder="your@email.com"
          />
          <Button type="submit" variant="primary" disabled={subscribed}>
            {subscribed ? "Subscribed" : "Subscribe"}
          </Button>
        </form>
      </div>
      <div style={{ marginTop: 16 }}>
        <Link
          to={routes.host}
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--accent-ink)",
          }}
        >
          Host your own gathering →
        </Link>
      </div>
    </div>
  );
}
