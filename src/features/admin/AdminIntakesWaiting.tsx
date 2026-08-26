import { FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminIntakeList, type AdminIntakesQuery } from "./AdminIntakeList";
import { AdminInquiryList, type AdminInquiriesQuery } from "./AdminInquiryList";
import styles from "./AdminSubmissionList.module.css";

/**
 * The landing view, and the only question this console really has to answer:
 * is anything waiting for a human today.
 *
 * It is both queues pinned to their untouched rows — the contact and
 * partnership messages nobody has read, and the intake submissions nobody has
 * picked up — with the oldest wait visible on every row. When both are empty it
 * says so once instead of showing two empty lists.
 */
export function AdminIntakesWaiting({
  intakesQuery,
  inquiriesQuery,
}: {
  intakesQuery: AdminIntakesQuery;
  inquiriesQuery: AdminInquiriesQuery;
}) {
  const { t } = useTranslation();
  const isSettled =
    !intakesQuery.isLoading &&
    !inquiriesQuery.isLoading &&
    !intakesQuery.isError &&
    !inquiriesQuery.isError;
  const isAllClear =
    isSettled &&
    intakesQuery.intakes.length === 0 &&
    inquiriesQuery.inquiries.length === 0;

  if (isAllClear) {
    return (
      <p className={styles.allClear}>
        <FiCheckCircle className={styles.allClearIcon} aria-hidden />
        {t("admin:adminIntakes.waiting.allClear")}
      </p>
    );
  }

  return (
    <div className={styles.waitingSections}>
      <section className={styles.waitingSection}>
        <h2 className={styles.sectionHeading}>
          {t("admin:adminIntakes.waiting.inquiriesHeading", {
            count: inquiriesQuery.total,
          })}
        </h2>
        <p className={styles.sectionNote}>
          {t("admin:adminIntakes.waiting.inquiriesNote")}
        </p>
        <AdminInquiryList
          query={inquiriesQuery}
          emptyText={t("admin:adminIntakes.waiting.inquiriesEmpty")}
        />
      </section>

      <section className={styles.waitingSection}>
        <h2 className={styles.sectionHeading}>
          {t("admin:adminIntakes.waiting.intakesHeading", {
            count: intakesQuery.total,
          })}
        </h2>
        <p className={styles.sectionNote}>
          {t("admin:adminIntakes.waiting.intakesNote")}
        </p>
        <AdminIntakeList
          query={intakesQuery}
          emptyText={t("admin:adminIntakes.waiting.intakesEmpty")}
        />
      </section>
    </div>
  );
}
