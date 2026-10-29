import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { studio } from "../../../shared/i18n/catalogs/en/studio";
import { TestProviders } from "../../../test/TestProviders";
import { STUDIO_LANDING_SCREENS } from "./studioLanding.data";
import { StudioLandingStory } from "./StudioLandingStory";

interface ObserverRecord {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  targets: Element[];
  observer: IntersectionObserver;
}

const observerRecords: ObserverRecord[] = [];

/** Records every observer, so a test can fire one step's callback by hand. */
class RecordingIntersectionObserver {
  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[] = [];
  private readonly record: ObserverRecord;

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.rootMargin = options?.rootMargin ?? "";
    this.record = {
      callback,
      options,
      targets: [],
      observer: this as unknown as IntersectionObserver,
    };
    observerRecords.push(this.record);
  }

  observe(target: Element) {
    this.record.targets.push(target);
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/** Makes the landing's phone query match, as on a 390px screen. */
function stubPhoneViewport() {
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: query === "(max-width: 719px)",
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

const captionOf = (captionKey: string): string =>
  studio[captionKey.replace("studio:", "")] ?? "";

async function renderStory() {
  render(
    <TestProviders>
      <StudioLandingStory />
    </TestProviders>,
  );
  const heading = await screen.findByRole("heading", {
    level: 2,
    name: /screen by screen/i,
  });
  return heading.closest("section") as HTMLElement;
}

function enterStep(stepElement: Element) {
  const record = observerRecords.find(
    (candidate) =>
      candidate.options?.rootMargin === "-45% 0px -45% 0px" &&
      candidate.targets.includes(stepElement),
  );
  expect(record).toBeDefined();
  const entry = {
    isIntersecting: true,
    target: stepElement,
  } as unknown as IntersectionObserverEntry;
  act(() => {
    record?.callback([entry], record.observer);
  });
}

function lightSources(root: Element): string[] {
  return [...root.querySelectorAll('img[data-shot-theme="light"]')].map(
    (image) => image.getAttribute("src") ?? "",
  );
}

describe("StudioLandingStory", () => {
  beforeEach(() => {
    observerRecords.length = 0;
    vi.stubGlobal("IntersectionObserver", RecordingIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("tells six steps, each an h3 with its title and caption", async () => {
    const section = await renderStory();
    const stepHeadings = within(section).getAllByRole("heading", { level: 3 });
    expect(stepHeadings).toHaveLength(6);
    expect(stepHeadings.map((heading) => heading.textContent)).toEqual([
      "Home",
      "Artist page",
      "Release",
      "Playlists together",
      "Player",
      "Share",
    ]);
    STUDIO_LANDING_SCREENS.forEach((storyScreen, index) => {
      const step = stepHeadings[index]?.closest("li") as HTMLElement;
      const caption = captionOf(storyScreen.captionKey);
      expect(caption.length).toBeGreaterThan(0);
      expect(within(step).getByText(caption)).toBeTruthy();
    });
  });

  it("the heading is focusable for the See inside link", async () => {
    const section = await renderStory();
    expect(section.id).toBe("studio-how-it-works");
    const heading = section.querySelector("#studio-how-it-works-heading");
    expect(heading).not.toBeNull();
    expect(heading).toHaveAttribute("tabindex", "-1");
  });

  it("on phones every step carries its own phone shot", async () => {
    stubPhoneViewport();
    const section = await renderStory();
    expect(section.querySelector('[data-device="laptop"]')).toBeNull();
    expect(section.querySelectorAll('[data-device="phone"]')).toHaveLength(6);
    expect(section.querySelectorAll("img")).toHaveLength(12);
    const steps = section.querySelectorAll("li");
    expect(steps).toHaveLength(6);
    steps.forEach((step, index) => {
      const phoneShot = STUDIO_LANDING_SCREENS[index]?.phoneShot;
      expect(lightSources(step)).toEqual([
        `/studio-landing/${phoneShot?.fileBase}-light.webp`,
      ]);
    });
  });

  it("on desktop one sticky frame shows the active step's shot", async () => {
    const section = await renderStory();
    const steps = [...section.querySelectorAll("li")];
    steps.forEach((step) => {
      expect(step.querySelector("img")).toBeNull();
    });
    expect(section.querySelectorAll('[data-device="laptop"]')).toHaveLength(1);
    expect(lightSources(section)).toEqual([
      "/studio-landing/home-desktop-light.webp",
    ]);
    expect(steps[0]).toHaveAttribute("data-active", "true");

    const releaseStep = steps[2] as HTMLElement;
    enterStep(releaseStep);

    expect(releaseStep).toHaveAttribute("data-active", "true");
    expect(steps[0]).toHaveAttribute("data-active", "false");
    // The outgoing shot may still be fading out, so look at every image.
    expect(lightSources(section)).toContain(
      "/studio-landing/release-desktop-light.webp",
    );
  });

  it("switches the frame to a phone for the phone-only screens", async () => {
    const section = await renderStory();
    const playerStep = section.querySelectorAll("li")[4] as HTMLElement;
    enterStep(playerStep);
    expect(section.querySelector('[data-device="phone"]')).not.toBeNull();
    expect(lightSources(section)).toContain(
      "/studio-landing/player-phone-light.webp",
    );
  });

  it("keeps the sample note and has no tablist", async () => {
    const section = await renderStory();
    expect(
      within(section).getByText(
        "These screens show sample artists and sample members.",
      ),
    ).toBeTruthy();
    expect(within(section).queryByRole("tablist")).toBeNull();
    expect(within(section).queryByRole("tab")).toBeNull();
  });
});
