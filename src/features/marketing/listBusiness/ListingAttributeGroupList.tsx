import { useId } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  attributeGroupLabel,
  attributeLabel,
  type ListingAttributeGroup,
} from "./listingAttributes.data";
import pageStyles from "./ListBusinessPage.module.css";
import styles from "./ListingFacts.module.css";

interface ListingAttributeGroupListProps {
  /** The search box's `aria-controls` target. */
  id: string;
  labelledBy: string;
  groups: readonly ListingAttributeGroup[];
  selected: readonly string[];
  /** The trimmed search text, for the no-match line. */
  query: string;
  onToggle: (slug: string) => void;
}

/** The offered attributes as stacked, headed groups of toggle chips. Every
 *  chip stays pressable; `withAttributeToggled` ignores a tick past the
 *  server's limit of 40 (`LISTING_ATTRIBUTE_CAP`). */
export function ListingAttributeGroupList({
  id,
  labelledBy,
  groups,
  selected,
  query,
  onToggle,
}: ListingAttributeGroupListProps) {
  const { t } = useTranslation();
  const headingIdPrefix = useId();

  return (
    <div id={id} role="group" aria-labelledby={labelledBy}>
      {groups.length === 0 ? (
        query.length > 0 && (
          <p className={styles.noMatch}>
            {t("marketing:listBusiness.step2.attributes.noMatch", { query })}
          </p>
        )
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
                  {attributeGroupLabel(t, group.id)}
                </span>
                <div className={styles.chipWrap}>
                  {group.attributes.map((slug) => {
                    const isSelected = selected.includes(slug);
                    return (
                      <button
                        key={slug}
                        type="button"
                        aria-pressed={isSelected}
                        className={[
                          pageStyles.chip,
                          isSelected && pageStyles.chipOn,
                          styles.tagChip,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => onToggle(slug)}
                      >
                        {isSelected ? (
                          <FiCheck size={12} aria-hidden />
                        ) : (
                          <FiPlus size={12} aria-hidden />
                        )}
                        {attributeLabel(t, slug)}
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
