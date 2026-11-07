import type { ReactElement } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import {
  createVjStageState,
  type VjCountdown,
  type VjLogo,
  type VjOverlay,
} from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY } from "../../../vj.constants";
import { VjTextOnScreenSheet, type VjRun } from "./VjTextOnScreenSheet";

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 4,
  isNoop: false,
  applyAt: null,
};

const DEFAULT_STATE = createVjStageState("text-sheet", 0);

/** 6 November 2026, 21:00:00 on the test machine's own clock. */
const NINE_PM = new Date(2026, 10, 6, 21, 0, 0, 0).getTime();

function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome)) as unknown as VjRun &
    Mock<() => Promise<VjCommandOutcome>>;
}

async function renderSheet(
  run: VjRun,
  overrides: {
    overlay?: Partial<VjOverlay>;
    countdown?: Partial<VjCountdown>;
    logo?: Partial<VjLogo>;
  } = {},
) {
  const ui: ReactElement = (
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjTextOnScreenSheet
          overlay={{ ...DEFAULT_STATE.overlay, ...overrides.overlay }}
          countdown={{ ...DEFAULT_STATE.countdown, ...overrides.countdown }}
          logo={{ ...DEFAULT_STATE.logo, ...overrides.logo }}
          serverNow={() => NINE_PM}
          run={run}
          isBlocked={false}
          onClose={() => {}}
        />
      </LazyMotion>
    </TestProviders>
  );
  const renderedView = render(ui);
  await awaitCatalog("vj");
  return renderedView;
}

/** Clicks, then lets the command's promise settle inside act. */
async function clickAndSettle(element: HTMLElement) {
  fireEvent.click(element);
  await act(() => Promise.resolve());
}

function typeLine(text: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Text" }), {
    target: { value: text },
  });
}

describe("VjTextOnScreenSheet", () => {
  beforeEach(() => {
    window.localStorage.removeItem(VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY);
    vi.spyOn(Date, "now").mockReturnValue(NINE_PM);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Show text sends text, style, position, size and colour", async () => {
    const run = createRun();
    await renderSheet(run);
    typeLine("  Welcome in  ");
    fireEvent.click(screen.getByRole("button", { name: "Neon" }));
    fireEvent.click(screen.getByRole("button", { name: "Top" }));
    fireEvent.click(screen.getByRole("button", { name: "Extra large" }));
    fireEvent.click(screen.getByRole("button", { name: "Jade" }));
    expect(screen.getByRole("button", { name: "Jade" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await clickAndSettle(screen.getByRole("button", { name: "Show text" }));
    expect(run).toHaveBeenCalledWith("setOverlay", {
      text: "Welcome in",
      style: "neon",
      position: "top",
      size: "xl",
      colorToken: "jade",
      hideAfterMs: null,
      isVisible: true,
    });
  });

  it("auto hide after 30 s sends hideAfterMs 30000", async () => {
    const run = createRun();
    await renderSheet(run);
    typeLine("Last call");
    fireEvent.click(screen.getByRole("button", { name: "30 s" }));
    await clickAndSettle(screen.getByRole("button", { name: "Show text" }));
    expect(run).toHaveBeenCalledWith(
      "setOverlay",
      expect.objectContaining({ hideAfterMs: 30_000, isVisible: true }),
    );
  });

  it("Keep showing sends hideAfterMs null", async () => {
    const run = createRun();
    await renderSheet(run);
    typeLine("Last call");
    fireEvent.click(screen.getByRole("button", { name: "1 min" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep showing" }));
    await clickAndSettle(screen.getByRole("button", { name: "Show text" }));
    expect(run).toHaveBeenCalledWith(
      "setOverlay",
      expect.objectContaining({ hideAfterMs: null }),
    );
  });

  it("Hide text sends isVisible false", async () => {
    const run = createRun();
    await renderSheet(run, {
      overlay: { text: "Welcome in", isVisible: true },
    });
    expect(
      screen.getByRole("button", { name: "Update text" }),
    ).toBeInTheDocument();
    await clickAndSettle(screen.getByRole("button", { name: "Hide text" }));
    expect(run).toHaveBeenCalledWith("setOverlay", { isVisible: false });
  });

  it("counts down while auto-hide runs", async () => {
    await renderSheet(createRun(), {
      overlay: {
        text: "Welcome in",
        isVisible: true,
        hideAt: NINE_PM + 24_000,
      },
    });
    expect(screen.getByText("Hides in 24 s")).toBeInTheDocument();
  });

  it("a countdown 10 minutes out sends durationMs 600000", async () => {
    const run = createRun();
    await renderSheet(run);
    fireEvent.click(screen.getByRole("button", { name: "Countdown" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Label" }), {
      target: { value: "Doors close in " },
    });
    fireEvent.click(screen.getByRole("button", { name: "10 minutes" }));
    await clickAndSettle(
      screen.getByRole("button", { name: "Show countdown" }),
    );
    expect(run).toHaveBeenCalledWith("setCountdown", {
      isVisible: true,
      durationMs: 600_000,
      label: "Doors close in",
    });
  });

  it("an end time later today sends the time left", async () => {
    const run = createRun();
    await renderSheet(run);
    fireEvent.click(screen.getByRole("button", { name: "Countdown" }));
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "21:45" },
    });
    await clickAndSettle(
      screen.getByRole("button", { name: "Show countdown" }),
    );
    expect(run).toHaveBeenCalledWith(
      "setCountdown",
      expect.objectContaining({ durationMs: 45 * 60_000 }),
    );
  });

  it("an end time already past names it and sends nothing", async () => {
    const run = createRun();
    await renderSheet(run);
    fireEvent.click(screen.getByRole("button", { name: "Countdown" }));
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "20:30" },
    });
    await clickAndSettle(
      screen.getByRole("button", { name: "Show countdown" }),
    );
    expect(run).not.toHaveBeenCalled();
    expect(
      within(screen.getByRole("dialog")).getByRole("alert"),
    ).toHaveTextContent("Pick a time later today");
  });

  it("Show logo sends the corner", async () => {
    const run = createRun();
    await renderSheet(run);
    fireEvent.click(screen.getByRole("button", { name: "Logo" }));
    fireEvent.click(screen.getByRole("button", { name: "Top left" }));
    await clickAndSettle(screen.getByRole("button", { name: "Show logo" }));
    expect(run).toHaveBeenCalledWith("setLogo", {
      isVisible: true,
      corner: "topLeft",
    });
  });

  it("a shown logo moves corners at once", async () => {
    const run = createRun();
    await renderSheet(run, {
      logo: { isVisible: true, corner: "bottomRight" },
    });
    await clickAndSettle(screen.getByRole("button", { name: "Top right" }));
    expect(run).toHaveBeenCalledWith("setLogo", { corner: "topRight" });
  });

  it("a refusal shows its named reason", async () => {
    const run = createRun({
      ok: false,
      code: "vj_overlay_hide_out_of_range",
      errorKey: "vj:error.socket.overlayHideOutOfRange",
    });
    await renderSheet(run);
    typeLine("Last call");
    await clickAndSettle(screen.getByRole("button", { name: "Show text" }));
    expect(
      await within(screen.getByRole("dialog")).findByRole("alert"),
    ).toHaveTextContent("Auto-hide works from 1 second to 10 minutes");
  });

  it("holds every send while blocked", async () => {
    const run = createRun();
    render(
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjTextOnScreenSheet
            overlay={{ ...DEFAULT_STATE.overlay, text: "Welcome in" }}
            countdown={DEFAULT_STATE.countdown}
            logo={DEFAULT_STATE.logo}
            serverNow={() => NINE_PM}
            run={run}
            isBlocked
            onClose={() => {}}
          />
        </LazyMotion>
      </TestProviders>,
    );
    await awaitCatalog("vj");
    const showButton = screen.getByRole("button", { name: "Show text" });
    expect(showButton).toHaveAttribute("aria-disabled", "true");
    await clickAndSettle(showButton);
    expect(run).not.toHaveBeenCalled();
  });
});
