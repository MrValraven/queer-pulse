import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DeviceFrame } from "./DeviceFrame";

// The "simulations" i18n namespace loads lazily, so translated text (the
// loading/error overlays) only appears after that chunk resolves. `findBy*`
// (not `getBy*`) waits for it; the iframe's title comes straight from a
// prop, not translation, so it is present synchronously.
function renderFrame(node: ReactNode) {
  return render(<I18nProvider>{node}</I18nProvider>);
}

describe("DeviceFrame", () => {
  it("renders a sandbox-tagged iframe with the given src and title", () => {
    renderFrame(
      <DeviceFrame
        src="/invite?sandbox=1"
        title="Join QueerPulse"
        device="desktop"
      />,
    );
    const frame = screen.getByTitle("Join QueerPulse") as HTMLIFrameElement;
    expect(frame.tagName).toBe("IFRAME");
    expect(frame.getAttribute("src")).toBe("/invite?sandbox=1");
    expect(frame.getAttribute("data-sandbox")).toBe("1");
  });

  it("shows a loading overlay until the iframe loads", async () => {
    renderFrame(
      <DeviceFrame src="/invite?sandbox=1" title="Join" device="desktop" />,
    );
    expect(await screen.findByText(/loading simulation/i)).toBeInTheDocument();
    const frame = screen.getByTitle("Join");
    fireEvent.load(frame);
    await waitFor(() =>
      expect(screen.queryByText(/loading simulation/i)).not.toBeInTheDocument(),
    );
  });

  it("shows an error message if the iframe fails to load", async () => {
    renderFrame(
      <DeviceFrame src="/invite?sandbox=1" title="Broken" device="desktop" />,
    );
    // Wait for the lazy "simulations" namespace BEFORE firing the error:
    // until it resolves `t()` returns the raw key, so the overlay is on
    // screen but reads "simulations:player.loadError" and no text matcher
    // for the real copy can match it.
    await screen.findByText(/loading simulation/i);
    const frame = screen.getByTitle("Broken");
    fireEvent.error(frame);
    expect(await screen.findByText(/could not load/i)).toBeInTheDocument();
  });

  it("calls onEscape when Escape is pressed inside the frame", () => {
    const onEscape = vi.fn();
    renderFrame(
      <DeviceFrame
        src="/x?sandbox=1"
        title="X"
        device="desktop"
        onEscape={onEscape}
      />,
    );
    const frame = screen.getByTitle("X") as HTMLIFrameElement;
    fireEvent.load(frame);
    // same-origin contentWindow receives the keydown
    const frameWindow = frame.contentWindow;
    if (!frameWindow) throw new Error("expected a contentWindow");
    frameWindow.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
