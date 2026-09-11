import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiClock,
  FiInfo,
  FiLink,
  FiMapPin,
  FiMessageSquare,
} from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GatheringForm } from "../useGatheringForm";
import {
  askedOnRsvpLabels,
  isOnlineGathering,
  previewRsvpCloseLine,
} from "./gatheringPreviewReading";
import styles from "./GatheringPreviewPanel.module.css";

function AttendeesRow({
  icon: RowIcon,
  children,
}: {
  icon: IconType;
  children: ReactNode;
}) {
  return (
    <div className={styles.attendeesRow}>
      <RowIcon aria-hidden />
      <span className={styles.attendeesRowBody}>{children}</span>
    </div>
  );
}

/**
 * What a confirmed attendee reads beyond the board card: the address (or the
 * join link), directions, the access note, when RSVPs close and what the RSVP
 * form asks. House rules sit on the board card itself, since the gathering
 * page shows them to everyone before they RSVP.
 */
export function PreviewAttendeesBlock({
  form,
  startAt,
  occurrenceCount,
}: {
  form: GatheringForm;
  startAt: Date | null;
  occurrenceCount: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const joinLink = form.onlineUrl.trim();
  const address = form.address.trim();
  const directions = form.directions.trim();
  const accessNotes = form.accessNotes.trim();
  const askedLabels = askedOnRsvpLabels(form, t);
  return (
    <div className={styles.attendees}>
      <p className={styles.attendeesLabel}>
        {t("gatherings:create.v2.preview.attendeesLabel")}
      </p>
      {isOnlineGathering(form) ? (
        <AttendeesRow icon={FiLink}>
          {joinLink || (
            <span className={styles.placeholder}>
              {t("gatherings:create.v2.preview.joinLinkPlaceholder")}
            </span>
          )}
        </AttendeesRow>
      ) : (
        <AttendeesRow icon={FiMapPin}>
          {address ? (
            <span>{address}</span>
          ) : (
            <span className={styles.placeholder}>
              {t("gatherings:create.v2.preview.addressPlaceholder")}
            </span>
          )}
          {directions && <span>{directions}</span>}
        </AttendeesRow>
      )}
      {accessNotes && <AttendeesRow icon={FiInfo}>{accessNotes}</AttendeesRow>}
      <AttendeesRow icon={FiClock}>
        {previewRsvpCloseLine(form, startAt, occurrenceCount, fmt, t)}
      </AttendeesRow>
      <AttendeesRow icon={FiMessageSquare}>
        <span>{t("gatherings:create.v2.preview.askedOnRsvp")}</span>
        <span className={styles.questionChips}>
          {askedLabels.map((label, index) => (
            <span key={`${index}-${label}`} className={styles.questionChip}>
              {label}
            </span>
          ))}
        </span>
      </AttendeesRow>
    </div>
  );
}
