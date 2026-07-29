import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCalendar, FiTag } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  Eyebrow,
  Reveal,
  SectionHead,
  SkeletonLine,
  Tag,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type CalendarEvent } from "./data";
import { useEvents } from "./api/useEvents";
import { EVENT_CATEGORIES, eventsHeader } from "./eventsPage.data";
import styles from "./EventsPage.module.css";

function EventCard({ event }: { event: CalendarEvent }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fmt = useFormat();

  function buyTicket(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    void navigate(routes.checkout);
  }

  return (
    <Link to={event.to} className={styles.card}>
      <div className={styles.date}>
        <span className={styles.day}>{event.date.getDate()}</span>
        <span className={styles.month} style={{ color: event.orgColor }}>
          {fmt.date(event.date, { month: "short" })}
        </span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.orgRow}>
          <span className={styles.org} style={{ color: event.orgColor }}>
            {event.org}
          </span>
          <Tag
            className={
              event.kind === "event" ? styles.badgeEvent : styles.badgeGathering
            }
          >
            {event.kind === "event"
              ? t("gatherings:events.kindEvent")
              : t("gatherings:events.kindGathering")}
          </Tag>
          {event.ticketed && (
            <span className={styles.ticketTag}>
              {t("gatherings:events.ticketedTag")}
            </span>
          )}
        </div>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        <div className={styles.meta}>
          <span>{event.hood}</span>
          <span className={styles.dot} aria-hidden />
          <span>{fmt.time(event.date)}</span>
        </div>
        {event.ticketed && (
          <span
            role="button"
            tabIndex={0}
            className={styles.buyBtn}
            onClick={buyTicket}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") buyTicket(e);
            }}
          >
            <FiTag aria-hidden /> {t("gatherings:events.buyTicketCta")}
            {event.priceMin !== undefined && (
              <span className={styles.buyPrice}>
                {event.priceMax !== undefined
                  ? t("gatherings:events.priceRange", {
                      min: fmt.currency(event.priceMin),
                      max: fmt.currency(event.priceMax),
                    })
                  : t("gatherings:events.priceSingle", {
                      price: fmt.currency(event.priceMin),
                    })}
              </span>
            )}
          </span>
        )}
      </div>
      <span className={styles.cta} aria-hidden>
        →
      </span>
    </Link>
  );
}

function EventSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.date}>
        <SkeletonLine width={28} height={28} />
      </div>
      <div className={styles.cardBody} style={{ flex: 1 }}>
        <SkeletonLine width="35%" height={12} />
        <SkeletonLine width="80%" height={18} style={{ marginTop: 10 }} />
        <SkeletonLine width="55%" height={12} style={{ marginTop: 10 }} />
      </div>
    </div>
  );
}

export function EventsPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [active, setActive] = useState("all");
  const {
    items: events,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useEvents({ filter: "upcoming" });
  const loading = isLoading;
  const noEvents = !loading && events.length === 0;

  const filtered = useMemo(() => {
    const cat = EVENT_CATEGORIES.find((c) => c.key === active);
    if (!cat?.colors) return events;
    return events.filter((e) => cat.colors!.includes(e.orgColor));
  }, [active, events]);

  const months = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of filtered) {
      const key = fmt.date(event.date, { month: "long", year: "numeric" });
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered, fmt]);

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Eyebrow>{t(eventsHeader.eyebrowKey)}</Eyebrow>
          <SectionHead
            title={
              <Translation
                i18nKey="gatherings:events.heroTitle"
                components={{ em: <em /> }}
              />
            }
            subtitle={t(eventsHeader.subtitleKey)}
            action={
              noEvents ? undefined : (
                <Button variant="ghost" to={routes.calendar}>
                  {t("gatherings:events.viewCalendarCta")}
                </Button>
              )
            }
          />
        </div>
      </header>

      <div className={styles.body}>
        <div className="wrap">
          {!noEvents && (
            <div
              className={styles.filters}
              role="tablist"
              aria-label={t("gatherings:events.filterAriaLabel")}
            >
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={active === cat.key}
                  className={`${styles.chip} ${active === cat.key ? styles.chipActive : ""}`}
                  onClick={() => setActive(cat.key)}
                >
                  <span
                    className={styles.chipDot}
                    style={{ background: cat.dot }}
                    aria-hidden
                  />
                  {t(cat.labelKey)}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className={styles.list}>
              {Array.from({ length: 5 }).map((_, i) => (
                <EventSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {months.map(([label, events]) => (
                <section key={label} className={styles.group}>
                  <h2 className={styles.groupTitle}>{label}</h2>
                  <div className={styles.list}>
                    {events.map((event, index) => (
                      <Reveal
                        key={`${event.title}-${event.date.toISOString()}`}
                        delay={index * 40}
                      >
                        <EventCard event={event} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              ))}

              {noEvents ? (
                <EmptyState
                  icon={<FiCalendar />}
                  title={t("gatherings:events.emptyTitle")}
                  description={t("gatherings:events.emptyDescription")}
                />
              ) : (
                filtered.length === 0 && (
                  <EmptyState
                    icon={<FiCalendar />}
                    title={t("gatherings:events.emptyFilterTitle")}
                    description={t("gatherings:events.emptyFilterDescription")}
                    action={{
                      label: t("gatherings:events.showAllCta"),
                      onClick: () => setActive("all"),
                    }}
                    secondaryAction={{
                      label: t("gatherings:events.viewCalendarCta"),
                      to: "/calendar",
                    }}
                  />
                )
              )}

              {hasNextPage && (
                <div className={styles.loadMore}>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isFetchingNextPage}
                    onClick={fetchNextPage}
                  >
                    {isFetchingNextPage
                      ? t("gatherings:events.loadingMore")
                      : t("gatherings:events.loadMoreCta")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
