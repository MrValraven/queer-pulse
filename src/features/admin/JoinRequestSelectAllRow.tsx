import { useEffect, useRef } from "react";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { JOIN_REQUEST_BULK_ACTION_CAP } from "../auth/api/joinRequest.api";
import queueStyles from "./AdminMembersPage.module.css";
import styles from "./JoinRequestBulk.module.css";

/**
 * Select-all for the pending half of the join-request queue.
 *
 * The label names the exact set: the requests waiting on this page, never the
 * whole queue behind the cursor and never the waitlisted section below, which
 * is not part of the same batch. A reviewer who ticks this and then declines
 * has to be able to read what they just selected off the control itself.
 *
 * `indeterminate` has no React prop, so it is set on the node: the same
 * imperative escape hatch `VerificationRequestRows` and `AdminListingRows` use
 * for their own select-all boxes.
 */
export function JoinRequestSelectAllRow({
  visibleCount,
  selectedVisibleCount,
  isAtCap,
  onToggleAll,
}: {
  /** How many pending rows the reviewer can currently see and select. */
  visibleCount: number;
  selectedVisibleCount: number;
  /** True once the selection has reached `JOIN_REQUEST_BULK_ACTION_CAP`. */
  isAtCap: boolean;
  onToggleAll: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const checkboxRef = useRef<HTMLInputElement>(null);
  const isAllSelected =
    visibleCount > 0 && selectedVisibleCount === visibleCount;
  const isSomeSelected =
    selectedVisibleCount > 0 && selectedVisibleCount < visibleCount;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const label = t("admin:members.verify.bulk.selectAll.label", {
    count: visibleCount,
  });

  return (
    <label className={styles.selectAllRow}>
      <input
        ref={checkboxRef}
        type="checkbox"
        className={queueStyles.queueSelect}
        checked={isAllSelected}
        disabled={isAtCap && !isAllSelected}
        onChange={onToggleAll}
        aria-label={label}
      />
      {/* The input's aria-label keeps the plain sentence; the visible copy
          rolls its count as rows leave the queue. */}
      <span className={styles.selectAllLabel}>
        <Translation
          i18nKey="admin:members.verify.bulk.selectAll.label"
          values={{ count: visibleCount }}
          slots={{
            count: (
              <RollingNumber
                value={fmt.number(visibleCount)}
                numericValue={visibleCount}
              />
            ),
          }}
        />
      </span>
      {isAtCap && (
        <span className={styles.selectAllNote}>
          {t("admin:members.verify.bulk.capReached", {
            cap: JOIN_REQUEST_BULK_ACTION_CAP,
          })}
        </span>
      )}
    </label>
  );
}
