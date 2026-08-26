import { useId, useState } from "react";
import { FiSend } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useEventAnnouncements,
  useSendEventAnnouncement,
} from "./api/useEventAnnouncements";
import { MAX_EVENT_ANNOUNCEMENT_LENGTH } from "./api/events.api";
import { messageRelativeTime } from "./manageGatheringDates";
import styles from "./ManageGatheringPage.module.css";

/**
 * The real "tell everyone who's coming" surface (LOC-06).
 *
 * It reaches everyone holding a live RSVP plus everyone holding a standing
 * invite, as an in-app notification and a push. This platform sends no email,
 * so nothing here says or implies that one went out, and the sent list reports
 * how many members the fan-out actually reached rather than inventing an open
 * rate for a channel that has none.
 */
export function ManageAnnouncements({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const composerLabelId = useId();
  const { showToast } = useToast();
  const { data: announcements, isPending } = useEventAnnouncements(slug);
  const sendAnnouncement = useSendEventAnnouncement(slug);
  const [message, setMessage] = useState("");

  const trimmed = message.trim();
  const canSend =
    trimmed.length > 0 &&
    trimmed.length <= MAX_EVENT_ANNOUNCEMENT_LENGTH &&
    !sendAnnouncement.isPending;

  const send = () => {
    if (!canSend) return;
    sendAnnouncement.mutate(trimmed, {
      onSuccess: () => {
        setMessage("");
        showToast(t("gatherings:manage.announcements.sentToast"), "success");
      },
      onError: () =>
        showToast(t("gatherings:manage.announcements.errorToast"), "error"),
    });
  };

  return (
    <div>
      <div className={styles.composerCard}>
        <div className={styles.compLabel} id={composerLabelId}>
          {t("gatherings:manage.announcements.composerLabel")}
        </div>
        <textarea
          aria-labelledby={composerLabelId}
          className={styles.compTa}
          maxLength={MAX_EVENT_ANNOUNCEMENT_LENGTH}
          placeholder={t("gatherings:manage.announcements.placeholder")}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <div className={styles.compFooter}>
          <div className={styles.compHint}>
            {t("gatherings:manage.announcements.deliveryHint")}
          </div>
          <Button variant="primary" disabled={!canSend} onClick={send}>
            {sendAnnouncement.isPending
              ? t("gatherings:manage.announcements.sendingCta")
              : t("gatherings:manage.announcements.sendCta")}
          </Button>
        </div>
      </div>

      <div className={styles.prevLabel}>
        {t("gatherings:manage.announcements.previousHeading")}
      </div>

      {isPending ? (
        <div className={styles.msgList}>
          <SkeletonLine width="90%" height={16} />
          <SkeletonLine width="70%" height={16} style={{ marginTop: 10 }} />
        </div>
      ) : (
        <div className={styles.msgList}>
          {(announcements ?? []).length === 0 && (
            <EmptyState
              compact
              icon={<FiSend />}
              title={t("gatherings:manage.announcements.emptyTitle")}
              description={t(
                "gatherings:manage.announcements.emptyDescription",
              )}
            />
          )}
          {(announcements ?? []).map((announcement) => (
            <div className={styles.msgCard} key={announcement.id}>
              <div className={styles.msgHeader}>
                <div className={styles.msgSubject}>
                  {announcement.author
                    ? `${announcement.author.firstName} ${announcement.author.lastName}`.trim()
                    : t("gatherings:gathering.announcements.fromOrganiser")}
                </div>
                <div className={styles.msgTime}>
                  {messageRelativeTime(
                    new Date(announcement.createdAt),
                    t,
                    fmt,
                  )}
                </div>
              </div>
              <div className={styles.msgPreview}>{announcement.body}</div>
              <div className={styles.openRate}>
                {t("gatherings:manage.announcements.reached", {
                  count: announcement.recipientCount,
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
