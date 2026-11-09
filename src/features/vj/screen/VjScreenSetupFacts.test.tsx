import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import type { VjScreenHealth } from "../../../shared/contracts/vj";
import {
  VjScreenSetupFacts,
  type VjScreenSetupFactsProps,
} from "./VjScreenSetupFacts";

const translate = vi.fn(
  (key: string, options?: Record<string, unknown>): string =>
    options === undefined
      ? key
      : `${key} ${Object.entries(options)
          .map(([name, value]) => `${name}=${String(value)}`)
          .join(" ")}`,
);

vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ language: "en", t: translate }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>;
}

function healthWith(patch: Partial<VjScreenHealth>): VjScreenHealth {
  return {
    renderer: "webgl2",
    fps: 59.6,
    droppedFrames: 0,
    cacheBytes: 0,
    isEffectLoadHigh: false,
    ...patch,
  };
}

const baseRenderer: VjScreenSetupFactsProps["renderer"] = {
  phase: "webgl2",
  reason: null,
  lossCount: 0,
  retiredReason: null,
  handOffFrom: null,
};

function renderFacts(patch: Partial<VjScreenSetupFactsProps> = {}) {
  const props: VjScreenSetupFactsProps = {
    renderer: baseRenderer,
    health: null,
    eventCard: { isUnlinked: false, unavailableReason: null, card: null },
    ...patch,
  };
  return render(<VjScreenSetupFacts {...props} />, { wrapper: Wrapper });
}

describe("VjScreenSetupFacts", () => {
  it("passes the dropped frames as the plural count of the health line", () => {
    renderFacts({ health: healthWith({ droppedFrames: 1 }) });
    expect(translate).toHaveBeenCalledWith("vj:screen.health.line", {
      fps: 60,
      count: 1,
    });
    expect(
      screen.getByText("vj:screen.health.line fps=60 count=1"),
    ).toBeInTheDocument();
  });

  it("names the linked event the card will show", () => {
    renderFacts({
      eventCard: {
        isUnlinked: false,
        unavailableReason: null,
        card: { title: "Queer Supper Club" },
      },
    });
    expect(
      screen.getByText("vj:screen.eventCard.linked title=Queer Supper Club"),
    ).toBeInTheDocument();
  });

  it("says why the card stays hidden over naming a linked event", () => {
    renderFacts({
      eventCard: {
        isUnlinked: false,
        unavailableReason: "cancelled",
        card: { title: "Queer Supper Club" },
      },
    });
    expect(
      screen.getByText("vj:screen.eventCard.unavailable.cancelled"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/vj:screen\.eventCard\.linked/),
    ).not.toBeInTheDocument();
  });

  it("names the simple renderer chosen from the remote", () => {
    renderFacts({ renderer: { ...baseRenderer, phase: "simple" } });
    // The translation mock renders each key as its text.
    expect(screen.getByText("vj:screen.renderer.simple")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows no event line while the pack's event is unknown", () => {
    const { container } = renderFacts();
    expect(
      container.querySelector('[data-vj-setup-fact="eventCard"]'),
    ).toBeNull();
  });
});
