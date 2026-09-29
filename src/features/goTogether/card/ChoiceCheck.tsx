import { FiCheck } from "react-icons/fi";
import styles from "./GoTogetherCard.module.css";

/** The tick on a chosen radio card, so the choice never rests on colour
 *  alone. The radio itself carries the state for assistive tech. */
export function ChoiceCheck({ isChecked }: { isChecked: boolean }) {
  if (!isChecked) return null;
  return <FiCheck className={styles.choiceCheck} aria-hidden />;
}
