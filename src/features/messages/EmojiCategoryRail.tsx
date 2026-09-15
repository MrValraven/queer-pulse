// src/features/messages/EmojiCategoryRail.tsx
import { useEffect, useRef } from "react";
import {
  FiActivity,
  FiClock,
  FiCoffee,
  FiFeather,
  FiFlag,
  FiHash,
  FiMapPin,
  FiSmile,
  FiTool,
  FiUser,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EMOJI_SECTION_LABEL_KEY, type EmojiSection } from "./emojiSections";
import styles from "./EmojiPicker.module.css";

/** One Feather icon per section — WhatsApp uses the group's own emoji as its
 *  tab glyph, which `local/no-glyph-icon` forbids here, so each group gets a
 *  sensible stand-in icon instead. Falls back to `FiSmile` for a section key
 *  this map doesn't recognise (should never happen; the dataset's own
 *  `EmojiGroupKey` union is exhaustive here). */
const SECTION_ICON: Record<string, IconType> = {
  recents: FiClock,
  smileys: FiSmile,
  people: FiUser,
  animals: FiFeather,
  food: FiCoffee,
  activities: FiActivity,
  travel: FiMapPin,
  objects: FiTool,
  symbols: FiHash,
  flags: FiFlag,
};

interface EmojiCategoryRailProps {
  sections: EmojiSection[];
  onSelectSection: (sectionKey: string) => void;
  /** Which section's tab should read as current: the scroll-spy result from
   *  `useEmojiGridVirtualizer`, or (briefly, mid-jump) the section the caller
   *  just scrolled to. `null` when there's nothing to highlight yet. */
  activeSectionKey: string | null;
}

/**
 * The picker's category rail: one icon-only button per section, clicking one
 * scrolls the grid to that section's first row (owned by the caller, which
 * holds the virtualizer). Stays mounted during a search, on the caller's
 * query-independent `categorySections` — see `EmojiPicker`'s own doc for why
 * unmounting it would move the search field out from under the typist, and
 * what a tab click does mid-search.
 *
 * A flat row of equal controls is a `toolbar` with a translated label, the
 * way `ReactionPicker.tsx` reasons about it, not a `menu` (no roving
 * Up/Down between `menuitem`s here) — each tab's accessible name is its
 * translated category name, since the icon alone carries no group identity
 * to a screen reader.
 */
export function EmojiCategoryRail({
  sections,
  onSelectSection,
  activeSectionKey,
}: EmojiCategoryRailProps) {
  const { t } = useTranslation();
  // Holds each rail button by section key (mirrors `EmojiGrid.tsx`'s own
  // `buttonRefs` map), so the effect below can scroll the active tab into
  // view without re-querying the DOM by hand.
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());

  // Keeps the active tab visible when the rail overflows sideways (`.rail`'s
  // own `overflow-x: auto` fallback for a narrow panel). `block: "nearest"`
  // on a button that's already vertically in view is a no-op vertically, so
  // this can only ever move the rail's own horizontal scroll position, never
  // the page.
  useEffect(() => {
    if (activeSectionKey === null) return;
    buttonRefs.current
      .get(activeSectionKey)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeSectionKey]);

  if (sections.length === 0) return null;
  return (
    <div
      className={styles.rail}
      role="toolbar"
      aria-label={t("messages:emoji.railLabel")}
    >
      {sections.map((section) => {
        const Icon = SECTION_ICON[section.key] ?? FiSmile;
        const labelKey =
          EMOJI_SECTION_LABEL_KEY[section.key] ??
          "messages:emoji.categorySmileys";
        const isActive = section.key === activeSectionKey;
        return (
          <button
            key={section.key}
            ref={(node) => {
              if (node) buttonRefs.current.set(section.key, node);
              else buttonRefs.current.delete(section.key);
            }}
            type="button"
            className={
              isActive
                ? `${styles.railBtn} ${styles.railBtnActive}`
                : styles.railBtn
            }
            aria-label={t(labelKey)}
            // Omitted entirely (not `aria-current={false}`) for every
            // inactive tab: an explicit "false" still announces the
            // attribute exists, which is noisier than simply not having it.
            {...(isActive ? { "aria-current": "true" as const } : {})}
            onClick={() => onSelectSection(section.key)}
          >
            <Icon aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
