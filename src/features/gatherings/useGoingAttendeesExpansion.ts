import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { initialsFromParts } from "../../shared/lib/initials";
import { demoGoingAttendees } from "./GoingAttendeesPreview.data";
import {
  REVEALED_CHIP_SELECTOR,
  type GoingChipPerson,
  type GoingChipRole,
} from "./GoingAttendeeChip";
import type { EventHostDTO } from "./api/events.api";
import type { AttendeeRow } from "./api/events.adapters";
import { useAttendeePages } from "./api/useAttendeePages";
import type { GatheringDetail } from "./data";

export interface GoingPreview {
  attendees: EventHostDTO[];
  total: number;
}

/** The elements focus moves between, owned by the rendering component. */
export interface GoingFocusRefs {
  toggleRef: RefObject<HTMLButtonElement | null>;
  /** The one flex list holding preview and revealed chips alike. */
  listRef: RefObject<HTMLDivElement | null>;
  showLessRef: RefObject<HTMLButtonElement | null>;
}

/** Where focus goes once the list settles: the chip at `chipIndex` among the
 *  revealed ones (or Show less when there is none), or back to the toggle. */
type PendingFocus =
  { target: "chip"; chipIndex: number } | { target: "toggle" };

function personFromPreview(attendee: EventHostDTO): GoingChipPerson {
  return {
    slug: attendee.slug,
    firstName: attendee.firstName,
    fullName: `${attendee.firstName} ${attendee.lastName}`.trim(),
    initials: initialsFromParts(attendee.firstName, attendee.lastName),
    avatarUrl: attendee.avatarUrl ?? undefined,
  };
}

/** A paged row carries its own first name; a row without one (older
 *  server) falls back to the first word of the full name. */
function personFromRow(row: AttendeeRow): GoingChipPerson {
  return {
    slug: row.slug,
    firstName: row.firstName ?? row.name.split(/\s+/)[0] ?? row.name,
    fullName: row.name,
    initials: row.initials,
    avatarUrl: row.avatarUrl,
  };
}

/**
 * The "+N more" expansion of the "Who's going" row. Live, the rest of the
 * list comes from the paged attendees route, fetched only once the member
 * asks for it; that route is the privacy gate (blocks, each attendee's own
 * "Who can see you're going?" answer, the host's "Show attendee count"
 * toggle), so its rows are shown as given. The preview's total counts the
 * people it hides from this viewer too, and the pages' total does not: the
 * gap reads as a bare "N more going privately". Demo has no paged roster
 * for these faces, so it reads the full list `demoGoingAttendees` derives
 * from the same pool, with no loading or paging.
 */
export function useGoingAttendeesExpansion(
  gathering: GatheringDetail,
  preview: GoingPreview | null,
  { toggleRef, listRef, showLessRef }: GoingFocusRefs,
) {
  const { demoMode } = useDemoMode();
  const [isExpandRequested, setIsExpandRequested] = useState(false);
  const [hasExpandedBefore, setHasExpandedBefore] = useState(false);
  // A ref: the press that sets it always re-renders on its own.
  const pendingFocusRef = useRef<PendingFocus | null>(null);
  const regionId = useId();

  const pages = useAttendeePages(
    demoMode ? undefined : gathering.slug,
    { status: "going" },
    { isEnabled: isExpandRequested && !demoMode },
  );
  const demoList = demoMode ? demoGoingAttendees(gathering) : null;

  const previewPeople = (preview?.attendees ?? []).map(personFromPreview);
  const previewTotal = preview?.total ?? 0;
  const shownSlugs = new Set(previewPeople.map((person) => person.slug));
  const sourcePeople = demoMode
    ? (demoList?.attendees ?? []).map(personFromPreview)
    : pages.rows.map(personFromRow);
  const revealedPeople = sourcePeople.filter((person) => {
    if (shownSlugs.has(person.slug)) return false;
    shownSlugs.add(person.slug);
    return true;
  });

  // The first page has landed: live needs a total to compare against.
  const hasLoadedFirstPage = demoMode
    ? true
    : !pages.isLoading && !pages.isLoadError && pages.total > 0;
  const isOpen = isExpandRequested && hasLoadedFirstPage;
  const visibleTotal = demoMode
    ? (demoList?.attendees.length ?? 0)
    : pages.total;
  const shownCount = previewPeople.length + revealedPeople.length;

  const collapsedMoreCount = Math.max(0, previewTotal - previewPeople.length);
  const privateCount = Math.max(0, previewTotal - visibleTotal);
  const hasMore = !demoMode && pages.hasMore;
  const loadMoreCount = Math.max(0, visibleTotal - shownCount);

  const cohostSlugs = new Set(
    (gathering.cohosts ?? []).map((cohost) => cohost.slug),
  );
  const roleFor = (slug: string): GoingChipRole => {
    if (slug === gathering.hostSlug) return "host";
    return cohostSlugs.has(slug) ? "cohost" : null;
  };

  const revealedCount = revealedPeople.length;
  const isFetchingMore = pages.isFetchingMore;
  const isLoadMoreError = pages.isLoadMoreError;
  // A load-more press waits for its page: this notes that the fetch began,
  // so a page that brings nobody new can release the pending focus.
  const hasSeenFetchRef = useRef(false);
  // Runs after every render: whichever render settles the list moves focus.
  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus) return;
    if (pendingFocus.target === "toggle") {
      if (isOpen || !toggleRef.current) return;
      toggleRef.current.focus({ preventScroll: true });
      pendingFocusRef.current = null;
      return;
    }
    if (!isOpen) return;
    if (isFetchingMore) hasSeenFetchRef.current = true;
    const chips = listRef.current?.querySelectorAll<HTMLElement>(
      REVEALED_CHIP_SELECTOR,
    );
    const chip = chips?.[pendingFocus.chipIndex];
    const isFirstReveal = pendingFocus.chipIndex === 0;
    const hasPageSettled =
      isLoadMoreError || (hasSeenFetchRef.current && !isFetchingMore);
    if (!chip && !isFirstReveal && !hasPageSettled) return;
    // No scroll: the frame may still be growing, and scrolling its clipped
    // box would offset the chips inside it. A failed page leaves focus
    // on the pressed button; the retry line says what failed.
    const target = chip ?? (isFirstReveal ? showLessRef.current : null);
    target?.focus({ preventScroll: true });
    hasSeenFetchRef.current = false;
    pendingFocusRef.current = null;
  });

  const expand = () => {
    if (pages.isLoadError) pages.retry();
    pendingFocusRef.current = { target: "chip", chipIndex: 0 };
    setIsExpandRequested(true);
    setHasExpandedBefore(true);
  };
  const collapse = () => {
    pendingFocusRef.current = { target: "toggle" };
    setIsExpandRequested(false);
  };
  const loadMore = () => {
    hasSeenFetchRef.current = false;
    pendingFocusRef.current = { target: "chip", chipIndex: revealedCount };
    pages.loadMore();
  };
  // The error line folds away while a retry runs, so focus moves to the
  // toggle, which shows the retry as its own loading state.
  const retryFirstLoad = () => {
    toggleRef.current?.focus({ preventScroll: true });
    expand();
  };

  return {
    regionId,
    previewPeople,
    revealedPeople,
    roleFor,
    isOpen,
    hasExpandedBefore,
    collapsedMoreCount,
    privateCount,
    hasMore,
    loadMoreCount,
    isToggleBusy: isExpandRequested && !isOpen && pages.isLoading,
    isFetchingMore,
    isLoadError: isExpandRequested && !demoMode && pages.isLoadError,
    isLoadMoreError: isOpen && isLoadMoreError,
    expand,
    collapse,
    loadMore,
    retryFirstLoad,
    // A refetch skips a failed next page; load more asks for it again.
    retryLoadMore: loadMore,
  };
}
