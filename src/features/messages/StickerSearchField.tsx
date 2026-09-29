// src/features/messages/StickerSearchField.tsx
import type { RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PickerSearchField } from "./PickerSearchField";
import { PickerSearchStatus } from "./PickerSearchStatus";

interface StickerSearchFieldProps {
  query: string;
  onQueryChange: (query: string) => void;
  /** True while the query holds more than whitespace. */
  isSearching: boolean;
  resultCount: number;
  /** The field itself, owned by `StickerPicker` so the empty state's
   *  "Clear search" can hand focus back here too. */
  inputRef: RefObject<HTMLInputElement | null>;
}

/**
 * The sticker picker's search field, with its polite result-count
 * announcement (`PickerSearchStatus`, shared with the emoji tab's own
 * field).
 */
export function StickerSearchField({
  query,
  onQueryChange,
  isSearching,
  resultCount,
  inputRef,
}: StickerSearchFieldProps) {
  const { t } = useTranslation();

  const statusText = !isSearching
    ? ""
    : resultCount > 0
      ? t("messages:sticker.searchResultsCount", { count: resultCount })
      : t("messages:sticker.searchNoResults");

  return (
    <PickerSearchField
      query={query}
      onQueryChange={onQueryChange}
      inputRef={inputRef}
      placeholder={t("messages:sticker.searchLabel")}
    >
      <PickerSearchStatus text={statusText} settleKey={query} />
    </PickerSearchField>
  );
}
