import { useState } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminIntakeList } from "./AdminIntakeList";
import { intakeKindLabel } from "./adminIntakeLabels";
import {
  useAdminIntakes,
  type AdminIntakeKindFilter,
  type AdminIntakeStatusFilter,
} from "./api/useAdminIntakes";
import {
  ADMIN_INTAKE_KINDS,
  ADMIN_INTAKE_STATUSES,
} from "./api/adminIntakes.api";
import styles from "./AdminSubmissionList.module.css";

/**
 * The browse view: every intake row in the table, narrowed by kind and by triage
 * status. Both filters are server-side, so paging stays honest when a kind has
 * hundreds of rows. Twelve kinds is more than a tab strip can carry, hence the
 * two selects.
 */
export function AdminIntakesBrowse() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<AdminIntakeKindFilter>("all");
  const [status, setStatus] = useState<AdminIntakeStatusFilter>("all");
  const query = useAdminIntakes({ kind, status });

  const kindOptions = [
    { value: "all", label: t("admin:adminIntakes.filter.allKinds") },
    ...ADMIN_INTAKE_KINDS.map((value) => ({
      value,
      label: intakeKindLabel(t, value),
    })),
  ];
  const statusOptions = [
    { value: "all", label: t("admin:adminIntakes.filter.allStatuses") },
    ...ADMIN_INTAKE_STATUSES.map((value) => ({
      value,
      label: t(`admin:adminIntakes.status.${value}`),
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
            setKind((value as AdminIntakeKindFilter | null) ?? "all")
          }
        />
        <Select
          size="sm"
          label={t("admin:adminIntakes.filter.statusLabel")}
          options={statusOptions}
          value={status}
          onChange={(value) =>
            setStatus((value as AdminIntakeStatusFilter | null) ?? "all")
          }
        />
      </div>
      <AdminIntakeList query={query} />
    </>
  );
}
