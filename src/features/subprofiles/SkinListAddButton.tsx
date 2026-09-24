import type { Ref } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import styles from "./SkinListControls.module.css";

/** The "+ Add ..." button under a list control's rows, shared by the list
 *  frame in both field designs. */
export function SkinListAddButton({
  label,
  onAdd,
  buttonRef,
}: {
  label: string;
  onAdd: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}) {
  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="sm"
      className={styles.addButton}
      onClick={onAdd}
    >
      <FiPlus size={15} aria-hidden />
      {label}
    </Button>
  );
}
