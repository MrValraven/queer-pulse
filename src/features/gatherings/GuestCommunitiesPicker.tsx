import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { FiSearch } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import { afterRender } from "./createGatheringChapters";
import { TextInput } from "./CreateGatheringFields";
import { countActiveGuests, MAX_GUEST_COMMUNITIES } from "./guestCommunities";
import { GuestCommunityResults } from "./GuestCommunityResults";
import { GuestCommunityRows } from "./GuestCommunityRows";
import {
  useGuestCommunityCandidates,
  type GuestCommunityCandidate,
} from "./useGuestCommunityCandidates";
import styles from "./GuestCommunitiesPicker.module.css";

export interface GuestCommunitiesPickerProps {
  /** The search input's id, which the wrapping field's label points at. */
  inputId: string;
  /** The wrapping field's hint id, read with the search input. */
  describedById: string;
  /** The input's accessible name, for a wrapper whose visible label cannot
   *  point at it (the edit modal's `FormField`). */
  ariaLabel?: string;
  /** The lead community's slug, or `""` while none is set. */
  leadSlug: string;
  guests: GuestCommunityDraftEntry[];
  /** The status label of a row added in this edit. */
  unsentLabel: string;
  onChange: (guests: GuestCommunityDraftEntry[]) => void;
  /** The field's hint, shown between the search and the rows so it sits
   *  next to the search it describes. Its wrapper takes `describedById`, so
   *  a surface that passes it renders no hint of its own. */
  helper?: ReactNode;
}

/** On a phone the open list can fall under a sticky bar at the bottom of
 *  the screen, so opening it scrolls the search to the top of its scroller. */
function useScrollIntoViewOnPhone(
  isOpen: boolean,
  targetRef: RefObject<HTMLElement | null>,
) {
  const isPhone = useMediaQuery(mediaMax("md"));
  const { reducedMotion } = useMotionPrefs();
  useEffect(() => {
    if (!isOpen || !isPhone) return;
    targetRef.current?.scrollIntoView({
      block: "start",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [isOpen, isPhone, reducedMotion, targetRef]);
}

/**
 * Guest communities: a search that offers communities to invite, then the
 * rows already on the gathering with their status and a remove action.
 * Shared by the edit modal and the create wizard, which each wrap it in
 * their own field label and hint.
 *
 * The search stays locked until a lead is set and while five rows hold a
 * place (a decline holds none). Picking adds an `"unsent"` row; the
 * surface sends it on Save or on publish.
 */
export function GuestCommunitiesPicker({
  inputId,
  describedById,
  ariaLabel,
  leadSlug,
  guests,
  unsentLabel,
  onChange,
  helper,
}: GuestCommunitiesPickerProps) {
  const { t } = useTranslation();
  const resultsId = `${inputId}-results`;
  const [searchTerm, setSearchTerm] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);
  const [hasOpenedList, setHasOpenedList] = useState(false);
  const isCapReached = countActiveGuests(guests) >= MAX_GUEST_COMMUNITIES;
  const isSearchDisabled = leadSlug === "" || isCapReached;
  const { matches, isAwaitingMatches, isError, refetch } =
    useGuestCommunityCandidates({
      searchTerm,
      hasOpenedList,
      excludedSlugs: [leadSlug, ...guests.map((guest) => guest.slug)],
    });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const capNoteRef = useRef<HTMLParagraphElement>(null);
  const helperRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const isOpenSuppressedRef = useRef(false);
  useScrollIntoViewOnPhone(isListOpen && !isSearchDisabled, containerRef);

  // Idempotent, so a focus and a click on the same press open it once.
  const openList = () => {
    if (isSearchDisabled || isOpenSuppressedRef.current) return;
    setIsListOpen(true);
    setHasOpenedList(true);
  };
  const closeList = () => setIsListOpen(false);
  useOutsideDismiss(isListOpen, containerRef, closeList);

  /** Focusing the input runs its `onFocus` synchronously; the suppressed
   *  flag keeps that from opening the list over the rows. */
  const returnFocusAndClose = () => {
    isOpenSuppressedRef.current = true;
    inputRef.current?.focus();
    isOpenSuppressedRef.current = false;
    closeList();
  };

  /** Where focus goes when the search it was headed for is locked: the cap
   *  note, else the hint, else the rows. */
  const focusPastLockedSearch = () => {
    const input = inputRef.current;
    if (input && !input.disabled) {
      returnFocusAndClose();
      return;
    }
    (capNoteRef.current ?? helperRef.current ?? rowsRef.current)?.focus();
  };

  const pickCommunity = (candidate: GuestCommunityCandidate) => {
    const isLastPlace = countActiveGuests(guests) + 1 >= MAX_GUEST_COMMUNITIES;
    onChange([
      ...guests,
      {
        slug: candidate.slug,
        name: candidate.name,
        accessTier: candidate.accessTier,
        status: "unsent",
      },
    ]);
    setSearchTerm("");
    if (!isLastPlace) {
      returnFocusAndClose();
      return;
    }
    // This pick locks the search, so focus moves on once it has re-rendered.
    closeList();
    afterRender(focusPastLockedSearch);
  };

  // The row and its button fold away, so focus returns to the search once
  // it has re-rendered (removing the fifth row unlocks it in that render).
  const removeCommunity = (slug: string) => {
    onChange(guests.filter((guest) => guest.slug !== slug));
    afterRender(focusPastLockedSearch);
  };

  const focusOption = (index: number) => {
    const optionButtons =
      listRef.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!optionButtons || optionButtons.length === 0) return;
    optionButtons[
      (index + optionButtons.length) % optionButtons.length
    ]?.focus();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openList();
      afterRender(() => focusOption(0));
    } else if (event.key === "Escape" && isListOpen) {
      // This Escape belongs to the open list. Stopping it keeps it from
      // reaching a surrounding dialog's document listener.
      event.preventDefault();
      event.stopPropagation();
      closeList();
    }
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index === 0) inputRef.current?.focus();
      else focusOption(index - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      returnFocusAndClose();
    }
  };

  // Focus landing on a real element outside the search closes the list. A
  // press on an option can blur with no related target (Safari does not
  // focus buttons on click), which the outside-press handler covers.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocus = event.relatedTarget as Node | null;
    if (nextFocus && !event.currentTarget.contains(nextFocus)) closeList();
  };

  return (
    <div className={styles.picker}>
      <div ref={containerRef} className={styles.search} onBlur={handleBlur}>
        <TextInput
          ref={inputRef}
          id={inputId}
          type="search"
          icon={FiSearch}
          autoComplete="off"
          disabled={isSearchDisabled}
          aria-label={ariaLabel}
          aria-describedby={describedById}
          aria-controls={isListOpen ? resultsId : undefined}
          placeholder={t("gatherings:guestCommunities.searchPlaceholder")}
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            openList();
          }}
          onFocus={openList}
          onClick={openList}
          onKeyDown={handleSearchKeyDown}
        />
        <Collapse
          isOpen={isListOpen && !isSearchDisabled}
          className={styles.dropdown}
        >
          <GuestCommunityResults
            resultsId={resultsId}
            listRef={listRef}
            matches={matches}
            isLoading={isAwaitingMatches}
            isError={isError}
            onRetry={refetch}
            onPick={pickCommunity}
            onOptionKeyDown={handleOptionKeyDown}
          />
        </Collapse>
      </div>
      {helper !== undefined && (
        <div
          ref={helperRef}
          id={describedById}
          tabIndex={-1}
          className={styles.helper}
        >
          {helper}
        </div>
      )}
      <Collapse isOpen={isCapReached}>
        <p
          ref={capNoteRef}
          role="status"
          tabIndex={-1}
          className={styles.capNote}
        >
          {t("gatherings:guestCommunities.capReached", {
            max: MAX_GUEST_COMMUNITIES,
          })}
        </p>
      </Collapse>
      <GuestCommunityRows
        listRef={rowsRef}
        guests={guests}
        unsentLabel={unsentLabel}
        onRemove={removeCommunity}
      />
    </div>
  );
}
