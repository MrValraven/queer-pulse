import { FiTrash2 } from "react-icons/fi";
import {
  FormField,
  SegmentedControl,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  AffiliationInputDTO,
  AffiliationOptionDTO,
} from "./api/subprofiles.api";
import {
  AFFILIATION_ROLE_KEYS,
  AFFILIATION_TARGET_TYPES,
  rolesForTargetType,
  type AffiliationTargetType,
} from "./affiliations.data";
import { affiliationOptionsForRow } from "./api/useAffiliationOptions";
import { SubprofileAffiliationTargetPicker } from "./SubprofileAffiliationTargetPicker";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofileAffiliationsEditor.module.css";

export type AffiliationRow = AffiliationInputDTO & { _uid: string };

interface SubprofileAffiliationRowProps {
  row: AffiliationRow;
  index: number;
  /** Every target the persona may link (both types), from `useAffiliationOptions`. */
  options: readonly AffiliationOptionDTO[];
  isOptionsLoading: boolean;
  hasOptionsError: boolean;
  /** `type:slug` keys the OTHER rows already link. */
  takenKeys: ReadonlySet<string>;
  onChange: (patch: Partial<AffiliationInputDTO>) => void;
  onRemove: () => void;
}

/**
 * One owner-edited affiliation: a type toggle (event/community), a role select
 * scoped to that type, and a picker of the targets the persona may link
 * (`SubprofileAffiliationTargetPicker`): only communities its owners are
 * members of and events they're going to, minus targets another row already
 * links. Changing the type clears the picked target and resets the role, since
 * both belong to the old type. Once the options have loaded, a row with nothing
 * left to pick and no saved target disables its role select too, since there
 * is nothing for the role to describe. The backend enforces the same
 * eligibility on save. Extracted from `SubprofileAffiliationsEditor` to keep
 * both components under the 200-line cap; mirrors the same field-split pattern
 * `SubprofileItemDrawerFields` uses for the item drawer.
 */
export function SubprofileAffiliationRow({
  row,
  index,
  options,
  isOptionsLoading,
  hasOptionsError,
  takenKeys,
  onChange,
  onRemove,
}: SubprofileAffiliationRowProps) {
  const { t } = useTranslation();
  const roles = rolesForTargetType(row.targetType);
  const typeChoices = AFFILIATION_TARGET_TYPES.map((type) => ({
    value: type,
    label: t(`subprofiles:affiliation.type.${type}`),
  }));
  const hasEligibleTargets =
    affiliationOptionsForRow(options, row.targetType, takenKeys).eligibleOptions
      .length > 0;
  const isRoleDisabled =
    !isOptionsLoading &&
    !hasOptionsError &&
    !hasEligibleTargets &&
    row.targetSlug === "";

  function changeType(nextType: AffiliationTargetType) {
    const nextRoles = rolesForTargetType(nextType);
    onChange({
      targetType: nextType,
      targetSlug: "",
      role: nextRoles[0] ?? "",
    });
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
          <Select
            options={roles.map((role) => {
              const roleKey = AFFILIATION_ROLE_KEYS[role];
              return { value: role, label: roleKey ? t(roleKey) : role };
            })}
            value={row.role}
            onChange={(value) => onChange({ role: value ?? "" })}
            disabled={isRoleDisabled}
          />
        </FormField>
      </div>

      <SubprofileAffiliationTargetPicker
        targetType={row.targetType}
        targetSlug={row.targetSlug}
        options={options}
        isLoading={isOptionsLoading}
        hasError={hasOptionsError}
        takenKeys={takenKeys}
        onChange={(targetSlug) => onChange({ targetSlug })}
      />
    </article>
  );
}
