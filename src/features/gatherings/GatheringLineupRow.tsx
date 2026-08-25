import { FiX } from "react-icons/fi";
import { MemberIdentity, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "../subprofiles/api/subprofiles.api";
import { KIND_LABEL_KEYS } from "../subprofiles/subprofile-kinds";
import { LINEUP_ROLES } from "./eventLineup.data";
import styles from "./GatheringLineupEditor.module.css";

export interface LineupEditorRow {
  _uid: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  role: SubprofileKind;
}

/**
 * One host-tagged lineup entry: the member's identity, a craft select scoped
 * to {@link LINEUP_ROLES}, and a remove control. Extracted from
 * `GatheringLineupEditor` to keep both components under the 200-line cap,
 * mirroring `SubprofileAffiliationRow`'s row-extraction pattern.
 */
export function GatheringLineupRow({
  row,
  onRoleChange,
  onRemove,
}: {
  row: LineupEditorRow;
  onRoleChange: (role: SubprofileKind) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.row}>
      <MemberIdentity
        person={{
          slug: row.slug,
          name: row.name,
          avatarUrl: row.avatarUrl ?? undefined,
        }}
        size={38}
      />
      <Select
        className={styles.roleSelect}
        size="sm"
        label={t("gatherings:lineup.roleLabel")}
        options={LINEUP_ROLES.map((role) => ({
          value: role,
          label: t(KIND_LABEL_KEYS[role]),
        }))}
        value={row.role}
        onChange={(value) => onRoleChange(value as SubprofileKind)}
      />
      <button
        type="button"
        className={styles.removeBtn}
        onClick={onRemove}
        aria-label={t("gatherings:lineup.removeAria", { name: row.name })}
      >
        <FiX size={16} aria-hidden />
      </button>
    </div>
  );
}
