import { useEffect, useRef } from "react";

/** The data attributes the guest row puts on its two buttons, read back here
 *  to find them again. */
const CHECK_IN_SLUG_ATTRIBUTE = "data-checkin-slug";
const UNDO_SLUG_ATTRIBUTE = "data-undo-slug";

/** True when the button for `slug` holds keyboard focus right now. */
function isKeyboardFocused(attributeName: string, slug: string): boolean {
  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLElement)) return false;
  if (activeElement.getAttribute(attributeName) !== slug) return false;
  try {
    return activeElement.matches(":focus-visible");
  } catch {
    // An engine without `:focus-visible` support: focus alone decides.
    return true;
  }
}

function checkInButtons(container: ParentNode | null): HTMLButtonElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>(
      `button[${CHECK_IN_SLUG_ATTRIBUTE}]`,
    ),
  );
}

/** The toolbar's guest search box. It stays mounted when a search hides the
 *  "Still to arrive" group, so focus has somewhere steady to land. */
function findSearchField(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>("input[data-checkin-search]");
}

/** An undo pressed from the keyboard, waiting for its request to settle. */
interface PendingUndoFocus {
  slug: string;
  /** Set once the slug has shown up in `pendingSlugs`, so a render that
   *  lands before the request starts does not count as it settling. */
  hasBeenPending: boolean;
}

/**
 * Keeps keyboard focus on the guest list while rows change under it.
 *
 * A check-in disables and then removes the button that was pressed, and an
 * undo does the same to its own button, so focus would fall to the page body.
 * After a keyboard check-in, focus moves straight to the next guest still to
 * arrive, ready for the next Enter, or to "Load more", then the search box,
 * then the group's heading when there is none. The search box comes before
 * the heading because a search hides a group left with no matches, heading
 * and all. After a keyboard undo, focus waits for the request to settle, then
 * lands on that guest's restored check-in button, or on the search box or
 * the heading when there is none (a failed undo, say). Focus only ever moves
 * while it is still on the list or has fallen to the page body, so a host who
 * has tabbed on to the search box keeps their place. Pointer use is left
 * alone.
 */
export function useCheckinFocus({
  pendingSlugs,
  onCheckIn,
  onUndo,
}: {
  pendingSlugs: ReadonlySet<string>;
  onCheckIn: (memberSlug: string) => void;
  onUndo: (memberSlug: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const expectedSectionRef = useRef<HTMLElement>(null);
  const expectedHeadingRef = useRef<HTMLHeadingElement>(null);
  const pendingUndoFocusRef = useRef<PendingUndoFocus | null>(null);

  /** Focus may move only while it is on the list or has fallen to the body. */
  const canMoveFocus = (): boolean => {
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) return true;
    return containerRef.current?.contains(activeElement) ?? false;
  };

  useEffect(() => {
    const pendingUndoFocus = pendingUndoFocusRef.current;
    if (!pendingUndoFocus) return;
    if (pendingSlugs.has(pendingUndoFocus.slug)) {
      pendingUndoFocus.hasBeenPending = true;
      return;
    }
    if (!pendingUndoFocus.hasBeenPending) return;
    pendingUndoFocusRef.current = null;
    if (!canMoveFocus()) return;
    const restoredButton = checkInButtons(containerRef.current).find(
      (button) =>
        button.getAttribute(CHECK_IN_SLUG_ATTRIBUTE) ===
          pendingUndoFocus.slug && !button.disabled,
    );
    (
      restoredButton ??
      findSearchField() ??
      expectedHeadingRef.current
    )?.focus();
  });

  const handleCheckIn = (slug: string) => {
    if (isKeyboardFocused(CHECK_IN_SLUG_ATTRIBUTE, slug) && canMoveFocus()) {
      const section = expectedSectionRef.current;
      const buttons = checkInButtons(section);
      const currentIndex = buttons.findIndex(
        (button) => button.getAttribute(CHECK_IN_SLUG_ATTRIBUTE) === slug,
      );
      const nextButton = buttons
        .slice(currentIndex + 1)
        .find((button) => !button.disabled);
      const loadMoreButton =
        section?.querySelector<HTMLButtonElement>("[data-load-more] button") ??
        null;
      (
        nextButton ??
        loadMoreButton ??
        findSearchField() ??
        expectedHeadingRef.current
      )?.focus();
    }
    onCheckIn(slug);
  };

  const handleUndo = (slug: string) => {
    pendingUndoFocusRef.current = isKeyboardFocused(UNDO_SLUG_ATTRIBUTE, slug)
      ? { slug, hasBeenPending: pendingSlugs.has(slug) }
      : null;
    onUndo(slug);
  };

  return {
    containerRef,
    expectedSectionRef,
    expectedHeadingRef,
    handleCheckIn,
    handleUndo,
  };
}
