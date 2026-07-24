import { Button } from "../../shared/components/ui";
import { AdminToggle } from "./ui";
import type { OrgTierAdminDTO } from "../marketing/api/adminOrgTiers.api";
import styles from "./AdminOrgTiersPage.module.css";

/** One row per tier: name, price, a "Featured" badge when featured, a
 *  published toggle, and edit/delete actions. */
export function AdminOrgTierRows({
  tiers,
  onTogglePublished,
  onEdit,
  onDelete,
}: {
  tiers: OrgTierAdminDTO[];
  onTogglePublished: (tier: OrgTierAdminDTO) => void;
  onEdit: (tier: OrgTierAdminDTO) => void;
  onDelete: (tier: OrgTierAdminDTO) => void;
}) {
  return (
    <div className={styles.rows}>
      {tiers.map((tier) => (
        <div className={styles.row} key={tier.id}>
          <div className={styles.rowMain}>
            <div className={styles.rowTop}>
              <span className={styles.rowName}>{tier.name}</span>
              {tier.featured && (
                <span className={styles.featuredTag}>Featured</span>
              )}
            </div>
            <div className={styles.rowMeta}>
              {tier.priceDisplay} {tier.pricePeriod}
            </div>
          </div>
          <AdminToggle
            checked={tier.published}
            onChange={() => onTogglePublished(tier)}
            label={`Published — ${tier.name}`}
          />
          <div className={styles.rowActions}>
            <Button variant="ghost" size="md" onClick={() => onEdit(tier)}>
              Edit
            </Button>
            <Button variant="ghost" size="md" onClick={() => onDelete(tier)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
