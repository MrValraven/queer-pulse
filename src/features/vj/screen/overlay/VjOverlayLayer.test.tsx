import type { ReactNode } from "react";
import { act, render } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  VJ_OVERLAY_STYLES,
  type VjEventCardDTO,
  type VjOverlay,
} from "../../../../shared/contracts/vj";
import type { VjClockReader } from "../../engine/vjEngineLook";
import { VjOverlayLayer, type VjOverlayLayerProps } from "./VjOverlayLayer";
import { VjScreenIdentify } from "./VjScreenIdentify";

vi.mock("../../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    t: (key: string, options?: Record<string, unknown>) =>
      options === undefined
        ? key
        : `${key} ${Object.values(options).map(String).join(" ")}`,
  }),
}));

vi.mock("../../../../shared/components/ui/QrCode", () => ({
  QrCode: ({ url, ariaLabel }: { url: string; ariaLabel: string }) => (
    <svg data-testid="vj-qr" data-qr-url={url} aria-label={ariaLabel} />
  ),
}));

const BASE_STATE = createVjStageState("epoch-test", 0);

/** The synced clock reads the faked Date; a server time maps to a local time the same distance away. */
const TEST_CLOCK: VjClockReader = {
  serverNow: () => Date.now(),
  toLocalTime: (serverMs) => performance.now() + (serverMs - Date.now()),
};

const EVENT_CARD: VjEventCardDTO = {
  eventId: "event-1",
  title: "Sapphic Saturday",
  startAt: "2026-11-07T21:30:00.000Z",
  endAt: null,
  timezone: "Europe/Lisbon",
  area: "Intendente",
  isOnline: false,
  publicUrl: "https://queerpulse.example/events/sapphic-saturday",
};

function overlayWith(changes: Partial<VjOverlay>): VjOverlay {
  return {
    ...BASE_STATE.overlay,
    text: "Doors close at 4",
    isVisible: true,
    ...changes,
  };
}

function withMotion(children: ReactNode): ReactNode {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}

function renderLayer(changes: Partial<VjOverlayLayerProps> = {}) {
  const props: VjOverlayLayerProps = {
    overlay: BASE_STATE.overlay,
    countdown: BASE_STATE.countdown,
    logo: BASE_STATE.logo,
    eventCard: BASE_STATE.eventCard,
    eventCardData: null,
    clock: TEST_CLOCK,
    size: "screen",
    ...changes,
  };
  const view = render(withMotion(<VjOverlayLayer {...props} />));
  const rerenderLayer = (next: Partial<VjOverlayLayerProps>): void => {
    Object.assign(props, next);
    view.rerender(withMotion(<VjOverlayLayer {...props} />));
  };
  return { ...view, rerenderLayer };
}

function elementOf(container: HTMLElement, selector: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`nothing matches ${selector}`);
  return element;
}

function lineState(container: HTMLElement): string | null {
  return elementOf(container, "[data-vj-overlay-line]").getAttribute(
    "data-vj-overlay-line",
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("VjOverlayLayer", () => {
  it("places the line at the top, centre or bottom", () => {
    for (const position of ["top", "center", "bottom"] as const) {
      // A fresh mount per case: a changed line waits for the old one to fade.
      const view = renderLayer({
        overlay: overlayWith({ position, text: `Line at ${position}` }),
      });
      const line = elementOf(view.container, "[data-vj-overlay-style]");
      expect(line).toHaveAttribute("data-vj-overlay-position", position);
      expect(line).toHaveTextContent(`Line at ${position}`);
      view.unmount();
    }
  });

  it("applies each of the eight styles", () => {
    for (const style of VJ_OVERLAY_STYLES) {
      const text = `Line in ${style}`;
      const view = renderLayer({
        overlay: overlayWith({ style, text, colorToken: "jade" }),
      });
      const line = elementOf(
        view.container,
        `[data-vj-overlay-style="${style}"]`,
      );
      expect(line).toHaveTextContent(text);
      expect(line.style.getPropertyValue("--vj-overlay-color")).toBe(
        "rgb(var(--vj-palette-jade))",
      );
      view.unmount();
    }
  });

  it("hides the line once the synced clock passes hideAt", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const { container } = renderLayer({
      overlay: overlayWith({ hideAt: Date.now() + 5000 }),
    });
    expect(lineState(container)).toBe("shown");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4900);
    });
    expect(lineState(container)).toBe("shown");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(lineState(container)).toBe("hidden");
  });

  it("keeps a line with hideAt null on screen", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const { container } = renderLayer({
      overlay: overlayWith({ hideAt: null }),
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600_000);
    });
    expect(lineState(container)).toBe("shown");
    expect(container).toHaveTextContent("Doors close at 4");
  });

  it("counts down from the synced clock and holds 0:00 after targetAt", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const { container } = renderLayer({
      countdown: {
        isVisible: true,
        targetAt: Date.now() + 65_000,
        label: "Doors close in",
      },
    });
    const digits = () =>
      elementOf(container, "[data-vj-countdown-digits]").textContent;
    expect(digits()).toBe("1:05");
    expect(container).toHaveTextContent("Doors close in");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(digits()).toBe("1:04");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(64_000);
    });
    expect(digits()).toBe("0:00");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(digits()).toBe("0:00");
  });

  it("shows the logo in the chosen corner", () => {
    const { container, rerenderLayer } = renderLayer({
      logo: { isVisible: true, corner: "topLeft" },
    });
    expect(
      container.querySelector('[data-vj-logo-corner="topLeft"]'),
    ).not.toBeNull();
    rerenderLayer({ logo: { isVisible: true, corner: "bottomRight" } });
    expect(
      container.querySelector('[data-vj-logo-corner="bottomRight"]'),
    ).not.toBeNull();
  });

  it("shows a QR for the event's public URL", () => {
    const { container } = renderLayer({
      eventCard: { isVisible: true, kind: "qr" },
      eventCardData: EVENT_CARD,
    });
    const card = elementOf(container, '[data-vj-event-card="qr"]');
    const qr = elementOf(card, "[data-testid='vj-qr']");
    expect(qr).toHaveAttribute("data-qr-url", EVENT_CARD.publicUrl);
    expect(qr).toHaveAttribute(
      "aria-label",
      "vj:screen.eventCard.qrLabel Sapphic Saturday",
    );
    expect(card).toHaveTextContent("Sapphic Saturday");
    expect(card).toHaveTextContent("vj:screen.eventCard.scan");
  });

  it("shows the next event's title, date and place", () => {
    const { container, rerenderLayer } = renderLayer({
      eventCard: { isVisible: true, kind: "nextEvent" },
      eventCardData: EVENT_CARD,
    });
    const card = elementOf(container, '[data-vj-event-card="nextEvent"]');
    expect(card).toHaveTextContent("vj:screen.eventCard.nextEvent");
    expect(card).toHaveTextContent("Sapphic Saturday");
    expect(card).toHaveTextContent("Saturday, November 7");
    expect(card).toHaveTextContent("Intendente");
    expect(card.querySelector("[data-testid='vj-qr']")).not.toBeNull();

    rerenderLayer({ eventCardData: { ...EVENT_CARD, isOnline: true } });
    expect(
      elementOf(container, '[data-vj-event-card="nextEvent"]'),
    ).toHaveTextContent("vj:screen.eventCard.online");
  });

  it("drops the QR when the card has no public URL", () => {
    const { container } = renderLayer({
      eventCard: { isVisible: true, kind: "qr" },
      eventCardData: { ...EVENT_CARD, publicUrl: null },
    });
    const card = elementOf(container, '[data-vj-event-card="qr"]');
    expect(card.querySelector("[data-testid='vj-qr']")).toBeNull();
    expect(card).toHaveTextContent("Sapphic Saturday");
  });

  it("renders nothing for the event card without data", () => {
    const { container } = renderLayer({
      eventCard: { isVisible: true, kind: "qr" },
      eventCardData: null,
    });
    expect(container.querySelector("[data-vj-event-card]")).toBeNull();
    expect(container.querySelector("[data-testid='vj-qr']")).toBeNull();
  });

  it("shows the screen number for durationMs on identify", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const view = render(
      withMotion(
        <VjScreenIdentify identify={{ number: 2, durationMs: 3000, key: 1 }} />,
      ),
    );
    const plate = () =>
      elementOf(view.container, "[data-vj-identify]").getAttribute(
        "data-vj-identify",
      );
    expect(plate()).toBe("shown");
    expect(view.container).toHaveTextContent("vj:screen.identifyEyebrow");
    expect(
      elementOf(view.container, "[data-vj-identify-number]"),
    ).toHaveTextContent(/^2$/);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2900);
    });
    expect(plate()).toBe("shown");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(plate()).toBe("hidden");

    view.rerender(
      withMotion(
        <VjScreenIdentify identify={{ number: 2, durationMs: 3000, key: 2 }} />,
      ),
    );
    expect(plate()).toBe("shown");
  });
});

describe("VjOverlayLayer layout", () => {
  it("puts the countdown label above the digits as an eyebrow", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const { container } = renderLayer({
      countdown: {
        isVisible: true,
        targetAt: Date.now() + 58_000,
        label: "Doors close in",
      },
    });
    const label = elementOf(container, "[data-vj-countdown-label]");
    const digits = elementOf(container, "[data-vj-countdown-digits]");
    expect(label).toHaveTextContent("Doors close in");
    expect(
      label.compareDocumentPosition(digits) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps a bottom line clear of the event card's side", () => {
    const view = renderLayer({
      overlay: overlayWith({ position: "bottom" }),
      eventCard: { isVisible: true, kind: "qr" },
      eventCardData: EVENT_CARD,
    });
    const line = elementOf(view.container, "[data-vj-overlay-style]");
    expect(line).toHaveAttribute("data-vj-beside-card", "left");
    expect(line).toHaveAttribute("data-vj-beside-card-kind", "qr");
    view.unmount();

    const besideRightCard = renderLayer({
      overlay: overlayWith({ position: "bottom" }),
      logo: { isVisible: true, corner: "bottomLeft" },
      eventCard: { isVisible: true, kind: "nextEvent" },
      eventCardData: EVENT_CARD,
    });
    const rightLine = elementOf(
      besideRightCard.container,
      "[data-vj-overlay-style]",
    );
    expect(rightLine).toHaveAttribute("data-vj-beside-card", "right");
    expect(rightLine).toHaveAttribute("data-vj-beside-card-kind", "nextEvent");
    expect(rightLine).toHaveAttribute("data-vj-beside-logo", "left");
  });

  it("keeps a bottom line clear of a logo in a bottom corner only", () => {
    const view = renderLayer({
      overlay: overlayWith({ position: "bottom" }),
      logo: { isVisible: true, corner: "bottomRight" },
    });
    expect(
      elementOf(view.container, "[data-vj-overlay-style]"),
    ).toHaveAttribute("data-vj-beside-logo", "right");
    view.unmount();

    const topLogo = renderLayer({
      overlay: overlayWith({ position: "bottom" }),
      logo: { isVisible: true, corner: "topRight" },
    });
    expect(
      elementOf(topLogo.container, "[data-vj-overlay-style]"),
    ).not.toHaveAttribute("data-vj-beside-logo");
  });

  it("leaves a line alone when it does not share the bottom edge with a card", () => {
    for (const changes of [
      {
        overlay: overlayWith({ position: "center" }),
        eventCard: { isVisible: true, kind: "qr" as const },
        eventCardData: EVENT_CARD,
      },
      {
        overlay: overlayWith({ position: "bottom" }),
        eventCard: { isVisible: false, kind: "qr" as const },
        eventCardData: EVENT_CARD,
      },
      {
        overlay: overlayWith({ position: "bottom" }),
        eventCard: { isVisible: true, kind: "qr" as const },
        eventCardData: null,
      },
    ]) {
      const view = renderLayer(changes);
      expect(
        elementOf(view.container, "[data-vj-overlay-style]"),
      ).not.toHaveAttribute("data-vj-beside-card");
      view.unmount();
    }
  });

  it("keeps a bottom countdown clear of the event card's side", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    const countdown = {
      isVisible: true,
      targetAt: Date.now() + 58_000,
      label: "Doors close in",
    };
    const view = renderLayer({
      overlay: overlayWith({ position: "top" }),
      countdown,
      eventCard: { isVisible: true, kind: "qr" },
      eventCardData: EVENT_CARD,
    });
    const frame = elementOf(view.container, "[data-vj-countdown]");
    expect(frame).toHaveAttribute("data-vj-countdown", "bottom");
    expect(frame).toHaveAttribute("data-vj-beside-card", "left");
    expect(frame).toHaveAttribute("data-vj-beside-card-kind", "qr");
    view.unmount();

    const besideRightCard = renderLayer({
      overlay: overlayWith({ position: "top" }),
      countdown,
      logo: { isVisible: true, corner: "bottomLeft" },
      eventCard: { isVisible: true, kind: "nextEvent" },
      eventCardData: EVENT_CARD,
    });
    const rightFrame = elementOf(
      besideRightCard.container,
      "[data-vj-countdown]",
    );
    expect(rightFrame).toHaveAttribute("data-vj-beside-card", "right");
    expect(rightFrame).toHaveAttribute("data-vj-beside-card-kind", "nextEvent");
    expect(rightFrame).toHaveAttribute("data-vj-beside-logo", "left");
  });

  it("leaves a top countdown alone", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    for (const position of ["center", "bottom"] as const) {
      const view = renderLayer({
        overlay: overlayWith({ position }),
        countdown: {
          isVisible: true,
          targetAt: Date.now() + 58_000,
          label: "Doors close in",
        },
        logo: { isVisible: true, corner: "bottomRight" },
        eventCard: { isVisible: true, kind: "qr" },
        eventCardData: EVENT_CARD,
      });
      const frame = elementOf(view.container, "[data-vj-countdown]");
      expect(frame).toHaveAttribute("data-vj-countdown", "top");
      expect(frame).not.toHaveAttribute("data-vj-beside-card");
      expect(frame).not.toHaveAttribute("data-vj-beside-card-kind");
      expect(frame).not.toHaveAttribute("data-vj-beside-logo");
      view.unmount();
    }
  });
});
