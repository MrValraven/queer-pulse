import type { FocusEvent } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Tag } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EventPosterCard } from "../gatherings/hub/EventPosterCard";
import type { ProfileEventItem } from "./api/profileEvents.adapters";
import styles from "./ProfileEventsSection.module.css";

/**
 * One event on the profile: the hub's `featured` poster (3:4, date chip),
 * plus a "Co-host" tag as a caption under it when the member co-hosts it.
 * The tag sits outside the card's link, so the link's name stays the event
 * title and the tag reads as its own fact. A past event drops the "when"
 * ribbon and dates itself with the year. The hub's community menu stays off:
 * hiding a community's events is a choice for the Events Hub.
 */
export function ProfileEventRow({
  item,
  isPast = false,
}: {
  item: ProfileEventItem;
  isPast?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.cell}>
      <EventPosterCard
        event={item.event}
        variant="featured"
        isPast={isPast}
        showCommunityMenu={false}
      />
      {item.role === "cohost" && (
        <Tag className={styles.cohostTag}>
          {t("members:profileEvents.cohostTag")}
        </Tag>
      )}
    </div>
  );
}

/**
 * The layout for a column too narrow for three posters (a phone, or a
 * desktop window that keeps the sections sidebar): every poster in one row
 * that scrolls sideways and snaps each poster to the start. When focus lands
 * in a poster (a Tab to its link) that is only partly visible, the rail
 * scrolls that poster to its snap point, so focus never sits off screen.
 * Reduced motion makes that scroll instant.
 */
export function ProfileEventRail({
  items,
  isPast = false,
}: {
  items: ProfileEventItem[];
  isPast?: boolean;
}) {
  const { reducedMotion } = useMotionPrefs();
  // The rail snaps each poster to its start, so a "nearest" scroll that lines
  // a poster's end up with the trailing edge gets snapped straight back. A
  // poster that is not fully visible scrolls to its own snap point.
  const bringIntoView = (event: FocusEvent<HTMLLIElement>) => {
    const item = event.currentTarget;
    const rail = item.parentElement;
    if (!rail) return;
    const railStyle = getComputedStyle(rail);
    const paddingStart = parseFloat(railStyle.scrollPaddingInlineStart) || 0;
    const paddingEnd = parseFloat(railStyle.scrollPaddingInlineEnd) || 0;
    const railBox = rail.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();
    const isFullyVisible =
      itemBox.left >= railBox.left + paddingStart - 1 &&
      itemBox.right <= railBox.right - paddingEnd + 1;
    if (isFullyVisible) return;
    rail.scrollBy({
      left: itemBox.left - railBox.left - paddingStart,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };
  return (
    <ul className={styles.rail}>
      {items.map((item) => (
        <li
          key={item.event.slug ?? item.event.to}
          className={styles.railItem}
          onFocus={bringIntoView}
        >
          <ProfileEventRow item={item} isPast={isPast} />
        </li>
      ))}
    </ul>
  );
}
