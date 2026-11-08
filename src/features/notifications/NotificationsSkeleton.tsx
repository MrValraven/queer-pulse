import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { NotificationLeadShape } from "./NotificationItemLead";
import styles from "./NotificationsPage.module.css";

/** The loading picture per lead shape, matching the row it stands in for.
 *  The portrait block reads the row's `--lead-w`, as the real picture does. */
const SKELETON_LEAD_BY_SHAPE = {
  round: { width: 40, height: 40, borderRadius: 12 },
  rect: {
    width: "var(--lead-w)",
    height: "var(--lead-h)",
    borderRadius: "var(--radius-12)",
  },
} as const satisfies Record<
  NotificationLeadShape,
  {
    width: number | string;
    height: number | string;
    borderRadius: number | string;
  }
>;

/** Mirrors a notification row: avatar/icon block + text + meta. */
function NotificationSkeleton({
  leadShape,
}: {
  leadShape: NotificationLeadShape;
}) {
  const { width, height, borderRadius } = SKELETON_LEAD_BY_SHAPE[leadShape];
  const isContentRow = leadShape === "rect";
  return (
    <div
      className={[styles.item, isContentRow && styles.contentRow]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <SkeletonLine
        width={width}
        height={height}
        style={{ borderRadius, flex: "none" }}
      />
      <div className={styles.body}>
        <SkeletonLine width="75%" height={15} />
        <SkeletonLine width="35%" height={12} style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}

export function NotificationsListSkeleton({
  count = 7,
  leadShape = "round",
  isInBellPopover = false,
}: {
  count?: number;
  /** The shape of the rows it stands in for; `round` is the classic row. */
  leadShape?: NotificationLeadShape;
  /** In the bell's popover the rows run edge to edge and there is no day
   *  label, as in the list it stands in for. */
  isInBellPopover?: boolean;
}) {
  const { t } = useTranslation();
  const isContentRow = leadShape === "rect";
  return (
    <div
      className={[
        styles.list,
        isContentRow && styles.listContent,
        isInBellPopover && styles.listInPanel,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!isInBellPopover && (
        <div className={styles.day}>{t("notifications:page.dayRecent")}</div>
      )}
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} leadShape={leadShape} />
      ))}
    </div>
  );
}
