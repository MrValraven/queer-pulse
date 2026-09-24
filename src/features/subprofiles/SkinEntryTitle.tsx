import { useRef, type KeyboardEvent } from "react";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";
import { refinedSurfaceClassName } from "./refinedFieldSurface";
import refinedStyles from "./SkinRefinedList.module.css";

const LINE_BREAKS = /\r?\n/g;
/** The entry's title: a one-row textarea on the refined surface that wraps
 *  and grows, so a long question is never cut off. It stays a single line of
 *  text: Enter moves on to the entry's next field, and pasted line breaks
 *  become spaces. */
export function SkinEntryTitle({
  value,
  label,
  placeholder,
  onChange,
  onEnter,
}: {
  value: string;
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
  onEnter: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoGrowFallback(textareaRef, value);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    onEnter();
  };

  return (
    <textarea
      ref={textareaRef}
      className={`${refinedSurfaceClassName({ isMultiline: true, isEmpty: value.trim() === "" })} ${refinedStyles.entryTitle}`}
      rows={1}
      value={value}
      placeholder={placeholder}
      aria-label={label}
      aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
      onKeyDown={handleKeyDown}
      onChange={(event) =>
        onChange(event.target.value.replace(LINE_BREAKS, " "))
      }
    />
  );
}
