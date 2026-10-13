import type { ActiveFilter } from "../../shared/components/ui";
import type { TFunction } from "../../shared/i18n/types";
import type {
  DirectoryListingFactFilters,
  ListingFactFilterChange,
} from "./directoryListingFactFilters";
import { attributeLabel } from "./listBusiness/listingAttributes.data";
import {
  ENTRY_MODE_LABEL_KEYS,
  INCLUSION_PRACTICE_LABEL_KEYS,
  languageLabel,
  PAYMENT_METHOD_LABEL_KEYS,
} from "./listBusiness/listingFacts.data";

/** One removable chip per fact filter, in the drawer's order: the way in,
 *  the ways to pay, the languages, the practices, then the "More filters"
 *  attributes. Each chip's remove undoes exactly its own value. */
export function listingFactActiveFilters(
  t: TFunction,
  filters: DirectoryListingFactFilters,
  onToggle: (change: ListingFactFilterChange) => void,
): ActiveFilter[] {
  const list: ActiveFilter[] = [];
  const { entryMode } = filters;
  if (entryMode) {
    list.push({
      key: "entry",
      label: t(ENTRY_MODE_LABEL_KEYS[entryMode]),
      onRemove: () => onToggle({ kind: "entryMode", mode: entryMode }),
    });
  }
  for (const method of filters.payments) {
    list.push({
      key: `pay:${method}`,
      label: t(PAYMENT_METHOD_LABEL_KEYS[method]),
      onRemove: () => onToggle({ kind: "payment", method }),
    });
  }
  for (const code of filters.languages) {
    list.push({
      key: `lang:${code}`,
      label: languageLabel(t, code),
      onRemove: () => onToggle({ kind: "language", code }),
    });
  }
  for (const practice of filters.practices) {
    list.push({
      key: `practice:${practice}`,
      label: t(INCLUSION_PRACTICE_LABEL_KEYS[practice]),
      onRemove: () => onToggle({ kind: "practice", practice }),
    });
  }
  for (const slug of filters.attributes) {
    list.push({
      key: `attr:${slug}`,
      label: attributeLabel(t, slug),
      onRemove: () => onToggle({ kind: "attribute", slug }),
    });
  }
  return list;
}
