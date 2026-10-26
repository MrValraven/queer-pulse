import type { ReactNode } from "react";
import { FiGift, FiTag } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import { paymentDetailsToShow } from "./gatheringPaymentReading";
import styles from "./GatheringDetailPanels.module.css";

/** One labelled fact about getting there. `withheld` draws the dashed
 *  treatment used for something the viewer has not earned yet. */
export function WhereRow({
  icon: Icon,
  label,
  children,
  withheld = false,
}: {
  icon: IconType;
  label: string;
  children: ReactNode;
  withheld?: boolean;
}) {
  return (
    <div
      className={[styles.row, withheld && styles.rowWithheld]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.rowIcon} aria-hidden>
        <Icon />
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowValue}>{children}</span>
      </span>
    </div>
  );
}

/**
 * What the event costs, shared by the live Where panel and the demo page's
 * own cost panel so both say it the same way.
 *
 * COST is free text the host wrote, rendered and nothing more (LOC-18). When
 * "How to pay" shows beneath it, that block's own note says where the money
 * goes, so this row drops its matching note.
 */
export function GatheringCostRow({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const cost = gathering.cost?.trim() ?? "";
  const isPaymentShown = paymentDetailsToShow(gathering) !== null;
  return (
    <WhereRow
      icon={cost ? FiTag : FiGift}
      label={t("gatherings:gathering.where.costLabel")}
    >
      {cost ? (
        cost
      ) : (
        <span className={styles.freeChip}>
          <FiGift aria-hidden />
          {t("gatherings:gathering.where.costFree")}
        </span>
      )}
      {!isPaymentShown && (
        <span className={styles.costNote}>
          {t("gatherings:gathering.where.costNote")}
        </span>
      )}
    </WhereRow>
  );
}
