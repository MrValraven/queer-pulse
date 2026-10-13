import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChipList, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useListingAttributeVocabulary } from "./api/useListingAttributeVocabulary";
import { ListingAttributeGroupList } from "./ListingAttributeGroupList";
import {
  attributeLabel,
  carriedAttributesOutsideOffer,
  filterAttributeGroups,
  offeredAttributeGroups,
} from "./listingAttributes.data";
import type { ListingKind } from "./listingMobile.data";
import pageStyles from "./ListBusinessPage.module.css";
import styles from "./ListingFacts.module.css";

const KEY = "marketing:listBusiness.step2.attributes";

interface ListingAttributePickerProps {
  attributes: readonly string[];
  kind: ListingKind;
  cats: readonly string[];
  /** The field helper's id, announced with the search box. */
  describedBy?: string;
  /** A create (`isNewListingDraft`): the "No longer fits" row then says
   *  its slugs will not be saved, since a create drops them. An edit keeps
   *  them, and the row says so. */
  isNewDraft?: boolean;
  onToggle: (slug: string) => void;
}

/**
 * "What's true about this place": a search box over the attributes the
 * listing's kind and categories are offered, the offered groups as toggle
 * chips (uncapped), and a "No longer fits your categories" row for ticked
 * slugs outside the offer, which can only be removed there. Its note says
 * what a save does with them: a create drops them, an edit keeps them.
 */
export function ListingAttributePicker({
  attributes,
  kind,
  cats,
  describedBy,
  isNewDraft = false,
  onToggle,
}: ListingAttributePickerProps) {
  const { t } = useTranslation();
  const vocabulary = useListingAttributeVocabulary();
  const listId = useId();
  const availableLabelId = useId();
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const offeredGroups = useMemo(
    () => offeredAttributeGroups(vocabulary, kind, cats),
    [vocabulary, kind, cats],
  );
  const visibleGroups = useMemo(
    () => filterAttributeGroups(offeredGroups, query, t),
    [offeredGroups, query, t],
  );
  const carried = useMemo(
    () => carriedAttributesOutsideOffer(attributes, offeredGroups),
    [attributes, offeredGroups],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Enter inside the wizard's form would otherwise submit the step.
      event.preventDefault();
      const unticked = visibleGroups
        .flatMap((group) => group.attributes)
        .filter((slug) => !attributes.includes(slug));
      const [onlyMatch] = unticked;
      if (unticked.length === 1 && onlyMatch) {
        onToggle(onlyMatch);
        setQuery("");
      }
    } else if (event.key === "Escape" && query) {
      // Escape clears the field; a page-level Escape handler stays out of it.
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
          aria-label={t(`${KEY}.searchPlaceholder`)}
          aria-controls={listId}
          aria-describedby={describedBy}
          placeholder={t(`${KEY}.searchPlaceholder`)}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={styles.availableHeader}>
        <span id={availableLabelId} className={styles.sectionLabel}>
          {t(`${KEY}.availableLabel`)}
        </span>
        <span className={styles.counter} aria-live="polite">
          {t(`${KEY}.chosenCount`, { count: attributes.length })}
        </span>
      </div>

      <ListingAttributeGroupList
        id={listId}
        labelledBy={availableLabelId}
        groups={visibleGroups}
        selected={attributes}
        query={query.trim()}
        onToggle={onToggle}
      />

      <Collapse isOpen={carried.length > 0}>
        <div className={styles.legacy}>
          <span className={styles.sectionLabel}>
            {t(`${KEY}.outsideOfferLabel`)}
          </span>
          <p className={styles.legacyNote}>
            {t(
              isNewDraft
                ? `${KEY}.outsideOfferNoteNew`
                : `${KEY}.outsideOfferNote`,
            )}
          </p>
          <ChipList
            items={carried}
            getKey={(slug) => slug}
            renderLabel={(slug) => attributeLabel(t, slug)}
            removeLabel={(slug) =>
              t(`${KEY}.removeAria`, { attribute: attributeLabel(t, slug) })
            }
            onRemove={(slug) => onToggle(slug)}
            emptyFocusRef={searchInputRef}
            className={styles.legacyList}
          />
        </div>
      </Collapse>
    </div>
  );
}
