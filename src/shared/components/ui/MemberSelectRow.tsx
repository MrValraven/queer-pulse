import { FiCheck } from "react-icons/fi";
import { MemberIdentity } from "./MemberIdentity";
import type { MemberSelectPerson } from "./MemberSelectList";
import styles from "./MemberSelectList.module.css";

/** One selectable option row of `MemberSelectList`. */
export function MemberSelectRow({
  person,
  isSelected,
  isDisabled,
  multiSelect,
  showsRadioIndicator,
  onToggle,
}: {
  person: MemberSelectPerson;
  isSelected: boolean;
  isDisabled: boolean;
  multiSelect: boolean;
  showsRadioIndicator: boolean;
  onToggle: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={isDisabled}
      className={[
        styles.row,
        isSelected &&
          (showsRadioIndicator ? styles.rowSelectedRadio : styles.rowSelected),
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onToggle(person.slug)}
    >
      <MemberIdentity person={person} secondary={person.pronouns} size={38} />
      {(multiSelect || showsRadioIndicator) && (
        <span
          className={[
            styles.check,
            multiSelect ? styles.checkBox : styles.checkRadio,
            isSelected && styles.checkOn,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          {isSelected && multiSelect && <FiCheck />}
        </span>
      )}
    </button>
  );
}
