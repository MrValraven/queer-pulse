import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { WAITLIST } from "./gatheringDashboard.data";
import styles from "./GatheringDashboardPage.module.css";

/**
 * Collapsible waitlist section inside the guest-list card, with
 * promote-to-list.
 *
 * This only renders inside `GatheringDashboardPage`, the day-of check-in
 * dashboard, which has no live counterpart at all yet (no `:slug`/`useEvent`
 * wiring, static `INITIAL_GUESTS` throughout) — mirrors `ManageGatheringPage`'s
 * "message attendees" precedent: a real promote-to-going endpoint now exists
 * (`RsvpService.promoteAttendee`, wired live in `ManageAttendeesTab`'s own
 * waitlist section), but this specific button stays demo-only rather than
 * fake a live effect from a page that has no real guest list to promote
 * within. Building a live day-of dashboard is a separate, larger pass.
 */
export function GuestWaitlist() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <>
      <div
        className={styles.waitlistToggle}
        onClick={() => setWaitlistOpen((open) => !open)}
        role="button"
        tabIndex={0}
        aria-expanded={waitlistOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setWaitlistOpen((open) => !open);
          }
        }}
      >
        <span>{waitlistOpen ? <FiChevronDown /> : <FiChevronRight />}</span>{" "}
        {t("gatherings:dashboard.guestList.waitlistToggle", {
          count: WAITLIST.length,
        })}
      </div>
      {waitlistOpen && (
        <div>
          {WAITLIST.map((waitlisted) => (
            <div className={styles.attRow} key={waitlisted.name}>
              <div
                className={styles.attAv}
                style={{
                  background: waitlisted.background,
                  color: waitlisted.color,
                }}
              >
                {waitlisted.initials}
              </div>
              <div className={styles.attInfo}>
                <div className={styles.attName}>{waitlisted.name}</div>
                <div className={styles.attMeta}>
                  {waitlisted.pronouns} ·{" "}
                  {t("gatherings:dashboard.waitlist.position", {
                    position: waitlisted.waitlistPosition,
                  })}
                </div>
              </div>
              <button
                type="button"
                className={styles.promoteBtn}
                onClick={() =>
                  showToast(
                    t("gatherings:dashboard.guestList.promotedToast", {
                      name: waitlisted.name.split(" ")[0]!,
                    }),
                    "success",
                  )
                }
              >
                {t("gatherings:dashboard.guestList.promoteCta")}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
