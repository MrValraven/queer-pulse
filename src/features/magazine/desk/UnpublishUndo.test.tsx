import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import {
  UNPUBLISH_FLOW_PIECE_TITLE,
  UNPUBLISH_FLOW_PUBLISHED_AT,
  makePublishedPiece,
} from "./unpublishFlowFixtures";
import { UnpublishFlowHarness } from "./unpublishFlowHarness";

/**
 * The Undo button on the unpublish success toast, end to end through the
 * confirm dialog and the real toast stack. Live mode, senders stubbed.
 */

const apiMocks = vi.hoisted(() => ({
  unpublishPiece: vi.fn(),
  publishPiece: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("../api/useMagazineWriters", () => ({
  useMagazineWriters: () => ({ writers: [], isLoading: false, isError: false }),
}));

vi.mock("../api/piecePublish.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/piecePublish.api")>()),
  unpublishPiece: apiMocks.unpublishPiece,
  publishPiece: apiMocks.publishPiece,
}));

/** Renders a Published row, unpublishes it to draft and waits for the toast. */
async function unpublishToDraft(
  piece = makePublishedPiece(),
  queryClient?: QueryClient,
) {
  render(
    <TestProviders queryClient={queryClient}>
      <UnpublishFlowHarness piece={piece} surface="board" />
    </TestProviders>,
  );
  await awaitCatalog("magazine");
  fireEvent.click(
    await screen.findByRole("button", { name: "Unpublish to draft" }),
  );
  const dialog = await screen.findByRole("dialog");
  const confirm = Array.from(dialog.querySelectorAll("button")).find(
    (button) => button.textContent === "Unpublish to draft",
  ) as HTMLElement;
  fireEvent.click(confirm);
  return screen.findByRole("button", { name: "Undo" });
}

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  apiMocks.unpublishPiece.mockReset().mockResolvedValue({});
  apiMocks.publishPiece.mockReset();
});

describe("unpublish toast Undo", () => {
  it("shows the success toast with its detail line and an Undo button", async () => {
    const undoButton = await unpublishToDraft();

    expect(undoButton).toBeInTheDocument();
    expect(
      screen.getByText(`Back in draft: ${UNPUBLISH_FLOW_PIECE_TITLE}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText("It is no longer live on the site."),
    ).toBeInTheDocument();
    expect(apiMocks.publishPiece).not.toHaveBeenCalled();
  });

  it("republishes at the original publish instant, refreshes the desk and confirms", async () => {
    apiMocks.publishPiece.mockResolvedValue({});
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const undoButton = await unpublishToDraft(undefined, queryClient);
    invalidateSpy.mockClear();

    fireEvent.click(undoButton);

    await waitFor(() =>
      expect(apiMocks.publishPiece).toHaveBeenCalledWith("piece-1", {
        publishedAt: UNPUBLISH_FLOW_PUBLISHED_AT,
      }),
    );
    expect(
      await screen.findByText(
        `Back on the site: ${UNPUBLISH_FLOW_PIECE_TITLE}`,
      ),
    ).toBeInTheDocument();
    expect(
      invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey),
    ).toEqual(
      expect.arrayContaining([
        ["magazine-piece", "piece-1"],
        ["magazine-pieces"],
        ["magazine-issue-production"],
        ["magazine-desk-summary"],
      ]),
    );
  });

  it("omits the date when the piece had none", async () => {
    apiMocks.publishPiece.mockResolvedValue({});
    const undoButton = await unpublishToDraft(
      makePublishedPiece({ publishedAt: undefined }),
    );

    fireEvent.click(undoButton);

    await waitFor(() =>
      expect(apiMocks.publishPiece).toHaveBeenCalledWith("piece-1", {}),
    );
  });

  it("names the open care items when the care gate refuses the undo", async () => {
    apiMocks.publishPiece.mockRejectedValue(
      new ApiError(400, "Care gate open", {
        code: "magazine_care_gate_open",
        message: "Care gate open",
        openGateItems: ["Consent for the portrait", "Sensitivity read"],
      }),
    );
    const undoButton = await unpublishToDraft();

    fireEvent.click(undoButton);

    expect(
      await screen.findByText(
        `Could not put ${UNPUBLISH_FLOW_PIECE_TITLE} back on the site`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Held by the care gate: Consent for the portrait; Sensitivity read.",
      ),
    ).toBeInTheDocument();
  });

  it("names the readiness items when the piece is not ready", async () => {
    apiMocks.publishPiece.mockRejectedValue(
      new ApiError(400, "Not ready", {
        code: "magazine_publish_not_ready",
        message: "Not ready",
        openGateItems: ["Add a standfirst."],
      }),
    );
    const undoButton = await unpublishToDraft();

    fireEvent.click(undoButton);

    expect(
      await screen.findByText("Not ready to publish yet. Add a standfirst."),
    ).toBeInTheDocument();
  });

  it("names the server's own message for any other refusal", async () => {
    apiMocks.publishPiece.mockRejectedValue(
      new ApiError(409, "Another editor already republished this piece.", {}),
    );
    const undoButton = await unpublishToDraft();

    fireEvent.click(undoButton);

    expect(
      await screen.findByText("Another editor already republished this piece."),
    ).toBeInTheDocument();
  });
});
