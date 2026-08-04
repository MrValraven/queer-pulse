import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type CalendarEvent } from "./data";
import { EventCard } from "./CalendarGrid";
import styles from "./CalendarSidebar.module.css";

export function CalendarSidebar({
  selected,
  selectedEvents,
}: {
  selected: Date | null;
  selectedEvents: CalendarEvent[];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className={styles.side}>
      <div className={styles.csHead}>
        {t("gatherings:calendar.selectedDayLabel")}
      </div>
      <div className={styles.csSelectedDay}>
        {selected
          ? fmt.date(selected, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
          : t("gatherings:calendar.selectDayPrompt")}
      </div>
      <div className={styles.eventList}>
        {selected &&
          (selectedEvents.length > 0 ? (
            selectedEvents.map((event, index) => (
              <EventCard key={index} event={event} />
            ))
          ) : (
            <div className={styles.emptyDay}>
              {t("gatherings:calendar.noEventsDay")}
            </div>
          ))}
      </div>
      <div className={styles.subStrip}>
        <h3>{t("gatherings:calendar.subscribeTitle")}</h3>
        <p>{t("gatherings:calendar.subscribeBody")}</p>
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
            aria-label={t("gatherings:calendar.emailPlaceholder")}
            placeholder={t("gatherings:calendar.emailPlaceholder")}
          />
          <Button type="submit" variant="primary" disabled={subscribed}>
            {subscribed
              ? t("gatherings:calendar.subscribedCta")
              : t("gatherings:calendar.subscribeCta")}
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
          {t("gatherings:calendar.hostCta")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
