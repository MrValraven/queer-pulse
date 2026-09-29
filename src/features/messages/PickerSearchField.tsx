// src/features/messages/PickerSearchField.tsx
import type { ReactNode, RefObject } from "react";
import { SearchInput } from "../../shared/components/ui";
import styles from "./PickerSearchField.module.css";

interface PickerSearchFieldProps {
  query: string;
  onQueryChange: (query: string) => void;
  /** The field itself, owned by the caller so an empty state's own "Clear
   *  search" affordance can hand focus back here too. */
  inputRef: RefObject<HTMLInputElement | null>;
  placeholder: string;
  /** Defaults to `placeholder`, matching the field's own visible label. */
  ariaLabel?: string;
  /** An optional line rendered right under the field, for a caller that
   *  needs its own polite result-count announcement (see
   *  `StickerSearchField`). Absent for a tab that announces nothing. */
  children?: ReactNode;
}

/**
 * The one search field row shared by both tabs of the composer's emoji and
 * sticker popover (`EmojiPicker`'s own Emoji tab, `StickerPicker` by way of
 * `StickerSearchField`), built on the shared `SearchInput` so the two tabs
 * carry the same height, clear button, placeholder style and focus ring off
 * one component, replacing what used to be two separate hand-rolled
 * `<input type="search">` elements. The panel that hosts this row owns the
 * fixed `--composer-popover-max` height.
 *
 * Clearing puts focus back in the field even when the clear button (not the
 * field) held it, so a keyboard user who tabbed to Clear can start typing the
 * next search right away, in either tab.
 */
export function PickerSearchField({
  query,
  onQueryChange,
  inputRef,
  placeholder,
  ariaLabel,
  children,
}: PickerSearchFieldProps) {
  function handleChange(nextQuery: string) {
    onQueryChange(nextQuery);
    if (nextQuery.length === 0) inputRef.current?.focus();
  }

  return (
    <div className={styles.searchRow}>
      <SearchInput
        value={query}
        onChange={handleChange}
        inputRef={inputRef}
        placeholder={placeholder}
        ariaLabel={ariaLabel ?? placeholder}
      />
      {children}
    </div>
  );
}
