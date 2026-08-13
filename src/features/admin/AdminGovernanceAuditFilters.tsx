import { FiSearch, FiDownload } from "react-icons/fi";
import { Button, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  AUDIT_ACTION_IDS,
  AUDIT_RANGE_IDS,
  type AuditFilterState,
} from "./adminGovernance.data";
import styles from "./AdminGovernancePage.module.css";

export function AdminGovernanceAuditFilters({
  filters,
  onChange,
  onExport,
  exportDisabled,
  exportTitle,
  moderators,
}: {
  filters: AuditFilterState;
  onChange: (next: AuditFilterState) => void;
  onExport: () => void;
  /** Disable the export CTA with a reason (no export endpoint in live yet). */
  exportDisabled?: boolean;
  exportTitle?: string;
  moderators: { id: string; name: string }[];
}) {
  const { t } = useTranslation();
  const set = <K extends keyof AuditFilterState>(
    key: K,
    value: AuditFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  // Real moderator names are content (never translated); the "all" sentinel's
  // label is the only chrome string in this list.
  const moderatorOptions = [
    { value: "all", label: t("admin:governance.audit.allModerators") },
    ...moderators.map((moderator) => ({
      value: moderator.id,
      label: moderator.name,
    })),
  ];
  const actionOptions = [
    { value: "all", label: t("admin:governance.audit.allActions") },
    ...AUDIT_ACTION_IDS.map((id) => ({
      value: id,
      label: t(`admin:governance.audit.actionType.${id}`),
    })),
  ];
  const rangeOptions = [
    { value: "all", label: t("admin:governance.audit.allTime") },
    ...AUDIT_RANGE_IDS.map((id) => ({
      value: id,
      label: t(`admin:governance.audit.range.${id}`),
    })),
  ];

  return (
    <div className={styles.filterBar}>
      <label className={styles.search}>
        <FiSearch className={styles.searchIco} aria-hidden />
        <input
          type="search"
          className={styles.searchInput}
          placeholder={t("admin:governance.audit.searchPlaceholder")}
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          aria-label={t("admin:governance.audit.searchAriaLabel")}
        />
      </label>

      <Select
        size="sm"
        label={t("admin:governance.audit.filterModerator")}
        value={filters.moderator}
        options={moderatorOptions}
        onChange={(v) => set("moderator", v ?? "all")}
      />
      <Select
        size="sm"
        label={t("admin:governance.audit.filterAction")}
        value={filters.action}
        options={actionOptions}
        onChange={(v) => set("action", (v ?? "all") as AuditFilterState["action"])}
      />
      <Select
        size="sm"
        label={t("admin:governance.audit.filterRange")}
        value={filters.range}
        options={rangeOptions}
        onChange={(v) => set("range", (v ?? "all") as AuditFilterState["range"])}
      />

      <Button
        variant="ghost"
        onClick={onExport}
        disabled={exportDisabled}
        title={exportDisabled ? exportTitle : undefined}
      >
        <FiDownload aria-hidden /> {t("admin:governance.audit.exportCta")}
      </Button>
    </div>
  );
}
