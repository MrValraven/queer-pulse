import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
import type { CommunityEvent } from "./community.model";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

function EventRow({ ev }: { ev: CommunityEvent }) {
  const { t } = useTranslation();
  // Link to the specific gathering when this row mirrors a real one; otherwise
  // fall back to the gatherings landing (fabricated rows have no detail page).
  const to = ev.slug ? gatheringPath(ev.slug) : routes.gatherings;
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
          <Link to={to} className={styles.recapLink}>
            {t("communities:detail.events.recapCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        )
      ) : (
        <Button variant="primary" to={to}>
          {t("communities:detail.events.rsvpCta")}
        </Button>
      )}
    </div>
  );
}

export function EventsTab({ events }: { events: CommunityEvent[] }) {
  const { t } = useTranslation();
  // Show every upcoming gathering (soonest first — the list is date-ordered),
  // not just the next one; the sidebar already highlights the single soonest.
  const upcoming = events.filter((e) => !e.past);
  const past = events.filter((e) => e.past);
  return (
    <div>
      <div className={detail.secLbl}>
        {t("communities:detail.events.upcoming")}{" "}
        <FeatureHelp id="community.events" />
      </div>
      {upcoming.length > 0 ? (
        upcoming.map((ev) => <EventRow key={ev.id} ev={ev} />)
      ) : (
        <p className={styles.eventsEmpty}>
          {t("communities:detail.events.noUpcoming")}
        </p>
      )}

      {past.length > 0 && (
        <>
          <div className={detail.secLbl} style={{ marginTop: 32 }}>
            {t("communities:detail.events.past")}
          </div>
          {past.map((ev) => (
            <EventRow key={ev.id} ev={ev} />
          ))}
        </>
      )}
    </div>
  );
}
