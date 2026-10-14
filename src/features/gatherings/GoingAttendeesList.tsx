import type { RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GoingAttendeeChip } from "./GoingAttendeeChip";
import { GoingAttendeesMoreButton } from "./GoingAttendeesMoreButton";
import type { useGoingAttendeesExpansion } from "./useGoingAttendeesExpansion";
import styles from "./GoingAttendeesPreview.module.css";

type Expansion = ReturnType<typeof useGoingAttendeesExpansion>;

interface GoingAttendeesListProps {
  expansion: Expansion;
  listRef: RefObject<HTMLDivElement | null>;
  toggleRef: RefObject<HTMLButtonElement | null>;
  showLessRef: RefObject<HTMLButtonElement | null>;
  /** "Show less" was pressed: the revealed part fades out in place before
   *  it unmounts, so the frame only starts shrinking once it is gone. */
  isLeaving: boolean;
  onShowLess: () => void;
}

/**
 * ONE wrapping flex list for everyone: the preview's chips, then (once
 * "+N more" is pressed) the revealed chips, so the first revealed chip takes
 * the pill's spot and the rows fill continuously. The trailing pill (the
 * toggle while collapsed, the load-more pill while the server has another
 * page) is the list's last item, mounted or unmounted whole. Below sits the
 * expanded footer: the bare "N more going privately" count and "Show less".
 * Pieces mount with plain conditionals because the motion lives around
 * them: `GoingHeightFrame` animates the list's height, and every revealed
 * piece fades in (`.entering`) and out (`.leaving`, before it unmounts).
 * Nothing here re-filters the rows the server sent.
 */
export function GoingAttendeesList({
  expansion,
  listRef,
  toggleRef,
  showLessRef,
  isLeaving,
  onShowLess,
}: GoingAttendeesListProps) {
  const { t } = useTranslation();
  const revealedClass = isLeaving ? styles.leaving : styles.entering;
  const isToggleShown = expansion.collapsedMoreCount > 0 && !expansion.isOpen;
  const isLoadMoreShown =
    expansion.isOpen && expansion.hasMore && expansion.loadMoreCount > 0;

  return (
    <>
      <div
        ref={listRef}
        className={styles.list}
        aria-busy={expansion.isFetchingMore || undefined}
      >
        {expansion.previewPeople.map((person) => (
          <GoingAttendeeChip
            key={person.slug}
            person={person}
            role={expansion.roleFor(person.slug)}
          />
        ))}
        {expansion.isOpen &&
          expansion.revealedPeople.map((person) => (
            <GoingAttendeeChip
              key={person.slug}
              person={person}
              role={expansion.roleFor(person.slug)}
              isRevealed
              className={revealedClass}
            />
          ))}
        {isToggleShown && (
          <GoingAttendeesMoreButton
            buttonRef={toggleRef}
            // Fades back in after a collapse, never on page load.
            className={
              expansion.hasExpandedBefore ? styles.entering : undefined
            }
            count={expansion.collapsedMoreCount}
            isBusy={expansion.isToggleBusy}
            isExpanded={false}
            controlsId={expansion.regionId}
            onPress={expansion.expand}
          />
        )}
        {isLoadMoreShown && (
          <GoingAttendeesMoreButton
            className={revealedClass}
            count={expansion.loadMoreCount}
            isBusy={expansion.isFetchingMore}
            controlsId={expansion.regionId}
            onPress={expansion.loadMore}
          />
        )}
      </div>
      {expansion.isOpen && (
        <div className={`${styles.footer} ${revealedClass}`}>
          {expansion.privateCount > 0 && (
            <span className={styles.privateLine}>
              {t("gatherings:gathering.attendeesPreview.goingPrivately", {
                count: expansion.privateCount,
              })}
            </span>
          )}
          <button
            ref={showLessRef}
            type="button"
            data-tap-target
            className={styles.textButton}
            aria-expanded
            aria-controls={expansion.regionId}
            onClick={onShowLess}
          >
            {t("gatherings:gathering.attendeesPreview.showLess")}
          </button>
        </div>
      )}
    </>
  );
}
