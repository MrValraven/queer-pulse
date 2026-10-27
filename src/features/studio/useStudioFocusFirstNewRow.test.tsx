import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { ReducedMotionContext } from "../../app/providers/motionPrefs";
import { STUDIO_FADE } from "./studioMotion";
import { useStudioFocusFirstNewRow } from "./useStudioFocusFirstNewRow";

const ROW_REVEAL_MS = STUDIO_FADE.duration * 1000;

interface HarnessProps {
  rowCount: number;
  hasMore: boolean;
  isSettled?: boolean;
  shouldFocusEveryPage?: boolean;
}

/** A list of play buttons with a Show more button under it. */
function Harness({
  rowCount,
  hasMore,
  isSettled = true,
  shouldFocusEveryPage,
}: HarnessProps) {
  const { listRef, footerRef, markPageRequested } = useStudioFocusFirstNewRow({
    rowCount,
    hasMore,
    isSettled,
    focusSelector: "button",
    shouldFocusEveryPage,
  });
  return (
    <>
      <ul ref={listRef}>
        {Array.from({ length: rowCount }, (_, index) => (
          <li key={index}>
            <button type="button">Play row {index + 1}</button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div ref={footerRef}>
          <button type="button" onClick={markPageRequested}>
            Show more
          </button>
        </div>
      )}
    </>
  );
}

function renderHarness(props: HarnessProps, isReducedMotion = false) {
  const tree = (nextProps: HarnessProps) => (
    <ReducedMotionContext.Provider value={isReducedMotion}>
      <Harness {...nextProps} />
    </ReducedMotionContext.Provider>
  );
  const result = render(tree(props));
  return {
    rerenderWith: (nextProps: HarnessProps) => result.rerender(tree(nextProps)),
  };
}

/** Focuses Show more and presses it, the way a keyboard member would. */
function pressShowMore() {
  const showMore = screen.getByRole("button", { name: "Show more" });
  showMore.focus();
  fireEvent.click(showMore);
}

let scrollIntoViewSpy: MockInstance<Element["scrollIntoView"]>;

beforeEach(() => {
  vi.useFakeTimers();
  scrollIntoViewSpy = vi
    .spyOn(Element.prototype, "scrollIntoView")
    .mockImplementation(() => undefined);
});

afterEach(() => {
  scrollIntoViewSpy.mockRestore();
  vi.useRealTimers();
});

describe("useStudioFocusFirstNewRow", () => {
  it("moves focus to the first new row on a page that keeps Show more", () => {
    const { rerenderWith } = renderHarness({
      rowCount: 2,
      hasMore: true,
      shouldFocusEveryPage: true,
    });
    pressShowMore();
    rerenderWith({ rowCount: 4, hasMore: true, shouldFocusEveryPage: true });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Play row 3" }),
    );
  });

  it("scrolls the new row into view once its fade has run", () => {
    const { rerenderWith } = renderHarness({
      rowCount: 2,
      hasMore: true,
      shouldFocusEveryPage: true,
    });
    pressShowMore();
    rerenderWith({ rowCount: 4, hasMore: true, shouldFocusEveryPage: true });
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(ROW_REVEAL_MS);
    });
    expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: "nearest" });
    expect(scrollIntoViewSpy.mock.contexts[0]).toBe(
      screen.getByRole("button", { name: "Play row 3" }).closest("li"),
    );
  });

  it("scrolls at once under reduced motion", () => {
    const { rerenderWith } = renderHarness(
      { rowCount: 2, hasMore: true, shouldFocusEveryPage: true },
      true,
    );
    pressShowMore();
    rerenderWith({ rowCount: 4, hasMore: true, shouldFocusEveryPage: true });
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("moves focus on the last page when Show more folds away", () => {
    const { rerenderWith } = renderHarness({ rowCount: 2, hasMore: true });
    pressShowMore();
    rerenderWith({ rowCount: 3, hasMore: false });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Play row 3" }),
    );
  });

  it("leaves focus on Show more between pages by default", () => {
    const { rerenderWith } = renderHarness({ rowCount: 2, hasMore: true });
    pressShowMore();
    rerenderWith({ rowCount: 4, hasMore: true });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Show more" }),
    );
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
  });

  it("waits while the page is still loading", () => {
    const { rerenderWith } = renderHarness({
      rowCount: 2,
      hasMore: true,
      shouldFocusEveryPage: true,
    });
    pressShowMore();
    rerenderWith({
      rowCount: 2,
      hasMore: true,
      isSettled: false,
      shouldFocusEveryPage: true,
    });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Show more" }),
    );
  });

  it("keeps focus the member moved elsewhere while the page loaded", () => {
    const { rerenderWith } = renderHarness({
      rowCount: 2,
      hasMore: true,
      shouldFocusEveryPage: true,
    });
    pressShowMore();
    const firstRowButton = screen.getByRole("button", { name: "Play row 1" });
    firstRowButton.focus();
    rerenderWith({ rowCount: 4, hasMore: true, shouldFocusEveryPage: true });
    expect(document.activeElement).toBe(firstRowButton);
  });
});
