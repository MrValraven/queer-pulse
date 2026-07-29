import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { EmptyState, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type CalendarEvent } from "./data";
import { CALENDAR_TODAY, WEEKDAY_REFERENCE } from "./calendar.data";
import { sameDay } from "./calendarGrid.helpers";
import styles from "./CalendarGrid.module.css";

export function EventCardSkeleton() {
  return (
    <div className={styles.eventCard} aria-hidden>
      <div className={styles.ecDate}>
        <SkeletonLine width={26} height={26} />
        <SkeletonLine width={28} height={11} style={{ marginTop: 4 }} />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="40%" height={11} />
        <SkeletonLine width="80%" height={14.5} style={{ marginTop: 6 }} />
        <SkeletonLine width="55%" height={12.5} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

export function EventCard({ event }: { event: CalendarEvent }) {
  const navigate = useNavigate();
  const fmt = useFormat();
  return (
    <div
      className={styles.eventCard}
      onClick={() => void navigate(event.to)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void navigate(event.to);
        }
      }}
    >
      <div className={styles.ecDate}>
        <div className={styles.ecD}>{event.date.getDate()}</div>
        <div className={styles.ecM} style={{ color: event.orgColor }}>
          {fmt.date(event.date, { month: "short" })}
        </div>
      </div>
      <div>
        <div className={styles.ecOrg} style={{ color: event.orgColor }}>
          {event.org}
        </div>
        <div className={styles.ecTitle}>{event.title}</div>
        <div className={styles.ecMeta}>
          {event.hood} · {fmt.time(event.date)}
        </div>
      </div>
    </div>
  );
}

export function MonthGrid({
  view,
  selected,
  eventsForDate,
  changeMonth,
  onSelect,
}: {
  view: { year: number; month: number };
  selected: Date | null;
  eventsForDate: (date: Date) => CalendarEvent[];
  changeMonth: (delta: number) => void;
  onSelect: (date: Date) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const firstDayOffset = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const monthLabelDate = new Date(view.year, view.month, 1);

  return (
    <>
      <div className={styles.monthNav}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => changeMonth(-1)}
          aria-label={t("gatherings:calendar.prevMonth")}
        >
          <FiChevronLeft />
        </button>
        <div className={styles.monthLabel}>
          {fmt.date(monthLabelDate, { month: "long", year: "numeric" })}
        </div>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => changeMonth(1)}
          aria-label={t("gatherings:calendar.nextMonth")}
        >
          <FiChevronRight />
        </button>
      </div>
      <div className={styles.grid}>
        <div className={styles.weekdays}>
          {WEEKDAY_REFERENCE.map((referenceDate) => (
            <div key={referenceDate.getDate()} className={styles.wd}>
              {fmt.date(referenceDate, { weekday: "short" })}
            </div>
          ))}
        </div>
        <div className={styles.days}>
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className={`${styles.day} ${styles.empty}`}
            />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(view.year, view.month, day);
            const events = eventsForDate(date);
            const isToday = sameDay(date, CALENDAR_TODAY);
            const isSelected = selected !== null && sameDay(date, selected);
            return (
              <button
                type="button"
                key={day}
                className={[
                  styles.day,
                  isToday && styles.today,
                  events.length > 0 && styles.hasEvent,
                  isSelected && styles.selected,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => events.length > 0 && onSelect(date)}
              >
                <div className={styles.dayNum}>{day}</div>
                {events.length > 0 && (
                  <div className={styles.dayDots}>
                    {events.map((e, idx) => (
                      <span
                        key={idx}
                        className={styles.dayDot}
                        style={{ background: e.orgColor }}
                        title={e.title}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function AllUpcomingEvents({
  loading,
  upcoming,
}: {
  loading: boolean;
  upcoming: CalendarEvent[];
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.allEvents}>
      <h3>{t("gatherings:calendar.upcomingTitle")}</h3>
      <div className={styles.eventList}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <EventCardSkeleton key={i} />)
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={<FiCalendar />}
            title={t("gatherings:calendar.emptyTitle")}
            description={t("gatherings:calendar.emptyDescription")}
            action={{
              label: t("gatherings:calendar.browseEventsCta"),
              to: routes.events,
            }}
          />
        ) : (
          upcoming.map((event, index) => (
            <FadeIn key={index} delay={Math.min(index, 8) * 60}>
              <EventCard event={event} />
            </FadeIn>
          ))
        )}
      </div>
    </div>
  );
}
