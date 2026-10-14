import { useId } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSceneEventView } from "./api/studioDiscovery.adapters";
import styles from "./studio.module.css";
import css from "./StudioScene.module.css";

/** Up to six upcoming events, soonest first, each linking to its event
 *  page. Folded away when the scene has none. */
export function StudioSceneEvents({
  events,
}: {
  events: StudioSceneEventView[];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const headingId = useId();
  return (
    <Collapse isOpen={events.length > 0}>
      <section className={styles.row} aria-labelledby={headingId}>
        <div className={styles.rowH}>
          <h2 id={headingId}>
            <Translation
              i18nKey="studio:scene.events.title"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <ul className={css.events}>
          {events.map((event) => (
            <li key={event.slug}>
              <Link to={event.href} className={css.eventCard}>
                <span className={css.eventTitle}>{event.title}</span>
                <span className={css.eventDate}>
                  {fmt.date(new Date(event.startAt), {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: event.timezone,
                  })}
                </span>
                {(event.isOnline || event.placeName) && (
                  <span className={css.eventPlace}>
                    {event.isOnline
                      ? t("studio:scene.events.online")
                      : event.placeName}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Collapse>
  );
}
