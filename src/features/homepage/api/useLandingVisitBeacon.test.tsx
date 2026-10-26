import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetLandingVisitBeaconForTests,
  useLandingVisitBeacon,
} from "./useLandingVisitBeacon";

let demoMode = false;
let loggedIn = false;
let checking = false;
const sendLandingVisit = vi.fn<(source: string) => Promise<void>>();

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn, checking }),
}));
vi.mock("./landingVisitBeacon", () => ({
  sendLandingVisit: (source: string) => sendLandingVisit(source),
}));

function landingWrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>;
}

function stubWebdriver(isWebdriver: boolean) {
  Object.defineProperty(window.navigator, "webdriver", {
    configurable: true,
    get: () => isWebdriver,
  });
}

beforeEach(() => {
  demoMode = false;
  loggedIn = false;
  checking = false;
  sendLandingVisit.mockReset();
  sendLandingVisit.mockResolvedValue(undefined);
  resetLandingVisitBeaconForTests();
  stubWebdriver(false);
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  Reflect.deleteProperty(window.navigator, "webdriver");
});

describe("useLandingVisitBeacon", () => {
  it("counts a signed-out visitor on the landing page once", () => {
    const { rerender } = renderHook(() => useLandingVisitBeacon(), {
      wrapper: landingWrapper,
    });
    rerender();
    renderHook(() => useLandingVisitBeacon(), { wrapper: landingWrapper });
    expect(sendLandingVisit).toHaveBeenCalledTimes(1);
    expect(sendLandingVisit).toHaveBeenCalledWith("direct");
  });

  it("sends the utm_source of the current URL", () => {
    window.history.replaceState(null, "", "/?utm_source=Newsletter");
    renderHook(() => useLandingVisitBeacon(), { wrapper: landingWrapper });
    expect(sendLandingVisit).toHaveBeenCalledWith("newsletter");
  });

  it("sends nothing in demo mode", () => {
    demoMode = true;
    renderHook(() => useLandingVisitBeacon(), { wrapper: landingWrapper });
    expect(sendLandingVisit).not.toHaveBeenCalled();
  });

  it("waits for the session check, then counts", () => {
    checking = true;
    const { rerender } = renderHook(() => useLandingVisitBeacon(), {
      wrapper: landingWrapper,
    });
    expect(sendLandingVisit).not.toHaveBeenCalled();
    checking = false;
    rerender();
    expect(sendLandingVisit).toHaveBeenCalledTimes(1);
  });

  it("sends nothing for a signed-in member", () => {
    loggedIn = true;
    renderHook(() => useLandingVisitBeacon(), { wrapper: landingWrapper });
    expect(sendLandingVisit).not.toHaveBeenCalled();
  });

  it("sends nothing after a member signs out within the same page load", () => {
    loggedIn = true;
    const { rerender } = renderHook(() => useLandingVisitBeacon(), {
      wrapper: landingWrapper,
    });
    expect(sendLandingVisit).not.toHaveBeenCalled();
    loggedIn = false;
    rerender();
    expect(sendLandingVisit).not.toHaveBeenCalled();
  });

  it("sends nothing from an automated browser", () => {
    stubWebdriver(true);
    renderHook(() => useLandingVisitBeacon(), { wrapper: landingWrapper });
    expect(sendLandingVisit).not.toHaveBeenCalled();
  });
});
