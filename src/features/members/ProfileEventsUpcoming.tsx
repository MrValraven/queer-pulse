import { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiChevronDown } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ProfileEventItem } from "./api/profileEvents.adapters";
import { HeightGlide, ProfileEventCell } from "./ProfileEventsMotion";
import { ProfileEventRail, ProfileEventRow } from "./ProfileEventRow";
import styles from "./ProfileEventsSection.module.css";

/** Posters shown before "Show more": one desktop row. */
const VISIBLE_COUNT = 3;

/**
 * The member's upcoming events, soonest first. In a column too narrow for
 * three posters (`isRail`) every poster sits in one sideways rail with no
 * button. A wide column holds a three-column grid: the first three show,
 * "Show more" fades the rest in as the grid opens, and "Show fewer" fades
 * them out as it closes. After closing, the button is scrolled back into
 * view when it would land off screen or under the fixed nav.
 */
export function ProfileEventsUpcoming({
  items,
  isRail,
}: {
  items: ProfileEventItem[];
  isRail: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const gridId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const isCollapsingRef = useRef(false);
  const revealMoreButton = useCallback(() => {
    if (!isCollapsingRef.current) return;
    isCollapsingRef.current = false;
    // "nearest" leaves a button already in view alone, and the button's
    // scroll margin keeps it clear of the fixed nav.
    moreButtonRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [reducedMotion]);
  const label = (
    <h3 className={styles.label}>{t("members:profileEvents.upcomingLabel")}</h3>
  );

  if (isRail) {
    return (
      <div className={styles.group}>
        {label}
        <ProfileEventRail items={items} />
      </div>
    );
  }

  const hiddenCount = Math.max(0, items.length - VISIBLE_COUNT);
  const shownItems = isExpanded ? items : items.slice(0, VISIBLE_COUNT);
  return (
    <div className={styles.group}>
      {label}
      <HeightGlide onSettled={revealMoreButton}>
        <div id={gridId} className={styles.grid}>
          {/* `initial={false}`: the first posters are simply there on load,
              and only a poster the button adds or takes away animates. */}
          <AnimatePresence initial={false}>
            {shownItems.map((item, index) => (
              <ProfileEventCell
                key={item.event.slug ?? item.event.to}
                arrivalIndex={Math.max(0, index - VISIBLE_COUNT)}
              >
                <ProfileEventRow item={item} />
              </ProfileEventCell>
            ))}
          </AnimatePresence>
        </div>
      </HeightGlide>
      {hiddenCount > 0 && (
        <Button
          ref={moreButtonRef}
          type="button"
          variant="quiet"
          size="sm"
          className={styles.moreButton}
          aria-expanded={isExpanded}
          aria-controls={gridId}
          onClick={() => {
            isCollapsingRef.current = isExpanded;
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded
            ? t("members:profileEvents.showFewer")
            : t("members:profileEvents.showMore", { count: hiddenCount })}
          <FiChevronDown
            aria-hidden
            className={
              isExpanded
                ? `${styles.chevron} ${styles.chevronOpen}`
                : styles.chevron
            }
          />
        </Button>
      )}
    </div>
  );
}
