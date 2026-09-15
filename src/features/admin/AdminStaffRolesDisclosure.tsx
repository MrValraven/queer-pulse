import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminMembersPage.module.css";

/**
 * The header row of the drawer's staff-role grant list, as a disclosure.
 *
 * Eight toggle cards rendered flat made the member drawer very tall, so the
 * list ships collapsed. A collapsed section that says nothing about what it
 * hides is a lie by omission, so the header carries the count of active
 * grants: an admin reads "3 of 8 granted" without opening anything.
 *
 * Its own file rather than a block inside `AdminMemberStaffRoles`, which is
 * already near the repo's 200-line ceiling.
 */
export function AdminStaffRolesDisclosure({
  listId,
  isOpen,
  onToggle,
  grantedCount,
  totalCount,
}: {
  /** `id` of the `<ul>` this button shows and hides; the `aria-controls` target. */
  listId: string;
  isOpen: boolean;
  onToggle: () => void;
  /** Grants held right now, counting an admin's implicit hold on all of them. */
  grantedCount: number;
  totalCount: number;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={styles.staffRolesToggle}
      aria-expanded={isOpen}
      aria-controls={listId}
      onClick={onToggle}
    >
      <span className={styles.staffRolesToggleLabel}>
        {t("admin:staffRoles.grantsLabel")}
      </span>
      <span className={styles.staffRolesToggleMeta}>
        <span className={styles.staffRolesSummary}>
          {grantedCount === 0
            ? t("admin:staffRoles.grantsSummaryNone")
            : t("admin:staffRoles.grantsSummary", {
                count: grantedCount,
                total: totalCount,
              })}
        </span>
        <FiChevronDown
          aria-hidden
          className={`${styles.staffRolesChevron} ${
            isOpen ? styles.staffRolesChevronOpen : ""
          }`}
        />
      </span>
    </button>
  );
}
