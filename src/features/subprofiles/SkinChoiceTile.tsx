import { FiCheck, FiCheckCircle, FiCircle, FiPlus } from "react-icons/fi";
import type { ChoiceChipItem } from "./useSkinChoiceChips";
import styles from "./SkinChoiceTiles.module.css";

/** The corner mark of a tile, in the chip's own language: a hollow circle or
 *  a plus before it is picked, a circled check or a check once it is. */
const MARK = {
  radio: { picked: FiCheckCircle, unpicked: FiCircle },
  checkbox: { picked: FiCheck, unpicked: FiPlus },
};

/**
 * One option of a `choice` / `multiChoice` control laid out as tiles: its
 * icon, label and a line saying what it means, with the pick mark in the
 * corner. Like the pill chip, the label is the tile and holds a visually
 * hidden native radio or checkbox, so arrow keys, Space and the screen
 * reader's checked state come from the input; the description joins the
 * input's accessible description.
 */
export function SkinChoiceTile({
  item,
  type,
  groupName,
  isSelected,
  describedBy,
  onToggle,
}: {
  item: ChoiceChipItem;
  type: "radio" | "checkbox";
  groupName: string;
  isSelected: boolean;
  describedBy: string | undefined;
  onToggle: (isClearing: boolean) => void;
}) {
  const descriptionId = `${groupName}-${item.value}-description`;
  const Mark = isSelected ? MARK[type].picked : MARK[type].unpicked;
  const Icon = item.icon;
  return (
    <label
      className={[
        styles.tile,
        isSelected && styles.tileSelected,
        item.isExtra && styles.tileLegacy,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type={type}
        name={groupName}
        value={item.value}
        checked={isSelected}
        className="visuallyHidden"
        aria-describedby={
          [item.description && descriptionId, describedBy]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onChange={() => onToggle(false)}
        // A checked radio fires no change event, so a click on it is read
        // here as "unselect", as on the pill chip.
        onClick={() => {
          if (type === "radio" && isSelected) onToggle(true);
        }}
      />
      <span className={styles.head}>
        {Icon && (
          <span className={styles.icon} aria-hidden>
            <Icon />
          </span>
        )}
        <span className={styles.label}>{item.label}</span>
        <Mark aria-hidden className={styles.mark} />
      </span>
      {item.description && (
        // Hidden from the label's name (it would read the whole line as the
        // option's name), still read as its description by `id`.
        <span id={descriptionId} className={styles.description} aria-hidden>
          {item.description}
        </span>
      )}
    </label>
  );
}
