import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../app/providers/I18nProvider";
import { openPdfFile } from "./io/openPdfFile";
import type { OpenedPdf } from "./io/openPdfFile";
import { PdfToolkitPage } from "./PdfToolkitPage";

vi.mock("../../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("./io/openPdfFile");
vi.mock("./sources/thumbnailRenderer", () => ({
  THUMBNAIL_RENDER_WIDTH_PX: 320,
  renderPdfjsThumbnail: vi.fn(() => Promise.resolve(new Blob())),
}));

const DROP_TITLE = "Drop PDFs here or choose files";

/** The pdfjs half of a fake opened PDF: closing goes through its loading task. */
function fakePdfjsDocument() {
  return { loadingTask: { destroy: vi.fn(() => Promise.resolve()) } };
}

let pdfjsDocument = fakePdfjsDocument();

function signedTwoPageFile(): OpenedPdf {
  return {
    pageCount: 2,
    isSigned: true,
    isLarge: false,
    pdfLibDocument: {},
    pdfjsDocument,
  } as unknown as OpenedPdf;
}

function renderPage() {
  const user = userEvent.setup();
  render(
    <I18nProvider>
      <MemoryRouter>
        <PdfToolkitPage />
      </MemoryRouter>
    </I18nProvider>,
  );
  return { user };
}

async function openSignedFile(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText(DROP_TITLE);
  const pdf = new File(["%PDF-1.7"], "contract.pdf", {
    type: "application/pdf",
  });
  await user.upload(screen.getByLabelText("PDF files"), pdf);
  await screen.findByRole("button", { name: "Page 1" });
}

/** The selection bar may hold a compact copy of Remove pages for phones. */
async function removeSelectedPages(user: ReturnType<typeof userEvent.setup>) {
  const [removePages] = screen.getAllByRole("button", { name: "Remove pages" });
  if (!removePages) throw new Error("Remove pages is missing");
  await user.click(removePages);
}

/** Start over waits while a file is still opening, so the click waits too. */
async function clickStartOver(user: ReturnType<typeof userEvent.setup>) {
  const startOver = screen.getByRole("button", { name: "Start over" });
  await waitFor(() => expect(startOver).toBeEnabled());
  await user.click(startOver);
}

describe("PdfToolkitPage", () => {
  beforeEach(() => {
    pdfjsDocument = fakePdfjsDocument();
    vi.mocked(openPdfFile).mockReset();
    vi.mocked(openPdfFile).mockImplementation(() =>
      Promise.resolve(signedTwoPageFile()),
    );
  });

  it("starts on the drop zone with the privacy line", async () => {
    renderPage();
    expect(await screen.findByText(DROP_TITLE)).toBeInTheDocument();
    expect(
      screen.getByText("Files stay on this device and are never uploaded"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choose PDFs" }),
    ).toBeInTheDocument();
  });

  it("shows the grid and the file once a PDF opens", async () => {
    const { user } = renderPage();
    await openSignedFile(user);

    expect(openPdfFile).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument();
    expect(screen.getByText("contract.pdf")).toBeInTheDocument();
    expect(
      screen.getByText(/This PDF is digitally signed/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download PDF" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(DROP_TITLE)).not.toBeInTheDocument(),
    );
  });

  it("asks before starting over and clears everything on confirm", async () => {
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    const { user } = renderPage();
    await openSignedFile(user);

    await clickStartOver(user);
    const dialog = await screen.findByRole("dialog", { name: "Start over?" });
    expect(dialog).toBeInTheDocument();
    expect(pdfjsDocument.loadingTask.destroy).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Close files and start over" }),
    );

    expect(await screen.findByText(DROP_TITLE)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Page 1" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByText("contract.pdf")).not.toBeInTheDocument();
    expect(pdfjsDocument.loadingTask.destroy).toHaveBeenCalledTimes(1);
    // The dialog's scroll lock restores the old spot as it unmounts, so the
    // climb to the top has to come after that restore to stick.
    await waitFor(() =>
      expect(scrollTo).toHaveBeenLastCalledWith({
        top: 0,
        behavior: "smooth",
      }),
    );
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
    scrollTo.mockRestore();
  });

  it("moves focus to the page that took the removed page's place", async () => {
    const { user } = renderPage();
    await openSignedFile(user);

    await user.click(screen.getByRole("button", { name: "Page 2" }));
    await removeSelectedPages(user);

    const pageOne = screen.getByRole("button", { name: "Page 1" });
    await waitFor(() => expect(pageOne).toHaveFocus());
  });

  it("keeps undo shortcuts off while the start over dialog asks", async () => {
    const { user } = renderPage();
    await openSignedFile(user);
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    await removeSelectedPages(user);

    await clickStartOver(user);
    await screen.findByRole("dialog", { name: "Start over?" });
    await user.keyboard("{Control>}z{/Control}");
    await user.click(screen.getByRole("button", { name: "Keep editing" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Start over?" }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Page 2" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps the files open when the start over is cancelled", async () => {
    const { user } = renderPage();
    await openSignedFile(user);

    await clickStartOver(user);
    await screen.findByRole("dialog", { name: "Start over?" });
    await user.click(screen.getByRole("button", { name: "Keep editing" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Start over?" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument();
    expect(pdfjsDocument.loadingTask.destroy).not.toHaveBeenCalled();
  });
});
