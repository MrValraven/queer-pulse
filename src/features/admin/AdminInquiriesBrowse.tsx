import { useState } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminInquiryList } from "./AdminInquiryList";
import {
  useAdminInquiries,
  type AdminInquiryKindFilter,
  type AdminInquiryStatusFilter,
} from "./api/useAdminInquiries";
import { INQUIRY_KINDS, INQUIRY_STATUSES } from "./api/adminInquiries.api";
import styles from "./AdminSubmissionList.module.css";

/**
 * Every message `/about/contact` has collected, narrowed by kind (a plain
 * contact message or a partnership offer) and by whether a human has read it.
 * The waiting count comes from the server's `unhandledCount`, which ignores the
 * status filter, so reading the handled list never makes the backlog look empty.
 */
export function AdminInquiriesBrowse() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<AdminInquiryKindFilter>("all");
  const [status, setStatus] = useState<AdminInquiryStatusFilter>("all");
  const query = useAdminInquiries({ kind, status });

  const kindOptions = [
    { value: "all", label: t("admin:adminIntakes.filter.allKinds") },
    ...INQUIRY_KINDS.map((value) => ({
      value,
      label: t(`admin:adminIntakes.inquiryKind.${value}`),
    })),
  ];
  const statusOptions = [
    { value: "all", label: t("admin:adminIntakes.filter.allStatuses") },
    ...INQUIRY_STATUSES.map((value) => ({
      value,
      label: t(`admin:adminIntakes.inquiryStatus.${value}`),
    })),
  ];

  return (
    <>
      <div className={styles.filterBar}>
        <Select
          size="sm"
          label={t("admin:adminIntakes.filter.kindLabel")}
          options={kindOptions}
          value={kind}
          onChange={(value) =>
            setKind((value as AdminInquiryKindFilter | null) ?? "all")
          }
        />
        <Select
          size="sm"
          label={t("admin:adminIntakes.filter.statusLabel")}
          options={statusOptions}
          value={status}
          onChange={(value) =>
            setStatus((value as AdminInquiryStatusFilter | null) ?? "all")
          }
        />
        <p className={styles.filterNote}>
          {t("admin:adminIntakes.inquiryWaitingNote", {
            count: query.unhandledCount,
          })}
        </p>
      </div>
      <AdminInquiryList query={query} />
    </>
  );
}
