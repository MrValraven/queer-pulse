import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      {tiers.map((tier) => (
        <div className={styles.row} key={tier.id}>
          <div className={styles.rowMain}>
            <div className={styles.rowTop}>
              <span className={styles.rowName}>{tier.name}</span>
              {tier.featured && (
                <span className={styles.featuredTag}>
                  {t("admin:common.featured")}
                </span>
              )}
            </div>
            <div className={styles.rowMeta}>
              {tier.priceDisplay} {tier.pricePeriod}
            </div>
          </div>
          <AdminToggle
            checked={tier.published}
            onChange={() => onTogglePublished(tier)}
            label={t("admin:common.publishedToggleLabel", { name: tier.name })}
          />
          <div className={styles.rowActions}>
            <Button variant="ghost" size="md" onClick={() => onEdit(tier)}>
              {t("admin:common.edit")}
            </Button>
            <Button variant="ghost" size="md" onClick={() => onDelete(tier)}>
              {t("admin:common.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
