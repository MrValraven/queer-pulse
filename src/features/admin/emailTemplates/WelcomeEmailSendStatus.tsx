import { FiCheck } from "react-icons/fi";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useJoinRequestShortDate } from "../joinRequestShortDate";
import styles from "./WelcomeEmailSendGroup.module.css";

/**
 * The welcome email's send record for one approved applicant, read off the
 * server: a muted "Not sent yet" before the first send, then a check with how
 * many times it went out and the date of the latest send, in the same short
 * date the Decided row prints. The line is a live region, so a screen reader
 * hears the new count as soon as a send lands.
 */
export function WelcomeEmailSendStatus({
  sendCount,
  lastSentAt,
}: {
  sendCount: number;
  /** ISO timestamp of the latest send, or null when none went out. */
  lastSentAt: string | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const shortDate = useJoinRequestShortDate();
  const isSent = sendCount > 0;
  const lastSentOn = shortDate(lastSentAt);

  return (
    <p
      className={`${styles.status} ${isSent ? styles.statusSent : ""}`}
      role="status"
    >
      {isSent ? (
        <>
          <FiCheck aria-hidden />
          <span>
            <Translation
              i18nKey="admin:emailTemplates.send.status.sent"
              values={{ count: sendCount }}
              slots={{
                count: (
                  <RollingNumber
                    value={format.number(sendCount)}
                    numericValue={sendCount}
                  />
                ),
              }}
            />
            {lastSentOn &&
              ` · ${t("admin:emailTemplates.send.status.lastOn", {
                date: lastSentOn,
              })}`}
          </span>
        </>
      ) : (
        t("admin:emailTemplates.send.status.notSent")
      )}
    </p>
  );
}
