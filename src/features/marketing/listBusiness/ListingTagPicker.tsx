import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChipList, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useListingTagVocabulary } from "./api/useListingTagVocabulary";
import { ListingTagGroupList } from "./ListingTagGroupList";
import {
  filterTagGroups,
  LISTING_TAG_CAP,
  listingTagLabel,
  splitLegacyTags,
} from "./listingTags.data";
import pageStyles from "./ListBusinessPage.module.css";
import styles from "./ListingTagPicker.module.css";

interface ListingTagPickerProps {
  tags: string[];
  /** The listing's online-only flag: picks the audience the vocabulary is
   *  narrowed to. */
  isOnline: boolean;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

/**
 * The wizard's tag field: a search box over the curated vocabulary for the
 * listing's audience (place or online-only), the grouped vocabulary as toggle
 * chips under "Choose from what's available", and a removable "Older tags"
 * row for selected tags those groups do not offer: older free-text tags, or
 * tags picked before the online-only flag flipped.
 */
export function ListingTagPicker({
  tags,
  isOnline,
  onAdd,
  onRemove,
}: ListingTagPickerProps) {
  const { t } = useTranslation();
  const vocabulary = useListingTagVocabulary(isOnline);
  const listId = useId();
  const availableLabelId = useId();
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAtCap = tags.length >= LISTING_TAG_CAP;
  const visibleGroups = useMemo(
    () => filterTagGroups(vocabulary, query, t),
    [vocabulary, query, t],
  );
  const legacyTags = useMemo(
    () => splitLegacyTags(tags, vocabulary),
    [tags, vocabulary],
  );

  function toggleTag(tag: string) {
    if (tags.includes(tag)) onRemove(tag);
    else if (!isAtCap) onAdd(tag);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Enter inside the wizard's form would otherwise submit the step.
      event.preventDefault();
      const unselectedTags = visibleGroups
        .flatMap((group) => group.tags)
        .filter((tag) => !tags.includes(tag));
      const [onlyMatch] = unselectedTags;
      if (unselectedTags.length === 1 && onlyMatch && !isAtCap) {
        onAdd(onlyMatch);
        setQuery("");
      }
    } else if (event.key === "Escape" && query) {
      // Escape clears the field here; stop it so a page-level Escape handler
      // leaves the rest of the wizard alone.
      event.stopPropagation();
      setQuery("");
    }
  }

  return (
    <div>
      <div className={pageStyles.tagInputWrap}>
        <input
          ref={searchInputRef}
          type="search"
          maxLength={40}
          value={query}
          aria-label={t("marketing:listBusiness.step2.tagsPlaceholder")}
          aria-controls={listId}
          placeholder={t("marketing:listBusiness.step2.tagsPlaceholder")}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={styles.availableHeader}>
        <span id={availableLabelId} className={styles.sectionLabel}>
          {t("marketing:listBusiness.step2.tagsAvailableLabel")}
        </span>
        <span className={styles.counter} aria-live="polite">
          {t("marketing:listBusiness.step2.tagsChosenCount", {
            count: tags.length,
          })}
        </span>
      </div>

      <ListingTagGroupList
        id={listId}
        labelledBy={availableLabelId}
        groups={visibleGroups}
        isOnline={isOnline}
        selectedTags={tags}
        isAtCap={isAtCap}
        query={query.trim()}
        onToggle={toggleTag}
      />

      <Collapse isOpen={legacyTags.length > 0}>
        <div className={styles.legacy}>
          <span className={styles.sectionLabel}>
            {t("marketing:listBusiness.step2.tagsLegacyLabel")}
          </span>
          <ChipList
            items={legacyTags}
            getKey={(tag) => tag}
            renderLabel={(tag) => listingTagLabel(t, tag)}
            removeLabel={(tag) =>
              t("marketing:listBusiness.step2.tagRemoveAria", {
                tag: listingTagLabel(t, tag),
              })
            }
            onRemove={(tag) => onRemove(tag)}
            emptyFocusRef={searchInputRef}
            className={styles.legacyList}
          />
        </div>
      </Collapse>

      <p className={styles.capHint} aria-live="polite">
        {isAtCap ? t("marketing:listBusiness.step2.tagsCapHint") : ""}
      </p>
    </div>
  );
}
