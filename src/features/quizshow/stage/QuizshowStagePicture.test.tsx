import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuizshowStagePicture } from "./QuizshowStagePicture";

const WINDOW = { startsAt: 0, endsAt: 10_000, isCleared: false };
const NEARLY_CLEAR_AT_MS = 9_500;

function pictureElement(
  frozenProgress: number | null,
  slowReveal: typeof WINDOW | null = WINDOW,
) {
  return (
    <QuizshowStagePicture
      mediaUrl="/uploads/picture.png"
      alt={{ en: "", pt: "" }}
      language="en"
      slowReveal={slowReveal}
      clockOffsetMs={0}
      frozenProgress={frozenProgress}
    />
  );
}

describe("QuizshowStagePicture slow reveal while paused", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        "Date",
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ],
      now: NEARLY_CLEAR_AT_MS,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete document.documentElement.dataset.reduceMotion;
  });

  it("holds the blur at the frozen progress while the clock moves on", () => {
    const view = render(pictureElement(null));
    const image = view.container.querySelector("img");
    expect(image?.style.filter).toBe("blur(1.40px)");
    view.rerender(pictureElement(0.5));
    expect(image?.style.filter).toBe("blur(14.00px)");
    expect(image?.style.willChange).toBe("auto");
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(image?.style.filter).toBe("blur(14.00px)");
  });

  it("carries on from the window once the session resumes", () => {
    const view = render(pictureElement(0.5));
    view.rerender(pictureElement(null));
    const image = view.container.querySelector("img");
    expect(image?.style.filter).toBe("blur(1.40px)");
  });

  it("holds the same step under reduced motion", () => {
    document.documentElement.dataset.reduceMotion = "true";
    const view = render(pictureElement(0.5));
    const opacities = Array.from(view.container.querySelectorAll("img")).map(
      (layer) => layer.style.opacity,
    );
    expect(opacities).toEqual(["1", "1", "0", "0"]);
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    const laterOpacities = Array.from(
      view.container.querySelectorAll("img"),
    ).map((layer) => layer.style.opacity);
    expect(laterOpacities).toEqual(["1", "1", "0", "0"]);
  });
});
