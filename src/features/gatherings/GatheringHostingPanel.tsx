import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { manageGatheringPath } from "./gatheringPaths";
import styles from "./GatheringPage.module.css";

/**
 * The sidebar panel the host sees on their own gathering, in place of the
 * RSVP control.
 *
 * The host is going by definition: the server saves their Going RSVP when the
 * gathering is created and refuses to let them step down to "maybe" or cancel
 * it. So RSVP, Maybe and the cutoff note would all be offers the host cannot
 * take up. This says what is true instead (you're hosting, and you hold one of
 * the spots), shows how many are going so far, and hands them the way to
 * Manage, where attendees, announcements and the day-of tools live.
 *
 * It wears the plum "you're in" panel of `RsvpConfirmedPanel`, so it reads as
 * the same family of state, with the same quiet ghost-dark button: the hero's
 * Manage button stays the page's one coral action. Nothing here is live-only: demo renders it from
 * the mock gathering, and the Manage link resolves in both modes.
 */
export function GatheringHostingPanel({
  gatheringSlug,
  capacity,
  goingCount,
  isCountVisible,
}: {
  gatheringSlug: string;
  /** The gathering's cap; `null` means no cap, so there are no spots to
   *  take. `undefined` (the demo registry) is unknown and reads as capped. */
  capacity: number | null | undefined;
  /** Going members so far, the host included. */
  goingCount: number;
  /** False while the attendee count is withheld; the count line then goes. */
  isCountVisible: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // A zero can only mean the count has not reached this viewer yet (the host
  // is always one of them), so the line only shows a real number.
  const shouldShowCount = isCountVisible && goingCount > 0;
  const noteKey =
    capacity === null
      ? "gatherings:rsvpControl.hostingNoteUncapped"
      : "gatherings:rsvpControl.hostingNote";

  return (
    <div className={styles.rsvpPanel}>
      <div className={styles.rsvpConfirm}>
        <div className={styles.rsvpConfirmHead}>
          <span className={styles.rsvpConfirmIcon} aria-hidden>
            <FiCheckCircle />
          </span>
          <Translation
            i18nKey="gatherings:rsvpControl.hostingTitle"
            components={{ em: <em /> }}
          />
        </div>
        <p className={styles.rsvpConfirmNote}>{t(noteKey)}</p>
        {shouldShowCount && (
          <p className={styles.rsvpConfirmNote}>
            <Translation
              i18nKey="gatherings:rsvpControl.hostingCount"
              values={{ count: goingCount }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(goingCount)}
                    numericValue={goingCount}
                  />
                ),
              }}
            />
          </p>
        )}
        <div className={styles.rsvpActions}>
          <Button
            variant="ghost-dark"
            className={styles.fullBtn}
            to={manageGatheringPath(gatheringSlug)}
          >
            {t("gatherings:rsvpControl.hostingManageCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
