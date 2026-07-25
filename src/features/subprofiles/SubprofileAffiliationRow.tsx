import { FiTrash2 } from "react-icons/fi";
import { FormField, SegmentedControl } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AffiliationInputDTO } from "./api/subprofiles.api";
import {
  AFFILIATION_ROLE_KEYS,
  AFFILIATION_TARGET_TYPES,
  rolesForTargetType,
  type AffiliationTargetType,
} from "./affiliations.data";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofileAffiliationsEditor.module.css";

export type AffiliationRow = AffiliationInputDTO & { _uid: string };

interface SubprofileAffiliationRowProps {
  row: AffiliationRow;
  index: number;
  onChange: (patch: Partial<AffiliationInputDTO>) => void;
  onRemove: () => void;
}

/**
 * One owner-edited affiliation: a type toggle (event/community), the target's
 * slug (the backend validates existence/visibility on save — this is just a
 * plain field, not a live-resolved picker, since neither `useEvents()` nor
 * `useCommunities()` exposes a stable slug in demo mode), and a role select
 * scoped to the current type. Extracted from `SubprofileAffiliationsEditor` to
 * keep both components under the 200-line cap; mirrors `SubprofileItemEditor`.
 */
export function SubprofileAffiliationRow({
  row,
  index,
  onChange,
  onRemove,
}: SubprofileAffiliationRowProps) {
  const { t } = useTranslation();
  const roles = rolesForTargetType(row.targetType);
  const typeChoices = AFFILIATION_TARGET_TYPES.map((type) => ({
    value: type,
    label: t(`subprofiles:affiliation.type.${type}`),
  }));

  function changeType(nextType: AffiliationTargetType) {
    const nextRoles = rolesForTargetType(nextType);
    onChange({ targetType: nextType, role: nextRoles[0] ?? "" });
  }

  return (
    <article className={sharedStyles.itemCard}>
      <div className={sharedStyles.itemHead}>
        <span className={sharedStyles.itemNum}>
          {t("subprofiles:affiliationsEditor.itemNumber", { n: index + 1 })}
        </span>
        <button
          type="button"
          className={sharedStyles.removeBtn}
          onClick={onRemove}
        >
          <FiTrash2 size={14} aria-hidden />{" "}
          {t("subprofiles:affiliationsEditor.remove")}
        </button>
      </div>

      <div className={styles.metaRow}>
        <FormField label={t("subprofiles:affiliationsEditor.typeLabel")}>
          <SegmentedControl
            options={typeChoices.map((choice) => choice.label)}
            value={t(`subprofiles:affiliation.type.${row.targetType}`)}
            onChange={(value) => {
              const match = typeChoices.find(
                (choice) => choice.label === value,
              );
              if (match) changeType(match.value);
            }}
          />
        </FormField>

        <FormField label={t("subprofiles:affiliationsEditor.roleLabel")}>
          <select
            value={row.role}
            onChange={(event) => onChange({ role: event.target.value })}
          >
            {roles.map((role) => {
              const roleKey = AFFILIATION_ROLE_KEYS[role];
              return (
                <option key={role} value={role}>
                  {roleKey ? t(roleKey) : role}
                </option>
              );
            })}
          </select>
        </FormField>
      </div>

      <FormField
        label={t("subprofiles:affiliationsEditor.slugLabel")}
        helper={t("subprofiles:affiliationsEditor.slugHelper")}
      >
        <input
          value={row.targetSlug}
          placeholder={t("subprofiles:affiliationsEditor.slugPlaceholder")}
          onChange={(event) => onChange({ targetSlug: event.target.value })}
        />
      </FormField>
    </article>
  );
}
