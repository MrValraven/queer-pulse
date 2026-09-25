import type { PointerEvent as ReactPointerEvent } from "react";
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
import { SkinListGrip, SkinListRemoveButton } from "./SkinListParts";
import { SubprofileAffiliationTargetPicker } from "./SubprofileAffiliationTargetPicker";
import reorderStyles from "./ReorderRow.module.css";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofileAffiliationsEditor.module.css";
import headStyles from "./SubprofileAffiliationRow.module.css";

export type AffiliationRow = AffiliationInputDTO & { _uid: string };

interface SubprofileAffiliationRowProps {
  row: AffiliationRow;
  index: number;
  /** How many rows the list holds, for the grip's move menu. */
  rowCount: number;
  /** Every target the persona may link (both types), from `useAffiliationOptions`. */
  options: readonly AffiliationOptionDTO[];
  isOptionsLoading: boolean;
  hasOptionsError: boolean;
  /** `type:slug` keys the OTHER rows already link. */
  takenKeys: ReadonlySet<string>;
  /** From `useReorderableRows`: turns the grip into the drag handle. */
  gripHandlers: { onPointerDown: (event: ReactPointerEvent) => void };
  /** Move this row to slot `to` (any slot, from the grip's menu), keeping
   *  focus. */
  onMove: (to: number) => void;
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
 * eligibility on save. The head names the card by its type and the picked
 * target, and carries a drag grip that is also a move menu button (up, down,
 * to top, to bottom, and Alt with an arrow key) plus an icon-only remove
 * button. Rendered inside a `ReorderRow`, which glides it.
 */
export function SubprofileAffiliationRow({
  row,
  index,
  rowCount,
  options,
  isOptionsLoading,
  hasOptionsError,
  takenKeys,
  gripHandlers,
  onMove,
  onChange,
  onRemove,
}: SubprofileAffiliationRowProps) {
  const { t } = useTranslation();
  const roles = rolesForTargetType(row.targetType);
  const typeLabel = t(`subprofiles:affiliation.type.${row.targetType}`);
  const targetName =
    row.targetSlug === ""
      ? undefined
      : options.find(
          (option) =>
            option.targetType === row.targetType &&
            option.targetSlug === row.targetSlug,
        )?.name;
  // Names the card in the grip's and remove button's labels ("Remove Event
  // Pride March 2"), by its type and, once picked, its target.
  const rowLabel = targetName ? `${typeLabel} ${targetName}` : typeLabel;
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
        <span className={reorderStyles.headLead}>
          <SkinListGrip
            className={headStyles.headGrip}
            onPointerDown={gripHandlers.onPointerDown}
            reorder={{
              rowLabel,
              isLabelUnique: Boolean(targetName),
              rowNumber: index + 1,
              rowCount,
              onMove,
            }}
          />
          <span className={headStyles.headTitle}>
            <span className={headStyles.headType}>{typeLabel}</span>
            {targetName && (
              <span className={headStyles.headName}>{targetName}</span>
            )}
          </span>
        </span>
        <SkinListRemoveButton
          className={headStyles.headRemove}
          rowLabel={rowLabel}
          rowNumber={index + 1}
          isLabelUnique={Boolean(targetName)}
          onRemove={onRemove}
        />
      </div>

      <div className={styles.metaRow}>
        <FormField label={t("subprofiles:affiliationsEditor.typeLabel")}>
          <SegmentedControl
            options={typeChoices.map((choice) => choice.label)}
            value={typeLabel}
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
