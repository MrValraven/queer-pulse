import { FiSearch, FiDownload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  AUDIT_MODERATORS,
  AUDIT_ACTION_IDS,
  AUDIT_RANGE_IDS,
  type AuditFilterState,
} from "./adminGovernance.data";
import styles from "./AdminGovernancePage.module.css";

export function AdminGovernanceAuditFilters({
  filters,
  onChange,
  onExport,
}: {
  filters: AuditFilterState;
  onChange: (next: AuditFilterState) => void;
  onExport: () => void;
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
    ...AUDIT_MODERATORS.map((name) => ({ value: name, label: name })),
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
        label={t("admin:governance.audit.filterModerator")}
        value={filters.moderator}
        options={moderatorOptions}
        onChange={(v) => set("moderator", v)}
      />
      <Select
        label={t("admin:governance.audit.filterAction")}
        value={filters.action}
        options={actionOptions}
        onChange={(v) => set("action", v as AuditFilterState["action"])}
      />
      <Select
        label={t("admin:governance.audit.filterRange")}
        value={filters.range}
        options={rangeOptions}
        onChange={(v) => set("range", v as AuditFilterState["range"])}
      />

      <Button variant="ghost" onClick={onExport}>
        <FiDownload aria-hidden /> {t("admin:governance.audit.exportCta")}
      </Button>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      className={styles.select}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
