import { useId } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  listingTagGroupLabel,
  listingTagLabel,
  type ListingTagGroupShape,
} from "./listingTags.data";
import pageStyles from "./ListBusinessPage.module.css";
import styles from "./ListingTagPicker.module.css";

interface ListingTagGroupListProps {
  /** The search box's `aria-controls` target. */
  id: string;
  labelledBy: string;
  groups: readonly ListingTagGroupShape[];
  selectedTags: readonly string[];
  isAtCap: boolean;
  /** The trimmed search text, for the no-match line. */
  query: string;
  onToggle: (tag: string) => void;
}

/**
 * The vocabulary as stacked groups of toggle chips, styled like the "Good
 * for" pills on the same step. At the cap the unselected chips are disabled;
 * the selected ones stay pressable so a tag can be dropped.
 */
export function ListingTagGroupList({
  id,
  labelledBy,
  groups,
  selectedTags,
  isAtCap,
  query,
  onToggle,
}: ListingTagGroupListProps) {
  const { t } = useTranslation();
  const headingIdPrefix = useId();

  return (
    <div id={id} role="group" aria-labelledby={labelledBy}>
      {groups.length === 0 ? (
        <p className={styles.noMatch}>
          {t("marketing:listBusiness.step2.tagsNoMatch", { query })}
        </p>
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => {
            const headingId = `${headingIdPrefix}-${group.id}`;
            return (
              <div
                key={group.id}
                role="group"
                aria-labelledby={headingId}
                className={styles.group}
              >
                <span id={headingId} className={styles.groupHeading}>
                  {listingTagGroupLabel(t, group.id)}
                </span>
                <div className={styles.chipWrap}>
                  {group.tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={!isSelected && isAtCap}
                        className={[
                          pageStyles.chip,
                          isSelected && pageStyles.chipOn,
                          styles.tagChip,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => onToggle(tag)}
                      >
                        {isSelected ? (
                          <FiCheck size={12} aria-hidden />
                        ) : (
                          <FiPlus size={12} aria-hidden />
                        )}
                        {listingTagLabel(t, tag)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
