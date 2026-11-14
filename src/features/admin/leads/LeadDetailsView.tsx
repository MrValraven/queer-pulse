import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type { LeadDTO } from "./api/leads.types";
import { LeadClearFollowUp } from "./LeadClearFollowUp";
import { mailtoHrefOf, telHrefOf } from "./leadContactLinks";
import { LeadDetailRow, LeadFollowUpValue } from "./LeadDetailRows";
import { LEAD_TYPE_LABEL_KEY } from "./leadLabels.data";
import { LeadLinkList } from "./LeadLinkList";
import { LEAD_FOLLOW_UP_DATE_OPTIONS } from "./leadsList.data";
import styles from "./LeadDetails.module.css";

/** When the lead was added and last changed, in one quiet line. */
function LeadDetailsMeta({ lead }: { lead: LeadDTO }) {
  const { t, language } = useTranslation();
  const dateOf = (value: string) =>
    formatDate(value, language, LEAD_FOLLOW_UP_DATE_OPTIONS);
  return (
    <p className={styles.meta}>
      <span>
        {t("admin:leads.details.addedOn", { date: dateOf(lead.createdAt) })}
      </span>
      <span aria-hidden>·</span>
      <span>
        {t("admin:leads.details.changedOn", { date: dateOf(lead.updatedAt) })}
      </span>
    </p>
  );
}

/**
 * The lead's details to read, under the stage row: type, location, email
 * and phone as links, the links with their platforms, and the follow-up
 * with its one-press Clear follow-up. The dates the lead was added and
 * last changed close the card; Email and Call sit in the page header.
 */
export function LeadDetailsView({
  lead,
  idPrefix,
}: {
  lead: LeadDTO;
  idPrefix: string;
}) {
  const { t } = useTranslation();
  const followUpValueId = `${idPrefix}-follow-up-value`;

  // The button folds away under the finger; the date's place, now reading
  // "Not added", takes focus so the keyboard keeps its spot.
  const followUpCleared = (shouldMoveFocus: boolean) => {
    if (shouldMoveFocus) document.getElementById(followUpValueId)?.focus();
  };

  return (
    <div className={styles.view}>
      <dl className={styles.detailList}>
        <LeadDetailRow label={t("admin:leads.field.type")} hasValue>
          {t(LEAD_TYPE_LABEL_KEY[lead.type])}
        </LeadDetailRow>
        <LeadDetailRow
          label={t("admin:leads.field.location")}
          hasValue={lead.location !== null}
        >
          <span className={styles.longValue}>{lead.location}</span>
        </LeadDetailRow>
        <LeadDetailRow
          label={t("admin:leads.field.email")}
          hasValue={lead.email !== null}
        >
          <a
            href={mailtoHrefOf(lead.email ?? "")}
            className={`${styles.valueLink} ${styles.longValue}`}
          >
            {lead.email}
          </a>
        </LeadDetailRow>
        <LeadDetailRow
          label={t("admin:leads.field.phone")}
          hasValue={lead.phone !== null}
        >
          <a
            href={telHrefOf(lead.phone ?? "")}
            className={`${styles.valueLink} ${styles.longValue}`}
          >
            {lead.phone}
          </a>
        </LeadDetailRow>
        <LeadDetailRow
          label={t("admin:leads.field.links")}
          hasValue={lead.links.length > 0}
        >
          <LeadLinkList links={lead.links} />
        </LeadDetailRow>
        <LeadDetailRow label={t("admin:leads.field.followUp")} hasValue>
          <div className={styles.followUpLine}>
            <LeadFollowUpValue lead={lead} id={followUpValueId} />
            <LeadClearFollowUp
              lead={lead}
              onCleared={followUpCleared}
              className={styles.followUpClearSlot}
            />
          </div>
        </LeadDetailRow>
      </dl>
      <div className={styles.viewFooter}>
        <LeadDetailsMeta lead={lead} />
      </div>
    </div>
  );
}
