import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ConnectionStatusBanner } from "./ConnectionStatusBanner";

/**
 * Messaging connection banner (audit P2-14). When the member is offline the open
 * thread shows an honest strip explaining messages will send on reconnect — so
 * an offline send that flips to `failed` is never silent. The banner is inert in
 * demo mode (no live socket exists there) and renders nothing while connected.
 *
 * `useDemoMode` and `useRealtime` are mocked so we can drive the live/offline
 * combination directly. The `reconnecting` state is time-gated (a 2.5s grace)
 * and left out here to keep the suite deterministic — offline is immediate.
 */

const state = vi.hoisted(() => ({ demoMode: false, connected: false }));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: state.demoMode }),
}));

vi.mock("../../shared/api/realtime", () => ({
  useRealtime: () => ({ connected: state.connected }),
}));

function setOnline(online: boolean) {
  Object.defineProperty(navigator, "onLine", {
    value: online,
    configurable: true,
  });
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

afterEach(() => {
  setOnline(true);
  state.demoMode = false;
  state.connected = false;
});

describe("ConnectionStatusBanner", () => {
  it("renders the offline strip when the browser is offline (live mode)", async () => {
    state.demoMode = false;
    state.connected = false;
    setOnline(false);

    render(<ConnectionStatusBanner />, { wrapper });

    // Copy is lazy-loaded (messages namespace), so await it.
    expect(
      await screen.findByText(/messages will send when you reconnect/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-status",
      "offline",
    );
  });

  it("renders nothing when connected and online", () => {
    state.demoMode = false;
    state.connected = true;
    setOnline(true);

    render(<ConnectionStatusBanner />, { wrapper });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("is inert in demo mode even when offline", () => {
    state.demoMode = true;
    state.connected = false;
    setOnline(false);

    render(<ConnectionStatusBanner />, { wrapper });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
