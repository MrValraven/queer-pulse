import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { FiBookmark } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  EVENT_PILL_LOCATION,
  EVENT_TITLE_EM,
  EVENT_TITLE_LINE,
} from "./eventPage.data";
import { EventPageBody, EventPageHero } from "./EventPageSections";
import { EventRsvpCard } from "./EventRsvpCard";
import { EventRsvpStickyBar } from "./EventRsvpStickyBar";
import { JoinVouchCallout } from "./JoinVouchCallout";
import styles from "./EventPage.module.css";

export function EventPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();

  // The static EventPage mirrors the RSVP card's stable placeholder slug so the
  // saved item lines up with a real event once this page is data-driven.
  const savedId = "event:welcome-dinner";
  const eventTitle = `${EVENT_TITLE_LINE} ${EVENT_TITLE_EM}`;
  const saved = isSaved(savedId);

  function handleToggleSave() {
    const nowSaved = toggleSave({
      id: savedId,
      kind: "event",
      title: eventTitle,
      href: routes.event,
      meta: EVENT_PILL_LOCATION,
    });
    showToast(
      t(
        nowSaved
          ? "gatherings:event.save.savedToast"
          : "gatherings:event.save.removedToast",
      ),
      "success",
    );
  }

  return (
    <PageShell>
      <EventPageHero />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <EventPageBody />

            <div className={styles.aside} id="event-rsvp-aside">
              <EventRsvpCard />

              <div className={styles.saveEventRow}>
                <Button
                  variant="ghost"
                  onClick={handleToggleSave}
                  aria-pressed={saved}
                  aria-label={t(
                    saved
                      ? "gatherings:event.save.unsaveAriaLabel"
                      : "gatherings:event.save.saveAriaLabel",
                    { title: eventTitle },
                  )}
                  style={{ width: "100%" }}
                >
                  <FiBookmark
                    aria-hidden
                    fill={saved ? "currentColor" : "none"}
                  />
                  {t(
                    saved
                      ? "gatherings:event.save.saved"
                      : "gatherings:event.save.cta",
                  )}
                </Button>
              </div>

              <div className={styles.membersOnly}>
                <div
                  className="mo-title"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--jade)",
                    marginBottom: 6,
                  }}
                >
                  {t("gatherings:event.membersOnly.title")}
                </div>
                <p>{t("gatherings:event.membersOnly.body")}</p>
              </div>

              <div className={styles.calloutWrap}>
                <JoinVouchCallout />
              </div>
            </div>
          </div>
        </div>
      </div>

      <EventRsvpStickyBar targetId="event-rsvp-aside" />
    </PageShell>
  );
}
