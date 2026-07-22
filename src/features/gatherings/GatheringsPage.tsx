import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  Outro,
  Reveal,
  SkeletonLine,
  Tag,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type CalendarEvent } from "./data";
import { useEvents } from "./api/useEvents";
import { HOOD_KEYS, WAYS } from "./gatheringsPage.data";
import styles from "./GatheringsPage.module.css";

/** How many of the soonest upcoming gatherings to surface on the landing. */
const FEATURED_LIMIT = 6;

function GatheringCard({ event }: { event: CalendarEvent }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <Link to={event.to} className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.date}>
          <span className={styles.dateDd}>
            {fmt.date(event.date, { day: "2-digit" })}
          </span>
          <span className={styles.dateMm} style={{ color: event.orgColor }}>
            {fmt.date(event.date, { month: "short" })}
          </span>
        </div>
        <div className={styles.badges}>
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
            <span className={styles.ticket}>
              {t("gatherings:events.ticketedTag")}
            </span>
          )}
        </div>
      </div>
      <span className={styles.org} style={{ color: event.orgColor }}>
        {event.org}
      </span>
      <h3 className={styles.cardTitle}>{event.title}</h3>
      <div className={styles.meta}>
        <span>{event.hood}</span>
        <span className={styles.dot} aria-hidden />
        <span>{fmt.time(event.date)}</span>
        {event.ticketed && event.priceMin !== undefined && (
          <>
            <span className={styles.dot} aria-hidden />
            <span className={styles.price}>
              {event.priceMax !== undefined
                ? t("gatherings:events.priceRange", {
                    min: fmt.currency(event.priceMin),
                    max: fmt.currency(event.priceMax),
                  })
                : t("gatherings:events.priceSingle", {
                    price: fmt.currency(event.priceMin),
                  })}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

function GatheringCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.cardTop}>
        <SkeletonLine width={46} height={46} />
        <SkeletonLine width={72} height={22} />
      </div>
      <SkeletonLine width="38%" height={12} style={{ marginTop: 18 }} />
      <SkeletonLine width="85%" height={20} style={{ marginTop: 12 }} />
      <SkeletonLine width="55%" height={12} style={{ marginTop: 14 }} />
    </div>
  );
}

export function GatheringsPage() {
  const { t } = useTranslation();
  const { items, isLoading } = useEvents({ filter: "upcoming" });
  const featured = useMemo(() => items.slice(0, FEATURED_LIMIT), [items]);
  const noneUpcoming = !isLoading && featured.length === 0;

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <Reveal className={styles.eyebrow}>
            {t("gatherings:landing.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            <Translation
              i18nKey="gatherings:landing.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            {t("gatherings:landing.hero.lead")}
          </Reveal>
          <Reveal className={styles.hoods} delay={160}>
            {HOOD_KEYS.map((hoodKey) => (
              <span key={hoodKey} className={styles.hood}>
                {t(hoodKey)}
              </span>
            ))}
          </Reveal>
        </div>
      </header>

      <section className={styles.section}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            <Translation
              i18nKey="gatherings:landing.ways.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            {t("gatherings:landing.ways.lead")}
          </Reveal>
          <div className={styles.grid}>
            {WAYS.map((way, index) => (
              <Reveal
                key={way.titleKey}
                className={styles.wayCard}
                delay={index * 55}
              >
                <div className={styles.wayIcon}>
                  <way.icon />
                </div>
                <div className={styles.wayTitle}>{t(way.titleKey)}</div>
                <div className={styles.wayBody}>{t(way.bodyKey)}</div>
                <Link to={way.to} className={styles.wayLink}>
                  {t(way.ctaKey)} →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <div className={styles.sectionHeadText}>
              <Reveal as="h2" className={styles.h2}>
                <Translation
                  i18nKey="gatherings:landing.featured.title"
                  components={{ em: <em /> }}
                />
              </Reveal>
              <Reveal as="p" className={styles.leadP} delay={60}>
                {t("gatherings:landing.featured.lead")}
              </Reveal>
            </div>
            {!noneUpcoming && (
              <Reveal delay={100}>
                <Button
                  variant="ghost"
                  to={routes.events}
                  className={styles.headAction}
                >
                  {t("gatherings:landing.outro.browseCta")}
                </Button>
              </Reveal>
            )}
          </div>

          {isLoading ? (
            <div className={styles.cards}>
              {Array.from({ length: 4 }).map((_, index) => (
                <GatheringCardSkeleton key={index} />
              ))}
            </div>
          ) : noneUpcoming ? (
            <EmptyState
              icon={<FiCalendar />}
              title={t("gatherings:events.emptyTitle")}
              description={t("gatherings:events.emptyDescription")}
              action={{
                label: t("gatherings:landing.outro.hostCta"),
                to: routes.host,
              }}
            />
          ) : (
            <div className={styles.cards}>
              {featured.map((event, index) => (
                <Reveal
                  key={`${event.title}-${event.date.toISOString()}`}
                  delay={index * 55}
                >
                  <GatheringCard event={event} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="gatherings:landing.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("gatherings:landing.outro.sub")}
      >
        <Button to={routes.events} variant="primary" size="lg">
          {t("gatherings:landing.outro.browseCta")}
        </Button>
        <Button to={routes.host} variant="ghost-dark" size="lg">
          {t("gatherings:landing.outro.hostCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
