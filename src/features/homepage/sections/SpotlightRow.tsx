import { FiArrowRight } from "react-icons/fi";
import { Avatar } from "../../../shared/components/ui";
import { MemberStaffBadge } from "../../../shared/staff/MemberStaffBadge";
import type { SpotlightView } from "./spotlightView";
import styles from "./Discovery.module.css";

/**
 * A compact member row for the roster beside the live spotlight card — the
 * `SpotlightView` twin of `MemberRow` (which reads the richer demo `Member`
 * shape). Unlike `MemberRow`, this row is a control, not a profile link:
 * clicking it features that member in the card (via the card's `goTo`), and the
 * currently-featured row carries a subtle highlight kept in sync with the
 * carousel. Reuses the demo showcase's row styling so both sections read as the
 * same design; `hood` is absent from the live feed, so the sub-line falls back
 * to the tagline alone. Profile navigation lives on the featured card itself.
 */
export function SpotlightRow({
  view,
  active,
  onSelect,
}: {
  view: SpotlightView;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active}
      className={[styles.rowE, active && styles.rowActive]
        .filter(Boolean)
        .join(" ")}
    >
      <Avatar
        src={view.photoUrl}
        initials={view.initials}
        tint={view.tint}
        size={48}
        verified={view.verified}
      />
      <span className={styles.rowMeta}>
        <span className={styles.nameRow}>
          <span className={styles.rowName}>{view.name}</span>
          <MemberStaffBadge slug={view.key} />
        </span>
        {view.role && (
          <span className={styles.rowSub}>
            {view.role}
            {view.hood ? ` · ${view.hood}` : ""}
          </span>
        )}
      </span>
      <span className={styles.arrow} aria-hidden>
        <FiArrowRight />
      </span>
    </button>
  );
}
