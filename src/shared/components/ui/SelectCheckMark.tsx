import { FiCheck } from "react-icons/fi";
import styles from "./MemberSelectList.module.css";

/** The picker's selection box: the green check `MemberSelectList` rows show,
 *  for any other list that ticks people. Decorative: the row that holds it
 *  carries the checkbox semantics. */
export function SelectCheckMark({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className={[styles.check, styles.checkBox, isSelected && styles.checkOn]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {isSelected && <FiCheck />}
    </span>
  );
}
