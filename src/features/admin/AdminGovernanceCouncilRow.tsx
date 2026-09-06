import { Select } from "../../shared/components/ui";
import { AdminGovernanceAuthoredText } from "./AdminGovernanceAuthoredText";
import {
  COUNCIL_INITIALS_MAX_LENGTH,
  COUNCIL_NAME_MAX_LENGTH,
  COUNCIL_TINTS,
  EMPTY_AUTHORED_TEXT,
  SEEDED_COUNCIL_ROLE_KEYS,
  SHORT_TEXT_MAX_LENGTH,
} from "./adminGovernanceOverviewRows.utils";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CouncilSeatDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

/**
 * PRD-265. The editable body of one advisory-council seat: name, initials,
 * tint, and a role descriptor that is either the seeded key (a dropdown of the
 * four the bundle carries) or the editor's own EN/PT.
 */
export function AdminGovernanceCouncilRow({
  row,
  index,
  onPatch,
}: {
  row: CouncilSeatDTO;
  index: number;
  onPatch: (partial: Partial<CouncilSeatDTO>) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.ovField}>
        <label
          className={styles.ovFieldLabel}
          htmlFor={`council-name-${index}`}
        >
          {t("admin:governance.overview.council.field.name")}
        </label>
        <input
          id={`council-name-${index}`}
          type="text"
          maxLength={COUNCIL_NAME_MAX_LENGTH}
          value={row.name}
          onChange={(event) => onPatch({ name: event.target.value })}
        />
      </div>
      <div className={styles.ovField}>
        <label
          className={styles.ovFieldLabel}
          htmlFor={`council-initials-${index}`}
        >
          {t("admin:governance.overview.council.field.initials")}
        </label>
        <input
          id={`council-initials-${index}`}
          type="text"
          maxLength={COUNCIL_INITIALS_MAX_LENGTH}
          value={row.initials}
          onChange={(event) => onPatch({ initials: event.target.value })}
        />
      </div>
      {row.roleKey ? (
        <div className={styles.ovField}>
          <label className={styles.ovFieldLabel} id={`council-role-${index}`}>
            {t("admin:governance.overview.council.field.role")}
          </label>
          <Select
            labelledBy={`council-role-${index}`}
            value={row.roleKey}
            onChange={(value) => onPatch({ roleKey: value ?? row.roleKey })}
            options={SEEDED_COUNCIL_ROLE_KEYS.map((key) => ({
              value: key,
              label: t(`admin:governance.overview.council.role.${key}`),
            }))}
          />
        </div>
      ) : (
        <AdminGovernanceAuthoredText
          idPrefix={`council-role-${index}`}
          label={t("admin:governance.overview.council.field.role")}
          value={row.role ?? EMPTY_AUTHORED_TEXT}
          maxLength={SHORT_TEXT_MAX_LENGTH}
          onChange={(role) => onPatch({ role })}
        />
      )}
      <div className={styles.ovField}>
        <label className={styles.ovFieldLabel} id={`council-tint-${index}`}>
          {t("admin:governance.overview.council.field.tint")}
        </label>
        <Select
          labelledBy={`council-tint-${index}`}
          value={row.tint}
          onChange={(value) =>
            onPatch({ tint: (value ?? row.tint) as CouncilSeatDTO["tint"] })
          }
          options={COUNCIL_TINTS.map((tint) => ({
            value: tint,
            label: t(`admin:governance.overview.council.tint.${tint}`),
          }))}
        />
      </div>
    </>
  );
}
