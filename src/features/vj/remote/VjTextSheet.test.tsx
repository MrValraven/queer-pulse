import type { ReactElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { VjOverlay } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import type { VjCommandOutcome } from "../live/vjStageCommands";
import { VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY } from "../vj.constants";
import type { useVjCommandRunner } from "./useVjCommandRunner";
import { VjTextSheet } from "./VjTextSheet";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

const OK_OUTCOME: VjCommandOutcome = { ok: true, revision: 4, isNoop: false };
/** One emoji: one code point, two UTF-16 units. */
const PARTY_POPPER = String.fromCodePoint(0x1f389);
const HIDDEN_OVERLAY: VjOverlay = { text: "", style: "big", isVisible: false };

/** A fake runner: a mock to assert on, typed as the runner's generic `run`. */
function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome));
}

function renderInStage(ui: ReactElement) {
  return render(
    <TestProviders>
      <LazyMotion features={domMax}>{ui}</LazyMotion>
    </TestProviders>,
  );
}

function renderTextSheet(run: VjRun, overlay: VjOverlay = HIDDEN_OVERLAY) {
  renderInStage(
    <VjTextSheet
      overlay={overlay}
      run={run}
      isBlocked={false}
      onClose={() => {}}
    />,
  );
  return screen.getByRole("textbox", { name: "Text" });
}

function storedLines(): unknown {
  const raw = window.localStorage.getItem(VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

/** Clicks, then lets the command's promise settle inside act. */
async function clickAndSettle(element: HTMLElement) {
  fireEvent.click(element);
  await act(() => Promise.resolve());
}

describe("VjTextSheet", () => {
  beforeEach(() => {
    window.localStorage.removeItem(VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY);
  });

  it("shows a line in the chosen style and remembers it", async () => {
    const run = createRun();
    const input = renderTextSheet(run);
    fireEvent.change(input, { target: { value: "  Happy Pride  " } });
    fireEvent.click(screen.getByRole("button", { name: "Ticker" }));
    expect(screen.getByRole("button", { name: "Ticker" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await clickAndSettle(screen.getByRole("button", { name: "Show text" }));
    expect(run).toHaveBeenCalledWith("setOverlay", {
      text: "Happy Pride",
      style: "ticker",
      isVisible: true,
    });
    expect(
      await screen.findByRole("button", {
        name: "Show Happy Pride on the screen",
      }),
    ).toBeInTheDocument();
    expect(storedLines()).toEqual(["Happy Pride"]);
  });

  it("counts characters as the server does", async () => {
    const run = createRun();
    const input = renderTextSheet(run);
    fireEvent.change(input, { target: { value: PARTY_POPPER } });
    expect(screen.getByText("79 characters left")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: PARTY_POPPER.repeat(80) } });
    expect(screen.getByText("0 characters left")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show text" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );

    fireEvent.change(input, { target: { value: "a".repeat(81) } });
    const showButton = screen.getByRole("button", { name: "Show text" });
    expect(showButton).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText("Text on screen can be up to 80 characters"),
    ).toBeInTheDocument();
    await clickAndSettle(showButton);
    expect(run).not.toHaveBeenCalled();
  });

  it("turns pasted line breaks into spaces", () => {
    const input = renderTextSheet(createRun());
    fireEvent.change(input, {
      target: { value: "Last call\nfor drinks\r\nat the bar\ttonight" },
    });
    expect(input).toHaveValue("Last call for drinks  at the bar tonight");
  });

  it("reuses a recent line in one tap", async () => {
    window.localStorage.setItem(
      VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY,
      JSON.stringify(["Last call", "Welcome in"]),
    );
    const run = createRun();
    renderTextSheet(run);
    await clickAndSettle(
      screen.getByRole("button", { name: "Show Welcome in on the screen" }),
    );
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith("setOverlay", {
      text: "Welcome in",
      style: "big",
      isVisible: true,
    });
    expect(storedLines()).toEqual(["Welcome in", "Last call"]);
  });

  it("hides the text", async () => {
    const run = createRun();
    renderTextSheet(run, {
      text: "Happy Pride",
      style: "big",
      isVisible: true,
    });
    expect(
      screen.getByRole("button", { name: "Update text" }),
    ).toBeInTheDocument();
    await clickAndSettle(screen.getByRole("button", { name: "Hide text" }));
    expect(run).toHaveBeenCalledWith("setOverlay", { isVisible: false });
  });

  it("names a refused line", async () => {
    const run = createRun({
      ok: false,
      code: "vj_overlay_text_invalid",
      errorKey: "vj:error.socket.overlayTextInvalid",
    });
    const input = renderTextSheet(run);
    fireEvent.change(input, { target: { value: "Doors at ten" } });
    await clickAndSettle(screen.getByRole("button", { name: "Show text" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Text on screen fits on one line, with no line breaks or hidden characters",
    );
    expect(storedLines()).toBeNull();
  });
});
