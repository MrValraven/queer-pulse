import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VisitorPreviewContext } from "../../../shared/components/layout/visitorPreviewContext";
import type { LandingVisitPage } from "./landingVisitBeacon";
import {
  resetLandingVisitBeaconForTests,
  useLandingVisitBeacon,
} from "./useLandingVisitBeacon";

let demoMode = false;
let loggedIn = false;
let checking = false;
const sendLandingVisit =
  vi.fn<(source: string, page?: LandingVisitPage) => Promise<void>>();

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn, checking }),
}));
vi.mock("./landingVisitBeacon", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./landingVisitBeacon")>()),
  sendLandingVisit: (source: string, page?: LandingVisitPage) =>
    sendLandingVisit(source, page),
}));

function wrapperAt(pathname: string) {
  return function PathWrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>;
  };
}

/** A staffer's visitor preview: the context flag `VisitorPreview` sets. */
function previewWrapperAt(pathname: string) {
  const PathWrapper = wrapperAt(pathname);
  return function PreviewWrapper({ children }: { children: ReactNode }) {
    return (
      <PathWrapper>
        <VisitorPreviewContext.Provider value>
          {children}
        </VisitorPreviewContext.Provider>
      </PathWrapper>
    );
  };
}

const landingWrapper = wrapperAt("/");

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
    expect(sendLandingVisit).toHaveBeenCalledWith("direct", "home");
  });

  it("sends the utm_source of the current URL", () => {
    window.history.replaceState(null, "", "/?utm_source=Newsletter");
    renderHook(() => useLandingVisitBeacon(), { wrapper: landingWrapper });
    expect(sendLandingVisit).toHaveBeenCalledWith("newsletter", "home");
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
  it("counts a signed-out visitor on /studio once, as the studio page", () => {
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio"),
    });
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio"),
    });
    expect(sendLandingVisit).toHaveBeenCalledTimes(1);
    expect(sendLandingVisit).toHaveBeenCalledWith("direct", "studio");
  });

  it("counts /studio/ with a trailing slash as the studio page", () => {
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio/"),
    });
    expect(sendLandingVisit).toHaveBeenCalledTimes(1);
    expect(sendLandingVisit).toHaveBeenCalledWith("direct", "studio");
  });

  it("counts home and studio once each in one page load", () => {
    renderHook(() => useLandingVisitBeacon(), { wrapper: wrapperAt("/") });
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio"),
    });
    expect(sendLandingVisit.mock.calls).toEqual([
      ["direct", "home"],
      ["direct", "studio"],
    ]);
  });

  it.each([
    [
      "a member",
      () => {
        loggedIn = true;
      },
    ],
    [
      "demo mode",
      () => {
        demoMode = true;
      },
    ],
    ["an automated browser", () => stubWebdriver(true)],
  ])("never counts /studio for %s", (_label, arrange) => {
    arrange();
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio"),
    });
    expect(sendLandingVisit).not.toHaveBeenCalled();
  });

  it("never counts a staffer's visitor preview of /studio, and closes counting for the load", () => {
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: previewWrapperAt("/studio"),
    });
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio"),
    });
    expect(sendLandingVisit).not.toHaveBeenCalled();
  });

  it("a member opening /studio closes that page and leaves home open", () => {
    loggedIn = true;
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio"),
    });
    loggedIn = false;
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio"),
    });
    renderHook(() => useLandingVisitBeacon(), { wrapper: wrapperAt("/") });
    expect(sendLandingVisit.mock.calls).toEqual([["direct", "home"]]);
  });

  it("waits for the session check on /studio", () => {
    checking = true;
    const { rerender } = renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio"),
    });
    expect(sendLandingVisit).not.toHaveBeenCalled();
    checking = false;
    rerender();
    expect(sendLandingVisit).toHaveBeenCalledTimes(1);
  });

  it("does nothing for the studio page on another path", () => {
    renderHook(() => useLandingVisitBeacon("studio"), {
      wrapper: wrapperAt("/studio/about"),
    });
    expect(sendLandingVisit).not.toHaveBeenCalled();
  });
});

describe("sendLandingVisit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the source and the page without credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null));
    vi.stubGlobal("fetch", fetchMock);
    const { sendLandingVisit: realSendLandingVisit } = await vi.importActual<
      typeof import("./landingVisitBeacon")
    >("./landingVisitBeacon");
    await realSendLandingVisit("direct", "studio");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/landing\/visits$/);
    expect(init.body).toBe('{"source":"direct","page":"studio"}');
    expect(init.credentials).toBe("omit");
  });

  it("defaults the page to home", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null));
    vi.stubGlobal("fetch", fetchMock);
    const { sendLandingVisit: realSendLandingVisit } = await vi.importActual<
      typeof import("./landingVisitBeacon")
    >("./landingVisitBeacon");
    await realSendLandingVisit("direct");
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe('{"source":"direct","page":"home"}');
  });
});
