import {
  useState,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { SkinListAddButton } from "./SkinListAddButton";
import { SkinRefinedField } from "./SkinRefinedField";
import styles from "./SkinListControls.module.css";
import refinedStyles from "./SkinRefinedList.module.css";

/** A key hint under the rows: `text` shows while focus is inside the list,
 *  and a hidden copy carries `id`, which each row field names in its
 *  `aria-describedby`. */
export interface SkinListKeyHint {
  id: string;
  text: string;
}

export interface SkinListFrameProps {
  control: SkinBlockControl;
  isLabelHidden: boolean;
  itemCount: number;
  /** From `useSkinListRows`: wraps only the rows, for drag and focus. */
  containerRef: RefObject<HTMLDivElement | null>;
  addButtonRef: RefObject<HTMLButtonElement | null>;
  onAdd: () => void;
  /** The add button's label when the control sets no `addLabelKey`. */
  defaultAddLabelKey?: string;
  header?: ReactNode;
  /** The keys a control's rows answer to, shown under the list. */
  keyHint?: SkinListKeyHint;
  children: ReactNode;
}

/**
 * The frame every list control shares: the control's label and helper come
 * from `SkinRefinedField` (sentence case, the hint above the rows), and the
 * rows sit in a group named by that label through `aria-labelledby`, with
 * the add button under them. A `keyHint` takes the frame's footer, as the
 * chips' key hint does, and shows only while focus is in the list.
 */
export function SkinListFrame({
  control,
  isLabelHidden,
  itemCount,
  containerRef,
  addButtonRef,
  onAdd,
  defaultAddLabelKey = "subprofiles:skinBlock.addItem",
  header,
  keyHint,
  children,
}: SkinListFrameProps) {
  const { t } = useTranslation();
  const [isFocusInside, setIsFocusInside] = useState(false);
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
      setIsFocusInside(false);
    }
  };

  return (
    <SkinRefinedField
      label={t(control.labelKey)}
      isLabelHidden={isLabelHidden}
      labelMode="span"
      helper={control.helperKey ? t(control.helperKey) : undefined}
      helperTone={control.helperTone}
      footer={
        keyHint && isFocusInside ? (
          <span aria-hidden="true">{keyHint.text}</span>
        ) : undefined
      }
    >
      {(field) => (
        <div
          className={`${styles.list} ${refinedStyles.list}`}
          role="group"
          aria-labelledby={field.labelId}
          aria-describedby={field.describedBy}
          onFocus={keyHint ? () => setIsFocusInside(true) : undefined}
          onBlur={keyHint ? handleBlur : undefined}
        >
          {itemCount > 0 && header}
          <div className={styles.rows} ref={containerRef}>
            {children}
          </div>
          <SkinListAddButton
            label={t(control.addLabelKey ?? defaultAddLabelKey)}
            onAdd={onAdd}
            buttonRef={addButtonRef}
          />
          {keyHint && (
            <span id={keyHint.id} hidden>
              {keyHint.text}
            </span>
          )}
        </div>
      )}
    </SkinRefinedField>
  );
}
