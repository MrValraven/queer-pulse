// src/features/messages/WhoReactedTabs.tsx
import type { RefObject } from "react";
import { tabIds } from "../../shared/components/ui/tabIds";
import { useTablistKeys } from "../../shared/components/ui/useTablistKeys";
import type {
  MessageReactionKey,
  ReactionSummary,
} from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { REACTION_EMOJI } from "./reactionKeys";
import { useReactionLabels } from "./useReactionLabels";
import styles from "./WhoReactedSheet.module.css";

export type ReactorFilter = "all" | MessageReactionKey;

interface WhoReactedTabsProps {
  /** The tablist node, which focus recovery searches for the selected tab. */
  tablistRef: RefObject<HTMLDivElement | null>;
  /** Shared with the panel's `tabPanelProps`, so the selected tab points at it. */
  tabsId: string;
  /** The message's reactions with a count above 0, in display order. */
  presentReactions: ReactionSummary[];
  activeFilter: ReactorFilter;
  totalCount: number;
  onSelect: (filter: ReactorFilter) => void;
  /** Records that focus is in the strip (`useWhoReactedFocusRecovery`). */
  onFocus: () => void;
}

/** The "who reacted" filter tabs (PRD-352): "All N", then one per reaction key
 *  present with its count, the glyph rendered as `ReactionChips` renders it.
 *  The APG tabs pattern with automatic activation (`useTablistKeys`). */
export function WhoReactedTabs({
  tablistRef,
  tabsId,
  presentReactions,
  activeFilter,
  totalCount,
  onSelect,
  onFocus,
}: WhoReactedTabsProps) {
  const { t } = useTranslation();
  const labels = useReactionLabels();
  const filters: ReactorFilter[] = [
    "all",
    ...presentReactions.map((reaction) => reaction.key),
  ];
  const { tabProps } = useTablistKeys(filters.length, (index) =>
    onSelect(filters[index] ?? "all"),
  );

  return (
    <div
      ref={tablistRef}
      role="tablist"
      aria-label={t("messages:reactors.tablistLabel")}
      className={styles.tabs}
      onFocus={onFocus}
    >
      {filters.map((filter, index) => {
        const isSelected = filter === activeFilter;
        const ids = tabIds(tabsId, filter);
        const summary = presentReactions.find(
          (reaction) => reaction.key === filter,
        );
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            id={ids.tab}
            // Only the selected tab's panel is in the document.
            aria-controls={isSelected ? ids.panel : undefined}
            aria-selected={isSelected}
            // "Love, 3 reactions": the chip's own label, so the glyph is
            // never the only name a screen reader gets.
            aria-label={
              summary
                ? t("messages:reactions.chipLabel", {
                    name: labels[summary.key],
                    count: summary.count,
                  })
                : undefined
            }
            className={[styles.tab, isSelected && styles.tabSelected]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(filter)}
            {...tabProps(index, isSelected)}
          >
            {summary ? (
              <>
                <span aria-hidden>{REACTION_EMOJI[summary.key]}</span>
                <span>{summary.count}</span>
              </>
            ) : (
              t("messages:reactors.tabAll", { total: totalCount })
            )}
          </button>
        );
      })}
    </div>
  );
}
