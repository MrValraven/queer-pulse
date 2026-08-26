import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { intlLocale } from "../../shared/i18n/locale";
import { formatDate } from "../../shared/lib/date";
import { businessPath } from "../../app/routeMap";
import { AdminChip, AdminDrawer } from "./ui";
import { NOMINATION_STATUS_LABEL_KEY } from "./adminSafeSpaceGovernance.data";
import { AdminSafeSpaceNominationActions } from "./AdminSafeSpaceNominationActions";
import { AdminSafeSpaceVisitBar } from "./AdminSafeSpaceVisitBar";
import { useAdminSafeSpaceNominationAudit } from "../safety/api/useAdminSafeSpaceNominations";
import type { AdminSafeSpaceNominationDTO } from "../safety/api/safeSpaceGovernance.api";
import styles from "./AdminSafeSpaceGovernance.module.css";

/**
 * One nomination, with everything the decision needs: the member's own words,
 * the 48-hour clock, the independent-visit tally, the listing under review,
 * and the append-only audit trail.
 */
export function AdminSafeSpaceNominationDrawer({
  nomination,
  onClose,
}: {
  nomination: AdminSafeSpaceNominationDTO;
  onClose: () => void;
}) {
  const { t, language } = useTranslation();
  const locale = intlLocale(language);
  const { trail, isLoading } = useAdminSafeSpaceNominationAudit(nomination.id);
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return (
    <AdminDrawer
      label={nomination.placeName}
      onClose={onClose}
      head={
        <>
          <div className={styles.rowTop}>
            <span className={styles.rowName}>{nomination.placeName}</span>
            <AdminChip
              tone={nomination.hasBreachedAcknowledgement ? "danger" : "plum"}
              dot
            >
              {t(NOMINATION_STATUS_LABEL_KEY[nomination.status])}
            </AdminChip>
          </div>
          <div className={styles.rowMeta}>
            {t("safety:governance.row.age", {
              count: nomination.ageHours,
              hours: nomination.ageHours,
            })}
          </div>
        </>
      }
      foot={
        nomination.listing && (
          <Button
            variant="ghost"
            to={businessPath(nomination.listing.slug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("safety:governance.detail.openListingCta")}
          </Button>
        )
      }
    >
      {nomination.reason && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {t("safety:governance.detail.nominatorWords")}
          </h3>
          <p className={styles.quote}>{nomination.reason}</p>
        </section>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t("safety:governance.detail.clock")}
        </h3>
        <dl>
          <div className={styles.detailRow}>
            <dt>{t("safety:governance.detail.received")}</dt>
            <dd>
              {formatDate(nomination.receivedAt, locale, dateTimeOptions)}
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt>{t("safety:governance.detail.dueBy")}</dt>
            <dd>
              {formatDate(
                nomination.acknowledgementDueAt,
                locale,
                dateTimeOptions,
              )}
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt>{t("safety:governance.detail.acknowledged")}</dt>
            <dd>
              {nomination.acknowledgedAt
                ? formatDate(nomination.acknowledgedAt, locale, dateTimeOptions)
                : t("safety:governance.detail.notYet")}
            </dd>
          </div>
          {nomination.placeType && (
            <div className={styles.detailRow}>
              <dt>{t("safety:governance.detail.placeType")}</dt>
              <dd>{nomination.placeType}</dd>
            </div>
          )}
          {nomination.address && (
            <div className={styles.detailRow}>
              <dt>{t("safety:governance.detail.address")}</dt>
              <dd>{nomination.address}</dd>
            </div>
          )}
        </dl>
      </section>

      <AdminSafeSpaceVisitBar visits={nomination.visits} />

      {nomination.assignmentNote && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {t("safety:governance.detail.assignmentNote")}
          </h3>
          <p className={styles.quote}>{nomination.assignmentNote}</p>
        </section>
      )}

      {nomination.decisionReason && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {t("safety:governance.detail.decision")}
          </h3>
          <p className={styles.quote}>{nomination.decisionReason}</p>
        </section>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t("safety:governance.detail.trail")}
        </h3>
        {isLoading ? (
          <SkeletonLine width="70%" height={14} />
        ) : trail.length === 0 ? (
          <p className={styles.visitNote}>
            {t("safety:governance.detail.trailEmpty")}
          </p>
        ) : (
          <div className={styles.trail}>
            {trail.map((entry) => (
              <div key={entry.id} className={styles.trailItem}>
                <span className={styles.trailAction}>
                  {t(`safety:governance.audit.${entry.action}`)}
                </span>
                {formatDate(entry.createdAt, locale, dateTimeOptions)}
                {entry.reason ? ` · ${entry.reason}` : ""}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t("safety:governance.detail.decide")}
        </h3>
        <AdminSafeSpaceNominationActions nomination={nomination} />
      </section>
    </AdminDrawer>
  );
}
