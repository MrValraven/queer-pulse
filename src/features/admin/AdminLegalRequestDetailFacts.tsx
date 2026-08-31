import type { ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { AdminChip } from "./ui";
import type { AdminLegalRequestDTO } from "./api/adminLegalRequests.api";
import styles from "./AdminLegalRequestsPage.module.css";

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className={styles.detailTerm}>{term}</dt>
      <dd className={styles.detailValue}>{children}</dd>
    </div>
  );
}

/**
 * Every field of one register row, as a description list.
 *
 * A field with nothing in it says so in words. "Nothing was disclosed" and "we
 * have not recorded what was disclosed" are different answers, and a pane that
 * rendered both as a blank line would flatten them into the reassuring one.
 */
export function AdminLegalRequestDetailFacts({
  record,
}: {
  record: AdminLegalRequestDTO;
}) {
  const { t, language } = useTranslation();
  const shortDate = (value: string) =>
    formatDate(value, language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <dl className={styles.detailList}>
      <Fact term={t("admin:legalRequests.field.jurisdiction")}>
        {record.jurisdiction}
      </Fact>
      <Fact term={t("admin:legalRequests.field.requestType")}>
        {t(`admin:legalRequests.type.${record.requestType}`)}
      </Fact>
      <Fact term={t("admin:legalRequests.field.receivedOn")}>
        {shortDate(record.receivedOn)}
      </Fact>
      <Fact term={t("admin:legalRequests.field.outcome")}>
        {t(`admin:legalRequests.outcome.${record.outcome}`)}
      </Fact>
      <Fact term={t("admin:legalRequests.field.accountsAffected")}>
        {record.accountsAffected}
      </Fact>
      <Fact term={t("admin:legalRequests.field.dataDisclosed")}>
        {record.dataDisclosed.length === 0 ? (
          t("admin:legalRequests.detail.nothingDisclosed")
        ) : (
          <span className={styles.chipRow}>
            {record.dataDisclosed.map((category) => (
              <AdminChip key={category} tone="coral">
                {t(`admin:legalRequests.dataCategory.${category}`)}
              </AdminChip>
            ))}
          </span>
        )}
      </Fact>
      <Fact term={t("admin:legalRequests.field.accountsNotified")}>
        {record.accountsNotified}
      </Fact>
      <Fact term={t("admin:legalRequests.field.memberNotifiedOn")}>
        {record.memberNotifiedOn
          ? shortDate(record.memberNotifiedOn)
          : t("admin:legalRequests.detail.nobodyNotified")}
      </Fact>
      <Fact term={t("admin:legalRequests.field.withheldReason")}>
        {record.notificationWithheldReason ??
          t("admin:legalRequests.detail.noWithheldReason")}
      </Fact>
      <Fact term={t("admin:legalRequests.field.gagOrder")}>
        {record.isUnderGagOrder
          ? t("admin:legalRequests.detail.gagOrderYes")
          : t("admin:legalRequests.detail.gagOrderNo")}
      </Fact>
      <Fact term={t("admin:legalRequests.field.internalNote")}>
        {record.internalNote ?? t("admin:legalRequests.detail.noInternalNote")}
      </Fact>
      <Fact term={t("admin:legalRequests.detail.recordedBy")}>
        {record.recordedByName ??
          t("admin:legalRequests.detail.recorderErased")}
      </Fact>
      <Fact term={t("admin:legalRequests.detail.lastUpdated")}>
        {shortDate(record.updatedAt)}
      </Fact>
    </dl>
  );
}
