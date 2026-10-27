import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../../app/providers/I18nProvider";
import { PdfOutputBar } from "./PdfOutputBar";

type PdfOutputBarProps = ComponentProps<typeof PdfOutputBar>;

const onExport = vi.fn();
const onStartOver = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

function barWith(overrides: Partial<PdfOutputBarProps>) {
  return (
    <I18nProvider>
      <PdfOutputBar
        chunkCount={1}
        busyKind={null}
        isStartOverDisabled={false}
        onExport={onExport}
        onStartOver={onStartOver}
        {...overrides}
      />
    </I18nProvider>
  );
}

/** Renders the bar; `rerenderWith` swaps in the props a press would bring. */
function renderBar(overrides: Partial<PdfOutputBarProps> = {}) {
  const view = render(barWith(overrides));
  return {
    rerenderWith: (nextOverrides: Partial<PdfOutputBarProps>) =>
      view.rerender(barWith({ ...overrides, ...nextOverrides })),
  };
}

describe("PdfOutputBar", () => {
  it("keeps Split into files off until a cut exists", async () => {
    renderBar({ chunkCount: 1 });
    const split = await screen.findByRole("button", {
      name: "Split into files",
    });
    expect(split).toBeDisabled();
    expect(split).toHaveAccessibleDescription(
      "Add a split between two pages to turn this on",
    );
    await userEvent.setup().click(split);
    expect(onExport).not.toHaveBeenCalled();
  });

  it("names the part count once cuts exist", async () => {
    renderBar({ chunkCount: 3 });
    const split = await screen.findByRole("button", {
      name: "Split into 3 files",
    });
    expect(split).toBeEnabled();
    expect(split).not.toHaveAttribute("aria-describedby");
    await userEvent.setup().click(split);
    expect(onExport).toHaveBeenCalledWith("split");
  });

  it("exports a single PDF and each page", async () => {
    const user = userEvent.setup();
    renderBar({ chunkCount: 1 });
    await user.click(
      await screen.findByRole("button", { name: "Download PDF" }),
    );
    expect(onExport).toHaveBeenCalledWith("single");
    await user.click(
      screen.getByRole("button", { name: "Download each page as a file" }),
    );
    expect(onExport).toHaveBeenCalledWith("every-page");
    expect(onExport).toHaveBeenCalledTimes(2);
  });

  it("holds every output while a file is building", async () => {
    renderBar({ chunkCount: 3, busyKind: "single" });
    const download = await screen.findByRole("button", {
      name: "Download PDF",
    });
    const split = screen.getByRole("button", { name: "Split into 3 files" });
    const everyPage = screen.getByRole("button", {
      name: "Download each page as a file",
    });
    for (const output of [download, split, everyPage]) {
      // Off for assistive tech and the pointer, still reachable by keyboard.
      expect(output).toHaveAttribute("aria-disabled", "true");
      expect(output).toBeEnabled();
    }
    expect(screen.getByText("Building your file…")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(download);
    await user.click(split);
    await user.click(everyPage);
    expect(onExport).not.toHaveBeenCalled();
  });

  it("keeps focus on the pressed output while its file builds", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderBar({ chunkCount: 1 });
    const download = await screen.findByRole("button", {
      name: "Download PDF",
    });
    await user.click(download);
    expect(onExport).toHaveBeenCalledWith("single");
    rerenderWith({ busyKind: "single" });
    expect(download).toHaveFocus();
    expect(download).toHaveAttribute("aria-disabled", "true");
    rerenderWith({ busyKind: null });
    expect(download).toHaveFocus();
    expect(download).not.toHaveAttribute("aria-disabled");
  });

  it("starts over when Start over is pressed", async () => {
    renderBar({ isStartOverDisabled: false });
    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: "Start over" }));
    expect(onStartOver).toHaveBeenCalledTimes(1);
  });

  it("disables Start over when the page asks for it", async () => {
    renderBar({ isStartOverDisabled: true });
    expect(
      await screen.findByRole("button", { name: "Start over" }),
    ).toBeDisabled();
  });
});
