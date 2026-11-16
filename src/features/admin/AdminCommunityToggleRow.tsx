import { AdminToggle } from "./ui";
import styles from "./AdminCommunitiesPage.module.css";

/** One switch row of a community's admin settings panel. */
export function ToggleRow({
  title,
  sub,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleSub}>{sub}</div>
      </div>
      <AdminToggle
        checked={checked}
        onChange={onChange}
        label={title}
        disabled={disabled}
      />
    </div>
  );
}
