import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPanel, AdminStat, AdminStatTiles, adminTableClasses } from "./ui";
import pageStyles from "./AdminStaffPage.module.css";
import rowStyles from "./AdminStaffRow.module.css";

const TILE_LABEL_KEYS = [
  "admin:staff.summary.admins",
  "admin:staff.summary.moderators",
  "admin:staff.summary.grantHolders",
  "admin:staff.summary.uncovered",
];
const COVERAGE_KEYS = ["first", "second", "third", "fourth"];
const ROW_KEYS = ["first", "second", "third", "fourth"];

/** The loaded layout in outline: four tiles, coverage tiles, roster rows. */
export function AdminStaffSkeleton() {
  const { t } = useTranslation();
  return (
    <div className={pageStyles.board} aria-hidden>
      <AdminStatTiles>
        {TILE_LABEL_KEYS.map((labelKey) => (
          <AdminStat key={labelKey} label={t(labelKey)} value="" isLoading />
        ))}
      </AdminStatTiles>
      <AdminPanel title={t("admin:staff.coverage.heading")}>
        <AdminStatTiles>
          {COVERAGE_KEYS.map((coverageKey) => (
            <AdminStat
              key={coverageKey}
              label={<SkeletonLine width={90} height={10} />}
              value=""
              isLoading
            />
          ))}
        </AdminStatTiles>
      </AdminPanel>
      <AdminPanel title={t("admin:staff.roster.heading")} padding="flush">
        {ROW_KEYS.map((rowKey) => (
          <div
            key={rowKey}
            className={`${adminTableClasses.row} ${rowStyles.rowSkeleton}`}
          >
            <SkeletonAvatar size={40} />
            <div className={rowStyles.rowSkeletonText}>
              <SkeletonLine width="40%" height={14} />
              <SkeletonLine width="25%" height={10} />
            </div>
            <SkeletonLine width={96} height={32} />
          </div>
        ))}
      </AdminPanel>
    </div>
  );
}
