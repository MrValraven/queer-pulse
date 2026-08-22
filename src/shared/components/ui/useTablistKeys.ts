import { useRef, type KeyboardEvent } from "react";

/**
 * The APG tablist keyboard contract, for a tab strip that cannot use the
 * shared `<Tabs>` component.
 *
 * `<Tabs>` is the right answer whenever the strip is a plain list of labels.
 * Several strips are not: a stepper whose tabs carry a number and a state, a
 * bottom tab bar whose tabs are router links, a deck control with a live
 * preview inside each tab. Those hand-roll their markup, and every one of them
 * shipped without arrow-key support, so a keyboard user could reach the strip
 * but not move along it.
 *
 * Automatic activation (moving focus also selects) matches `<Tabs>` and is the
 * APG default for tab strips whose panels are cheap to render.
 *
 * Usage:
 *
 *   const { tabProps } = useTablistKeys(ids.length, (index) => select(ids[index]));
 *   ...
 *   <div role="tablist">
 *     {ids.map((id, index) => (
 *       <button key={id} role="tab" aria-selected={id === active}
 *               {...tabProps(index, id === active)}>…</button>
 *     ))}
 *   </div>
 *
 * `tabProps` supplies the roving `tabIndex` too: only the selected tab is in
 * the Tab order, so Tab enters and leaves the strip in one press.
 */
export function useTablistKeys(
  tabCount: number,
  onSelectIndex: (index: number) => void,
  /**
   * Optional: which tabs can be moved to. A stepper disables steps the member
   * has not reached yet, and arrowing onto a disabled button would move focus
   * somewhere that cannot be activated. Wrapping skips over them.
   */
  isEnabled?: (index: number) => boolean,
) {
  const tabRefs = useRef<(HTMLElement | null)[]>([]);

  function moveTo(index: number, direction: 1 | -1 = 1) {
    if (tabCount === 0) return;
    let nextIndex = (index + tabCount) % tabCount;
    if (isEnabled) {
      // Walk at most one full lap, so an all-disabled strip cannot loop.
      let steps = 0;
      while (!isEnabled(nextIndex) && steps < tabCount) {
        nextIndex = (nextIndex + direction + tabCount) % tabCount;
        steps += 1;
      }
      if (!isEnabled(nextIndex)) return;
    }
    onSelectIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveTo(index + 1, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveTo(index - 1, -1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        // Walk backwards from the end, so a disabled last tab lands on the
        // last ENABLED one rather than wrapping around to the front.
        moveTo(tabCount - 1, -1);
        break;
    }
  }

  function tabProps(index: number, isSelected: boolean) {
    return {
      ref: (element: HTMLElement | null) => {
        tabRefs.current[index] = element;
      },
      tabIndex: isSelected ? 0 : -1,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) =>
        handleKeyDown(event, index),
    };
  }

  return { tabProps, handleKeyDown, tabRefs };
}
