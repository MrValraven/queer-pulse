import { Select } from "../../shared/components/ui";
import { AdminGovernanceAuthoredText } from "./AdminGovernanceAuthoredText";
import {
  EMPTY_AUTHORED_TEXT,
  LONG_TEXT_MAX_LENGTH,
  PRINCIPLE_ICONS,
  SHORT_TEXT_MAX_LENGTH,
} from "./adminGovernanceOverviewRows.utils";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PrincipleDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

/**
 * PRD-265. The editable body of one principle row: its icon (always), plus
 * either the catalog label of a seeded entry or the EN/PT title and text of an
 * authored one.
 */
export function AdminGovernancePrincipleRow({
  row,
  index,
  onPatch,
}: {
  row: PrincipleDTO;
  index: number;
  onPatch: (partial: Partial<PrincipleDTO>) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {row.key ? (
        <span className={styles.editLineLabel}>
          {t(`admin:governance.overview.principles.key.${row.key}`)}
        </span>
      ) : (
        <>
          <AdminGovernanceAuthoredText
            idPrefix={`principle-title-${index}`}
            label={t("admin:governance.overview.principles.field.titleText")}
            value={row.title ?? EMPTY_AUTHORED_TEXT}
            maxLength={SHORT_TEXT_MAX_LENGTH}
            onChange={(title) => onPatch({ title })}
          />
          <AdminGovernanceAuthoredText
            idPrefix={`principle-text-${index}`}
            label={t("admin:governance.overview.principles.field.bodyText")}
            value={row.text ?? EMPTY_AUTHORED_TEXT}
            maxLength={LONG_TEXT_MAX_LENGTH}
            isMultiline
            onChange={(text) => onPatch({ text })}
          />
        </>
      )}
      <div className={styles.ovField}>
        <label className={styles.ovFieldLabel} id={`principle-icon-${index}`}>
          {t("admin:governance.overview.principles.field.icon")}
        </label>
        <Select
          labelledBy={`principle-icon-${index}`}
          value={row.icon}
          onChange={(value) => onPatch({ icon: value ?? row.icon })}
          options={PRINCIPLE_ICONS.map((icon) => ({
            value: icon,
            label: t(`admin:governance.overview.principles.icon.${icon}`),
          }))}
        />
      </div>
    </>
  );
}
