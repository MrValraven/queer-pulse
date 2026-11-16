import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  AdminVolunteerHoursCommunityRowDTO,
  AdminVolunteerHoursOpportunityRowDTO,
} from "./api/adminVolunteerHours.api";
import {
  AdminEmptyState,
  AdminPanel,
  AdminTable,
  adminTableClasses,
} from "./ui";
import styles from "./AdminVolunteerHoursPage.module.css";

/**
 * The two breakdown tables of the volunteer-hours report (SUS-05).
 *
 * Real `<table>` elements inside `AdminTable`, each in a flush `AdminPanel`
 * whose title names it, with a row header per row, so a screen reader
 * announces "Kitchen shift, 68 sessions, 238 hours" as one row. Hours run in a
 * tabular-numerals column so a reader can compare them down the page.
 *
 * When the server says a list hit its ceiling, the panel says so underneath.
 * A silently truncated list reads as "this is everything", and the totals
 * above these tables are exact whether or not the lists are complete.
 */

function CappedNote({ isCapped, limit }: { isCapped: boolean; limit: number }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  if (!isCapped) return null;
  return (
    <p className={styles.capped}>
      {t("admin:volunteerHours.capped", { limit: fmt.number(limit) })}
    </p>
  );
}

export function VolunteerHoursByOpportunityTable({
  rows,
  isCapped,
  limit,
}: {
  rows: AdminVolunteerHoursOpportunityRowDTO[];
  isCapped: boolean;
  limit: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const caption = t("admin:volunteerHours.byOpportunity.caption");
  return (
    <AdminPanel title={caption} padding="flush">
      <AdminTable label={caption} isBare>
        <thead>
          <tr>
            <th scope="col">
              {t("admin:volunteerHours.byOpportunity.roleHeader")}
            </th>
            <th scope="col" className={adminTableClasses.numeric}>
              {t("admin:volunteerHours.sessionsHeader")}
            </th>
            <th scope="col" className={adminTableClasses.numeric}>
              {t("admin:volunteerHours.hoursHeader")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.opportunitySlug}>
              <th scope="row">
                {row.role}
                <span className={styles.rowSub}>{row.org}</span>
              </th>
              <td className={adminTableClasses.numeric}>
                {fmt.number(row.sessionCount)}
              </td>
              <td className={adminTableClasses.numeric}>
                {fmt.number(row.hoursContributed)}
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {rows.length === 0 && (
        <div className={styles.emptyInset}>
          <AdminEmptyState
            size="inline"
            title={t("admin:volunteerHours.byOpportunity.empty")}
          />
        </div>
      )}
      <CappedNote isCapped={isCapped} limit={limit} />
    </AdminPanel>
  );
}

export function VolunteerHoursByCommunityTable({
  rows,
  isCapped,
  limit,
}: {
  rows: AdminVolunteerHoursCommunityRowDTO[];
  isCapped: boolean;
  limit: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const caption = t("admin:volunteerHours.byCommunity.caption");
  return (
    <AdminPanel title={caption} padding="flush">
      <AdminTable label={caption} isBare>
        <thead>
          <tr>
            <th scope="col">
              {t("admin:volunteerHours.byCommunity.communityHeader")}
            </th>
            <th scope="col" className={adminTableClasses.numeric}>
              {t("admin:volunteerHours.sessionsHeader")}
            </th>
            <th scope="col" className={adminTableClasses.numeric}>
              {t("admin:volunteerHours.hoursHeader")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.communityId}>
              <th scope="row">
                {row.communityName ??
                  t("admin:volunteerHours.byCommunity.unresolved")}
                {row.communitySlug && (
                  <span className={styles.rowSub}>/{row.communitySlug}</span>
                )}
              </th>
              <td className={adminTableClasses.numeric}>
                {fmt.number(row.sessionCount)}
              </td>
              <td className={adminTableClasses.numeric}>
                {fmt.number(row.hoursContributed)}
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {rows.length === 0 && (
        <div className={styles.emptyInset}>
          <AdminEmptyState
            size="inline"
            title={t("admin:volunteerHours.byCommunity.empty")}
          />
        </div>
      )}
      <CappedNote isCapped={isCapped} limit={limit} />
    </AdminPanel>
  );
}
