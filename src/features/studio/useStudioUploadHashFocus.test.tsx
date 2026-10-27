import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DEMO_DEFAULT_RELEASE_ID } from "./api/studioDemoMe.data";
import { StudioUploadPage } from "./StudioUploadPage";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";
import {
  HASH_FOCUS_SETTLE_MS,
  HASH_FOCUS_WAIT_MS,
  useStudioUploadHashFocus,
} from "./useStudioUploadHashFocus";

/** Renders the genre field disabled until "Enable genre" is pressed, so it
 *  is on the page and cannot take focus. */
function DisabledFieldHarness() {
  useStudioUploadHashFocus();
  const [isEnabled, setIsEnabled] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsEnabled(true)}>
        Enable genre
      </button>
      <input
        id={RELEASE_FIELD_IDS.genre}
        aria-label="Genre"
        disabled={!isEnabled}
      />
    </>
  );
}

/** Calls the hook and renders its fields only after a press, standing in
 *  for a step that renders late. Every press renders again. */
function Harness({ isRendered = false }: { isRendered?: boolean }) {
  useStudioUploadHashFocus();
  const [pressCount, setPressCount] = useState(0);
  const isShowingFields = isRendered || pressCount > 0;
  return (
    <>
      <button type="button" onClick={() => setPressCount(pressCount + 1)}>
        Render fields
      </button>
      {isShowingFields && (
        <>
          <input id={RELEASE_FIELD_IDS.title} aria-label="Title" />
          <textarea
            id={RELEASE_FIELD_IDS.description}
            aria-label="Description"
          />
          <button type="button" id={RELEASE_FIELD_IDS.genre}>
            Genre
          </button>
          <a id="comments" href="#comments">
            Comments
          </a>
        </>
      )}
    </>
  );
}

describe("useStudioUploadHashFocus", () => {
  it("focuses the named field once it renders", async () => {
    render(
      <MemoryRouter
        initialEntries={["/studio/upload?release=r1#studio-release-genre"]}
      >
        <Harness />
      </MemoryRouter>,
    );
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(screen.getByRole("button", { name: "Render fields" }));
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute(
        "id",
        "studio-release-genre",
      ),
    );
  });

  it("ignores a hash that names no release field", async () => {
    render(
      <MemoryRouter initialEntries={["/studio/upload?release=r1#comments"]}>
        <Harness />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Render fields" }));
    const comments = screen.getByRole("link", { name: "Comments" });
    expect(comments).toHaveAttribute("id", "comments");
    // A second render gives the hook every chance to act on the hash.
    fireEvent.click(screen.getByRole("button", { name: "Render fields" }));
    await waitFor(() => expect(document.activeElement).toBe(document.body));
    expect(comments).not.toHaveFocus();
  });

  it("drops the pending focus once the member presses something first", async () => {
    render(
      <MemoryRouter
        initialEntries={["/studio/upload?release=r1#studio-release-genre"]}
      >
        <Harness />
      </MemoryRouter>,
    );
    const renderButton = screen.getByRole("button", { name: "Render fields" });
    fireEvent.pointerDown(document.body);
    fireEvent.click(renderButton);
    const genre = screen.getByRole("button", { name: "Genre" });
    // A second render gives the hook every chance to focus the field.
    fireEvent.click(renderButton);
    await waitFor(() => expect(document.activeElement).toBe(document.body));
    expect(genre).not.toHaveFocus();
  });

  describe("a field that cannot take focus", () => {
    // jsdom has no scrollIntoView, so the spy is installed by hand and the
    // prototype is put back as it was.
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "scrollIntoView",
    );
    const scrollIntoView = vi.fn();
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
      scrollIntoView.mockClear();
      Object.defineProperty(Element.prototype, "scrollIntoView", {
        configurable: true,
        writable: true,
        value: scrollIntoView,
      });
    });
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
      if (originalDescriptor)
        Object.defineProperty(
          Element.prototype,
          "scrollIntoView",
          originalDescriptor,
        );
      else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
    });

    it("is never focused or scrolled to, and stops waiting after the deadline", () => {
      const requestFrame = vi.spyOn(window, "requestAnimationFrame");
      render(
        <MemoryRouter
          initialEntries={["/studio/upload?release=r1#studio-release-genre"]}
        >
          <DisabledFieldHarness />
        </MemoryRouter>,
      );
      const genre = screen.getByRole("textbox", { name: "Genre" });
      expect(genre).toBeDisabled();
      expect(genre).not.toHaveFocus();
      // A failed attempt schedules no scroll at all.
      expect(requestFrame).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(HASH_FOCUS_WAIT_MS + 1000);
      });
      expect(scrollIntoView).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Enable genre" }));
      expect(genre).toBeEnabled();
      expect(genre).not.toHaveFocus();
      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });

  it("focuses only once, so later renders leave focus where the member put it", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/studio/upload?release=r1#studio-release-description",
        ]}
      >
        <Harness isRendered />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute(
        "id",
        "studio-release-description",
      ),
    );
    screen.getByRole("button", { name: "Render fields" }).focus();
    fireEvent.click(screen.getByRole("button", { name: "Render fields" }));
    expect(document.activeElement).toHaveAccessibleName("Render fields");
  });
});

describe("useStudioUploadHashFocus landing scroll", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "scrollIntoView",
  );
  const scrollIntoView = vi.fn();
  const instantCentre = { block: "center", behavior: "instant" };
  const offScreenBox = {
    x: 0,
    y: 2000,
    top: 2000,
    bottom: 2080,
    left: 0,
    right: 300,
    width: 300,
    height: 80,
    toJSON: () => ({}),
  } as DOMRect;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    scrollIntoView.mockClear();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: scrollIntoView,
    });
    // The frame focusFieldById waits for runs at once, so its scroll is
    // visible to the assertions straight after render.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (originalDescriptor)
      Object.defineProperty(
        Element.prototype,
        "scrollIntoView",
        originalDescriptor,
      );
    else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  });

  function renderLandingOnDescription() {
    return render(
      <MemoryRouter
        initialEntries={[
          "/studio/upload?release=r1#studio-release-description",
        ]}
      >
        <Harness isRendered />
      </MemoryRouter>,
    );
  }

  function placeEveryBoxOffScreen() {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(
      offScreenBox,
    );
  }

  it("lands with an instant scroll, so a height animation measuring the page cannot cancel it", () => {
    renderLandingOnDescription();
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith(instantCentre);
  });

  it("scrolls the field back into view once the page settles with it off screen", () => {
    placeEveryBoxOffScreen();
    renderLandingOnDescription();
    act(() => {
      vi.advanceTimersByTime(HASH_FOCUS_SETTLE_MS - 1);
    });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(scrollIntoView).toHaveBeenLastCalledWith(instantCentre);
    // The check runs once: later time passing scrolls nothing more.
    act(() => {
      vi.advanceTimersByTime(HASH_FOCUS_WAIT_MS);
    });
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("keeps the settle check on its first schedule when the page renders again", () => {
    placeEveryBoxOffScreen();
    renderLandingOnDescription();
    act(() => {
      vi.advanceTimersByTime(HASH_FOCUS_SETTLE_MS / 2);
    });
    fireEvent.click(screen.getByRole("button", { name: "Render fields" }));
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveFocus();
    act(() => {
      vi.advanceTimersByTime(HASH_FOCUS_SETTLE_MS / 2);
    });
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("leaves a field the page settled on screen where it is", () => {
    renderLandingOnDescription();
    act(() => {
      vi.advanceTimersByTime(HASH_FOCUS_SETTLE_MS);
    });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("never scrolls back to the field once focus moved elsewhere", () => {
    placeEveryBoxOffScreen();
    renderLandingOnDescription();
    act(() => {
      screen.getByRole("button", { name: "Render fields" }).focus();
    });
    act(() => {
      vi.advanceTimersByTime(HASH_FOCUS_SETTLE_MS);
    });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["presses the page", () => fireEvent.pointerDown(document.body)],
    ["presses a key", () => fireEvent.keyDown(document.body, { key: "a" })],
  ])("never scrolls back once the member %s", (_label, pressSomething) => {
    placeEveryBoxOffScreen();
    renderLandingOnDescription();
    pressSomething();
    act(() => {
      vi.advanceTimersByTime(HASH_FOCUS_SETTLE_MS);
    });
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("never scrolls back after the page unmounts", () => {
    placeEveryBoxOffScreen();
    const { unmount } = renderLandingOnDescription();
    unmount();
    act(() => {
      vi.advanceTimersByTime(HASH_FOCUS_SETTLE_MS);
    });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });
});

describe("release editor deep links on the upload page", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lands on the tracks heading for #studio-release-tracks", async () => {
    render(
      <TestProviders
        initialEntries={[
          `/studio/upload?release=${DEMO_DEFAULT_RELEASE_ID}&step=tracks#studio-release-tracks`,
        ]}
      >
        <StudioUploadPage />
      </TestProviders>,
    );
    await waitFor(
      () =>
        expect(document.activeElement).toHaveAttribute(
          "id",
          RELEASE_FIELD_IDS.tracks,
        ),
      { timeout: 4000 },
    );
  });

  it("opens the first track's details and lands on its credits for #studio-release-track-credits", async () => {
    render(
      <TestProviders
        initialEntries={[
          `/studio/upload?release=${DEMO_DEFAULT_RELEASE_ID}&step=tracks#studio-release-track-credits`,
        ]}
      >
        <StudioUploadPage />
      </TestProviders>,
    );
    const editButtons = await screen.findAllByRole(
      "button",
      { name: /edit details for/i },
      { timeout: 4000 },
    );
    expect(editButtons[0]).toHaveAttribute("aria-expanded", "true");
    for (const laterButton of editButtons.slice(1))
      expect(laterButton).toHaveAttribute("aria-expanded", "false");
    await waitFor(
      () =>
        expect(document.activeElement).toHaveAttribute(
          "id",
          RELEASE_FIELD_IDS.trackCredits,
        ),
      { timeout: 4000 },
    );
    expect(
      document.querySelectorAll(`#${RELEASE_FIELD_IDS.trackCredits}`),
    ).toHaveLength(1);
  });
});
