import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../../app/providers/I18nProvider";
import {
  appendFilePages,
  type OpenedFileInfo,
  type PageItem,
} from "../model/pdfEditModel";
import { PdfPageGrid, type PdfPageGridProps } from "./PdfPageGrid";

const FILE_ID = "file-1";

const fileOne: OpenedFileInfo = {
  id: FILE_ID,
  name: "a.pdf",
  pageCount: 4,
  toneIndex: 0,
  isSigned: false,
  isLarge: false,
};

/** Four pages of one file, ids file-1:0 to file-1:3. */
const fourPages = appendFilePages([], FILE_ID, 4);

function withCutAfter(
  pages: readonly PageItem[],
  pageId: string,
): readonly PageItem[] {
  return pages.map((page) =>
    page.id === pageId ? { ...page, hasCutAfter: true } : page,
  );
}

function pageAt(pages: readonly PageItem[], index: number): PageItem {
  const page = pages[index];
  if (!page) throw new Error(`No page at index ${index}`);
  return page;
}

function renderGrid(overrides: Partial<PdfPageGridProps> = {}) {
  const handlers = {
    onTogglePage: vi.fn<(pageId: string) => void>(),
    onSelectRange: vi.fn<(pageId: string) => void>(),
    onMovePage: vi.fn<(pageId: string, toIndex: number) => void>(),
    onToggleCut: vi.fn<(pageId: string) => void>(),
  };
  const props: PdfPageGridProps = {
    pages: fourPages,
    filesById: new Map([[FILE_ID, fileOne]]),
    isMultiFile: false,
    selectedIds: new Set<string>(),
    renderThumbnail: () => <span />,
    ...handlers,
    ...overrides,
  };
  const user = userEvent.setup();
  const view = render(
    <I18nProvider>
      <PdfPageGrid {...props} />
    </I18nProvider>,
  );
  const rerenderGrid = (changes: Partial<PdfPageGridProps>) =>
    view.rerender(
      <I18nProvider>
        <PdfPageGrid {...props} {...changes} />
      </I18nProvider>,
    );
  return { ...handlers, user, rerenderGrid };
}

describe("PdfPageGrid", () => {
  it("toggles a page on click and selects a range on shift-click", async () => {
    const { user, onTogglePage, onSelectRange } = renderGrid();
    await user.click(await screen.findByRole("button", { name: "Page 2" }));
    expect(onTogglePage).toHaveBeenCalledWith("file-1:1");

    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("button", { name: "Page 4" }));
    await user.keyboard("{/Shift}");

    expect(onSelectRange).toHaveBeenCalledWith("file-1:3");
    expect(onTogglePage).toHaveBeenCalledTimes(1);
  });

  it("selects the focused page with Space", async () => {
    const { user, onTogglePage } = renderGrid();
    (await screen.findByRole("button", { name: "Page 3" })).focus();
    await user.keyboard(" ");
    expect(onTogglePage).toHaveBeenCalledWith("file-1:2");
  });

  it("marks selected pages as pressed", async () => {
    renderGrid({ selectedIds: new Set(["file-1:0"]) });
    expect(
      await screen.findByRole("button", { name: "Page 1" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("offers a split after every page but the last", async () => {
    renderGrid();
    expect(
      await screen.findAllByRole("button", { name: /^Split after page/ }),
    ).toHaveLength(3);
    expect(
      screen.queryByRole("button", { name: "Split after page 4" }),
    ).toBeNull();
  });

  it("toggles a cut and shows it as pressed", async () => {
    const { user, onToggleCut, rerenderGrid } = renderGrid();
    const splitButton = await screen.findByRole("button", {
      name: "Split after page 2",
    });
    expect(splitButton).toHaveAttribute("aria-pressed", "false");

    await user.click(splitButton);
    expect(onToggleCut).toHaveBeenCalledWith("file-1:1");

    rerenderGrid({ pages: withCutAfter(fourPages, "file-1:1") });
    expect(
      screen.getByRole("button", { name: "Remove the split after page 2" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("button", { name: "Split after page 2" }),
    ).toBeNull();
  });

  it("labels each part when a cut splits the pages", async () => {
    renderGrid({ pages: withCutAfter(fourPages, "file-1:1") });
    expect(await screen.findByText("Part 1")).toBeInTheDocument();
    expect(screen.getByText("Part 2")).toBeInTheDocument();
    expect(screen.queryByText("Part 3")).toBeNull();
  });

  it("describes the first page of each part with its part chip", async () => {
    renderGrid({ pages: withCutAfter(fourPages, "file-1:1") });
    expect(
      await screen.findByRole("button", { name: "Page 3" }),
    ).toHaveAccessibleDescription(/Part 2/);
    expect(
      screen.getByRole("button", { name: "Page 2" }),
    ).not.toHaveAccessibleDescription(/Part/);
  });

  it("tints each page with its file's tone", async () => {
    renderGrid();
    const firstPage = await screen.findByRole("button", { name: "Page 1" });
    expect(firstPage.closest("li")).toHaveAttribute("data-file-tone", "0");
  });

  it("shows no part label while the pages form one file", async () => {
    renderGrid();
    await screen.findByRole("button", { name: "Page 1" });
    expect(screen.queryByText("Part 1")).toBeNull();
  });

  it("brings back a cut stored on the last page once that page moves earlier", async () => {
    const pagesWithLastCut = withCutAfter(fourPages, "file-1:3");
    const { rerenderGrid } = renderGrid({ pages: pagesWithLastCut });
    await screen.findByRole("button", { name: "Page 4" });
    expect(
      screen.queryByRole("button", { name: /^Remove the split/ }),
    ).toBeNull();

    rerenderGrid({
      pages: [
        pageAt(pagesWithLastCut, 0),
        pageAt(pagesWithLastCut, 1),
        pageAt(pagesWithLastCut, 3),
        pageAt(pagesWithLastCut, 2),
      ],
    });
    expect(
      screen.getByRole("button", { name: "Remove the split after page 3" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Part 2")).toBeInTheDocument();
  });

  it("moves focus with the arrow keys, Home and End", async () => {
    const { user } = renderGrid();
    (await screen.findByRole("button", { name: "Page 1" })).focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveFocus();

    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveFocus();
  });

  it("describes the keyboard controls on the page list", async () => {
    renderGrid();
    expect(
      await screen.findByRole("list", { name: "Pages" }),
    ).toHaveAccessibleDescription(
      "Arrow keys move between pages and Space selects one",
    );
  });

  it("names the source file when more than one file is open", async () => {
    renderGrid({ isMultiFile: true });
    expect(
      await screen.findByRole("button", { name: "Page 1, from a.pdf" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Page 1" }),
    ).not.toBeInTheDocument();
  });

  it("does not move a page on a plain click", async () => {
    const { user, onMovePage } = renderGrid();
    await user.click(await screen.findByRole("button", { name: "Page 1" }));
    expect(onMovePage).not.toHaveBeenCalled();
  });
});
