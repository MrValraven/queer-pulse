import { useState, type ReactNode } from "react";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAccessRow } from "./AdminAccessRow";
import styles from "./AdminMemberAccessPanel.module.css";

/**
 * The staff-roles row of the drawer's access panel: a disclosure over the
 * grant toggles.
 *
 * Eight toggle cards rendered flat made the member drawer very tall, so the
 * list ships collapsed. A collapsed section that says nothing about what it
 * hides is a lie by omission, so the status line carries the count of active
 * grants: an admin reads "3 of 8 granted" without opening anything.
 *
 * `Collapse` unmounts the list while it is shut, so the `aria-controls`
 * target is a wrapper that stays mounted around it. The locked reason sits
 * outside the button as the row's footnote, because it explains why the
 * toggles are inert.
 */
export function AdminStaffRolesDisclosure({
  listId,
  grantedCount,
  totalCount,
  lockedReason,
  confirmDialog,
  children,
}: {
  /** `id` of the region this row shows and hides; the `aria-controls` target. */
  listId: string;
  /** Grants held right now, counting an admin's implicit hold on all of them. */
  grantedCount: number;
  totalCount: number;
  lockedReason: string | null;
  /** Rendered inside the row, outside the collapsing region. */
  confirmDialog?: ReactNode;
  /** The `AdminStaffRoleRow` items. */
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AdminAccessRow
      title={t("admin:staffRoles.grantsLabel")}
      status={
        grantedCount === 0
          ? t("admin:staffRoles.grantsSummaryNone")
          : t("admin:staffRoles.grantsSummary", {
              count: grantedCount,
              total: totalCount,
            })
      }
      tone={grantedCount > 0 ? "on" : "off"}
      footnote={lockedReason}
      disclosure={{
        isOpen,
        onToggle: () => setIsOpen((wasOpen) => !wasOpen),
        controlsId: listId,
      }}
    >
      <div id={listId}>
        <Collapse isOpen={isOpen}>
          <ul className={styles.grantList}>{children}</ul>
        </Collapse>
      </div>
      {confirmDialog}
    </AdminAccessRow>
  );
}
